import React from 'react';
import { motion } from 'framer-motion';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import { getMonthName, canOrderBeCancelled, canRemoveItemsFromOrder } from '../../utils/orderUtils';

/**
 * Компонент группы заказов за месяц
 * @param {Object} props - Свойства компонента
 * @param {Object} props.monthData - Данные о месяце и заказах
 * @param {Object} props.expandedOrder - ID развернутого заказа
 * @param {Object} props.orderHistory - История статусов заказов
 * @param {Function} props.toggleOrderDetails - Функция для переключения деталей заказа
 * @param {Function} props.removeOrderItem - Функция удаления товара из заказа
 * @param {Function} props.cancelOrder - Функция отмены заказа
 * @param {Boolean} props.isDeletingOrder - Идет ли процесс удаления заказа
 * @param {Function} props.handlePayOrder - Обработчик оплаты заказа
 * @param {Object} props.orderStatuses - Объект статусов заказов
 * @param {Function} props.formatAmount - Функция форматирования суммы
 */
const MonthlyOrderGroup = ({
  monthData,
  expandedOrder,
  orderHistory,
  toggleOrderDetails,
  removeOrderItem,
  cancelOrder,
  isDeletingOrder,
  handlePayOrder,
  orderStatuses,
  formatAmount
}) => {
  // Подготовка заголовка месяца
  const monthYear = `${getMonthName(monthData.month)} ${monthData.year}`;
  
  return (
    <div className="space-y-4">
      {/* Заголовок месяца */}
      <div className="bg-primary-bg p-3 sm:p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-primary-dark mb-1 sm:mb-0">
            {monthYear}
          </h3>
          <div className="text-sm text-primary flex flex-wrap gap-1 sm:gap-2">
            <span>
              {monthData.count} заказ
              {monthData.count % 10 === 1 && monthData.count !== 11 
                ? '' 
                : monthData.count % 10 >= 2 && monthData.count % 10 <= 4 && (monthData.count < 12 || monthData.count > 14) 
                  ? 'а' 
                  : 'ов'
              }
            </span>
            <span>•</span>
            <span>{monthData.totalAmount === 0 ? "0 ₽" : `${monthData.totalAmount.toLocaleString('ru-RU')} ₽`}</span>
          </div>
        </div>
      </div>

      {/* Заказы месяца */}
      <div className="space-y-3">
        {monthData.orders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const history = orderHistory[order.id] || [];

          return (
            <motion.div key={order.id} layout>
              {/* Карточка заказа */}
              <OrderCard
                order={order}
                isExpanded={isExpanded}
                toggleDetails={() => toggleOrderDetails(order.id)}
                canCancelOrder={canOrderBeCancelled(order.status)}
                isDeletingOrder={isDeletingOrder}
                orderStatuses={orderStatuses}
                handlePayOrder={() => handlePayOrder(order)}
                cancelOrder={cancelOrder}
                formatAmount={formatAmount}
              />
              
              {/* Детали заказа (раскрывающийся блок) */}
              <motion.div layout>
                {isExpanded && (
                  <OrderDetails
                    order={order}
                    isExpanded={isExpanded}
                    history={history}
                    formatAmount={formatAmount}
                    removeOrderItem={(orderId, itemId) => 
                      removeOrderItem(orderId, itemId, order.status)
                    }
                    canCancelOrder={canOrderBeCancelled(order.status)}
                    canRemoveItems={canRemoveItemsFromOrder(order.status)}
                    orderStatuses={orderStatuses}
                  />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthlyOrderGroup;