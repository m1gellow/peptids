import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiTrash2, FiCreditCard } from 'react-icons/fi';
import Button from '../ui/Button';

/**
 * Компонент карточки заказа
 * @param {Object} props - Свойства компонента
 * @param {Object} props.order - Данные заказа
 * @param {Boolean} props.isExpanded - Развернут ли заказ
 * @param {Function} props.toggleDetails - Функция для переключения отображения деталей
 * @param {Boolean} props.canCancelOrder - Можно ли отменить заказ
 * @param {Boolean} props.isDeletingOrder - Идет ли процесс удаления
 * @param {Object} props.orderStatuses - Объект статусов заказов
 * @param {Function} props.handlePayOrder - Обработчик оплаты заказа
 * @param {Function} props.cancelOrder - Функция отмены заказа
 * @param {Function} props.formatAmount - Функция форматирования суммы
 */
const OrderCard = ({
  order,
  isExpanded,
  toggleDetails,
  canCancelOrder,
  isDeletingOrder,
  orderStatuses,
  handlePayOrder,
  cancelOrder,
  formatAmount
}) => {
  const StatusIcon = orderStatuses[order.status]?.icon || null;

  // Форматирование суммы с проверкой на null/undefined/0
  const formatPrice = (price, currency = 'RUB') => {
    if (price === null || price === undefined) return 'По запросу';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'По запросу';
    if (numPrice === 0) return '0 ₽';
    return `${numPrice.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <div className="bg-white rounded-lg shadow-card overflow-hidden">
      {/* Основная информация заказа */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
              <h4 className="font-semibold text-text">
                Заказ {order.order_number}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full ${orderStatuses[order.status]?.color} inline-block max-w-max`}>
                {orderStatuses[order.status]?.label || order.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {new Date(order.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-lg text-primary">
              {formatPrice(order.total_amount)}
            </div>
            {order.delivery_cost > 0 && (
              <div className="text-sm text-text-secondary">
                + доставка {formatPrice(order.delivery_cost)}
              </div>
            )}
          </div>
        </div>

        {/* Товары (краткая информация) */}
        <div className="mb-3">
          <div className="text-sm text-text-secondary mb-1">
            Товаров: {order.order_items?.length || 0}
          </div>
          {order.order_items?.slice(0, 2).map((item) => (
            <div key={item.id} className="text-sm truncate">
              {item.product_name} × {item.quantity}
            </div>
          ))}
          {order.order_items?.length > 2 && (
            <div className="text-sm text-text-secondary">
              и еще {order.order_items.length - 2} товар(ов)
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Button
            variant="text"
            size="sm"
            onClick={() => toggleDetails(order.id)}
            icon={isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
          >
            {isExpanded ? 'Свернуть' : 'Подробнее'}
          </Button>

          <div className="flex gap-2 flex-wrap">
            {order.status === 'approved' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePayOrder(order)}
                icon={<FiCreditCard size={14} />}
              >
                Оплатить
              </Button>
            )}
            {canCancelOrder && (
              <Button
                variant="outlined"
                size="sm"
                icon={<FiTrash2 size={14} />}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => cancelOrder(order.id, order.status)}
                disabled={isDeletingOrder}
              >
                Отменить
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;