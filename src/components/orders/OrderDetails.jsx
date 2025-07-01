import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import { FiTrash2 } from 'react-icons/fi';

/**
 * Компонент для отображения детальной информации о заказе
 * @param {Object} props - Свойства компонента
 * @param {Object} props.order - Данные заказа
 * @param {Boolean} props.isExpanded - Развернут ли заказ
 * @param {Array} props.history - История статусов заказа
 * @param {Function} props.formatAmount - Функция форматирования суммы
 * @param {Function} props.removeOrderItem - Функция удаления товара из заказа
 * @param {Boolean} props.canCancelOrder - Можно ли отменить заказ
 * @param {Boolean} props.canRemoveItems - Можно ли удалять товары из заказа
 * @param {Object} props.orderStatuses - Объект статусов заказов
 */
const OrderDetails = ({
  order,
  isExpanded,
  history,
  formatAmount,
  removeOrderItem,
  canCancelOrder,
  canRemoveItems,
  orderStatuses
}) => {
  if (!isExpanded) return null;

  // Форматирование суммы с проверкой на null/undefined/0
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'По запросу';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'По запросу';
    if (numPrice === 0) return '0 ₽';
    return `${numPrice.toLocaleString('ru-RU')} ₽`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-divider"
    >
      <div className="p-4 space-y-4">
        {/* Полная информация о товарах */}
        <div>
          <h5 className="font-medium mb-2">Состав заказа:</h5>
          <div className="space-y-2 overflow-x-auto">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-divider last:border-b-0">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="font-medium text-sm truncate">{item.product_name}</div>
                  <div className="text-xs text-text-secondary">
                    {item.product_sku} × {item.quantity}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-sm font-medium whitespace-nowrap">
                    {formatPrice(item.total_price)}
                  </div>
                  {canRemoveItems && (
                    <Button
                      variant="text"
                      size="sm"
                      onClick={() => removeOrderItem(order.id, item.id)}
                      icon={<FiTrash2 size={14} />}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Итоговая сумма заказа с учетом доставки */}
          <div className="mt-3 pt-3 border-t border-divider">
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Стоимость товаров:</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            
            {order.delivery_cost > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span>Стоимость доставки:</span>
                <span>{formatPrice(order.delivery_cost)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-semibold text-primary mt-2 pt-2 border-t border-dashed border-divider">
              <span>Итого к оплате:</span>
              <span>
                {order.total_amount 
                  ? formatPrice(
                      parseFloat(order.total_amount || 0) + parseFloat(order.delivery_cost || 0)
                    )
                  : 'По запросу'}
              </span>
            </div>
          </div>
        </div>

        {/* Адрес доставки */}
        {order.delivery_address && (
          <div>
            <h5 className="font-medium mb-2">Адрес доставки:</h5>
            <p className="text-sm text-text-secondary break-words">
              {order.delivery_address}
            </p>
          </div>
        )}

        {/* Комментарии */}
        {order.notes && (
          <div>
            <h5 className="font-medium mb-2">Комментарий:</h5>
            <p className="text-sm text-text-secondary whitespace-pre-line break-words">
              {order.notes}
            </p>
          </div>
        )}

        {/* История статусов */}
        {history.length > 0 && (
          <div>
            <h5 className="font-medium mb-2">История заказа:</h5>
            <div className="space-y-2">
              {history.map((record, index) => (
                <div key={record.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <div className="font-medium">
                          {orderStatuses[record.new_status]?.label || record.new_status}
                        </div>
                        {record.change_reason && (
                          <div className="text-text-secondary text-xs">
                            {record.change_reason}
                          </div>
                        )}
                        {record.notes && (
                          <div className="text-text-secondary text-xs">
                            {record.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-text-secondary mt-1 sm:mt-0">
                        {new Date(record.created_at).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OrderDetails;