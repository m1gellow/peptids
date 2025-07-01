import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi';

import Button from '../ui/Button';
import OrderStatistics from './OrderStatistics';
import OrderFilters from './OrderFilters';
import MonthlyOrderGroup from './MonthlyOrderGroup';
import EmptyOrdersView from './EmptyOrdersView';
import { showNotification, showConfirmation } from '../../utils/telegramUtils';
import { 
  formatAmount, 
  orderStatuses, 
  calculateTotalSpent, 
  groupOrdersByMonth,
  canOrderBeCancelled,
  canRemoveItemsFromOrder
} from '../../utils/orderUtils';
import supabase from '../../lib/supabase';

/**
 * Основной компонент истории заказов
 * @param {Object} props - Свойства компонента
 * @param {Object} props.currentUser - Текущий пользователь
 */
const OrdersHistory = ({ currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояния для данных
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [orderGrowth, setOrderGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState({});
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);
  
  // Состояния UI
  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const timeoutRef = useRef(null);
  
  // Фильтры
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    sortBy: 'created_at',
    sortDirection: 'desc'
  });

  // Функция с debounce для загрузки заказов
  const debouncedLoadOrders = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      loadOrders();
    }, 800); // 800ms задержка
  }, [filters]);

  // Эффект для debounce загрузки при изменении фильтров
  useEffect(() => {
    debouncedLoadOrders();
    
    // Очистка таймаута при размонтировании
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedLoadOrders]);

  // Проверка URL-параметров для автоматического раскрытия заказа
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderIdParam = urlParams.get('order');
    
    if (orderIdParam) {
      setExpandedOrder(orderIdParam);
      loadOrderHistory(orderIdParam);
    }
  }, [location.search]);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (currentUser) {
      loadOrders();
      loadOrderStats();
      loadOrderGrowth();
    }
  }, [currentUser]);

  // Загрузка заказов с фильтрацией
  const loadOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_sku,
            quantity,
            unit_price,
            total_price
          )
        `)
        .eq('user_id', currentUser.id);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
      }

      query = query.order(filters.sortBy, { ascending: filters.sortDirection === 'asc' });

      const { data, error } = await query;
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
      showNotification('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка статистики заказов
  const loadOrderStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_order_stats', {
        p_user_id: currentUser.id
      });

      if (error) throw error;
      setOrderStats(data[0] || null);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  // Загрузка роста заказов
  const loadOrderGrowth = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_order_growth', {
        p_user_id: currentUser.id,
        p_months: 12
      });

      if (error) throw error;
      setOrderGrowth(data || []);
    } catch (error) {
      console.error('Ошибка загрузки роста заказов:', error);
    }
  };

  // Загрузка истории статусов заказа
  const loadOrderHistory = async (orderId) => {
    try {
      const { data, error } = await supabase
        .from('order_status_history')
        .select(`
          id,
          order_id,
          old_status,
          new_status,
          change_reason,
          notes,
          created_at
        `)
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setOrderHistory(prev => ({
        ...prev,
        [orderId]: data || []
      }));
    } catch (error) {
      console.error('Ошибка загрузки истории заказа:', error);
    }
  };

  // Удаление товара из заказа
  const removeOrderItem = async (orderId, orderItemId, orderStatus) => {
    if (!canRemoveItemsFromOrder(orderStatus)) {
      showNotification('Нельзя удалять товары из заказа с текущим статусом');
      return;
    }

    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', orderItemId)
        .eq('order_id', orderId);

      if (error) throw error;

      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              order_items: order.order_items.filter(item => item.id !== orderItemId)
            };
          }
          return order;
        })
      );

      showNotification('Товар удален из заказа');
      loadOrderStats();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      showNotification('Ошибка удаления товара');
    }
  };

  // Отмена заказа
  const cancelOrder = async (orderId, orderStatus) => {
    if (!canOrderBeCancelled(orderStatus)) {
      showNotification(`Нельзя отменить заказ со статусом "${orderStatuses[orderStatus]?.label || orderStatus}"`);
      return;
    }

    showConfirmation(
      'Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.',
      'Отмена заказа',
      async (buttonId) => {
        if (buttonId === 'ok') {
          try {
            setIsDeletingOrder(true);
            
            const { error: updateError } = await supabase
              .from('orders')
              .update({ 
                status: 'cancelled', 
                notes: `${orders.find(o => o.id === orderId)?.notes || ''}\n\nОтменен пользователем: ${new Date().toLocaleString()}`
              })
              .eq('id', orderId)
              .eq('user_id', currentUser.id);

            if (updateError) throw updateError;

            setOrders(prevOrders => 
              prevOrders.map(order => {
                if (order.id === orderId) {
                  return { ...order, status: 'cancelled' };
                }
                return order;
              })
            );
            
            showNotification('Заказ успешно отменен');
            loadOrderStats();
          } catch (error) {
            console.error('Ошибка отмены заказа:', error);
            showNotification('Произошла ошибка при отмене заказа');
          } finally {
            setIsDeletingOrder(false);
          }
        }
      }
    );
  };

  // Переключение развернутого заказа
  const toggleOrderDetails = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      if (!orderHistory[orderId]) {
        await loadOrderHistory(orderId);
      }
    }
  };

  // Получение заказов по месяцам
  const ordersByMonth = useMemo(() => {
    return groupOrdersByMonth(orders);
  }, [orders]);

  // Вычисление общей суммы покупок
  const totalSpent = useMemo(() => {
    return calculateTotalSpent(orders);
  }, [orders]);

  // Переход к оплате
  const handlePayOrder = (order) => {
    if (order.status !== 'approved') {
      showNotification(`Заказ не готов к оплате. Текущий статус: ${orderStatuses[order.status]?.label}`);
      return;
    }

    if (!order.total_amount || order.total_amount <= 0) {
      showNotification('Стоимость заказа не определена. Обратитесь к менеджеру.');
      return;
    }

    try {
      navigate(`/payment/${order.id}`, { state: { fromOrdersList: true } });
    } catch (error) {
      console.error('Ошибка навигации к странице оплаты:', error);
      showNotification('Ошибка перехода к оплате. Попробуйте еще раз.');
    }
  };

  // Обработка изменения фильтров
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Сброс фильтров
  const resetFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: '',
      sortBy: 'created_at',
      sortDirection: 'desc'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Кнопка переключения статистики */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text">История заказов</h2>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => setShowStats(!showStats)}
          icon={showStats ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        >
          {showStats ? 'Скрыть статистику' : 'Показать статистику'}
        </Button>
      </div>

      {/* Статистика */}
      <AnimatePresence>
        {showStats && (
          <OrderStatistics 
            orderStats={orderStats}
            orderGrowth={orderGrowth}
            totalSpent={totalSpent}
            formatAmount={formatAmount}
          />
        )}
      </AnimatePresence>

      {/* Фильтры */}
      <OrderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        orderStatuses={orderStatuses}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />

      {/* Группировка по месяцам */}
      <div className="space-y-6">
        {Object.values(ordersByMonth)
          .sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          })
          .map((monthData) => (
            <MonthlyOrderGroup
              key={`${monthData.year}-${monthData.month}`}
              monthData={monthData}
              expandedOrder={expandedOrder}
              orderHistory={orderHistory}
              toggleOrderDetails={toggleOrderDetails}
              removeOrderItem={removeOrderItem}
              cancelOrder={cancelOrder}
              isDeletingOrder={isDeletingOrder}
              handlePayOrder={handlePayOrder}
              orderStatuses={orderStatuses}
              formatAmount={formatAmount}
            />
          ))}
      </div>

      {/* Сообщение если нет заказов */}
      {orders.length === 0 && (
        <EmptyOrdersView 
          hasFilters={Object.values(filters).some(v => v)}
        />
      )}
    </div>
  );
};

export default OrdersHistory;