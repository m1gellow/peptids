import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

/**
 * Компонент статистики заказов пользователя
 * @param {Object} props - Свойства компонента
 * @param {Object} props.orderStats - Статистика заказов
 * @param {Array} props.orderGrowth - Данные о росте заказов
 * @param {Number} props.totalSpent - Общая сумма потраченных денег
 * @param {Function} props.formatAmount - Функция форматирования суммы
 */
const OrderStatistics = ({ orderStats, orderGrowth, totalSpent, formatAmount }) => {
  // Варианты анимации
  const containerVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto' },
    exit: { opacity: 0, height: 0 }
  };

  // Получение названий месяцев
  const getMonthName = (monthIndex) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[monthIndex];
  };

  // Компонент графика роста
  const GrowthChart = () => {
    if (!orderGrowth || orderGrowth.length === 0) return null;

    // Находим максимальное значение для расчета процентов
    const maxAmount = Math.max(...orderGrowth.map(item => {
      const amount = parseFloat(item.total_amount);
      return isNaN(amount) ? 0 : amount;
    }));
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <FiTrendingUp className="text-primary" size={20} />
          <h3 className="font-semibold text-text">Рост покупок за год</h3>
        </div>
        
        <div className="space-y-3">
          {orderGrowth.map((item, index) => {
            const [year, month] = item.month_year.split('-');
            const monthName = getMonthName(parseInt(month) - 1);
            const amount = parseFloat(item.total_amount);
            const numericAmount = isNaN(amount) ? 0 : amount;
            const percentage = maxAmount > 0 ? (numericAmount / maxAmount) * 100 : 0;
            
            return (
              <div key={item.month_year} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{monthName} {year}</span>
                  <span className="font-medium whitespace-nowrap ml-2">
                    {numericAmount === 0 ? "0 ₽" : `${numericAmount.toLocaleString('ru-RU')} ₽`}
                    <span className="text-xs text-text-secondary ml-1">
                      ({item.order_count})
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="bg-primary h-2 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!orderStats) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      {/* Основные показатели */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-card text-center">
          <div className="text-2xl font-bold text-primary">{orderStats.total_orders || 0}</div>
          <div className="text-xs text-text-secondary">Всего заказов</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card text-center">
          <div className="text-2xl font-bold text-green-600">{orderStats.completed_orders || 0}</div>
          <div className="text-xs text-text-secondary">Выполнено</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card text-center">
          <div className="text-2xl font-bold text-blue-600">{orderStats.pending_orders || 0}</div>
          <div className="text-xs text-text-secondary">В работе</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-card text-center">
          <div className="text-xl font-bold text-primary">
            {!orderStats.total_amount_spent || parseFloat(orderStats.total_amount_spent) === 0 
              ? "0 ₽" 
              : `${parseFloat(orderStats.total_amount_spent).toLocaleString('ru-RU')} ₽`
            }
          </div>
          <div className="text-xs text-text-secondary">Потрачено</div>
        </div>
      </div>

      {/* График роста и дополнительная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart />
        
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart2 className="text-primary" size={20} />
            <h3 className="font-semibold text-text">Дополнительная статистика</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Средний чек:</span>
              <span className="font-medium">
                {!orderStats.avg_order_value || parseFloat(orderStats.avg_order_value) === 0
                  ? "0 ₽" 
                  : `${parseFloat(orderStats.avg_order_value).toLocaleString('ru-RU')} ₽`
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Отмененных заказов:</span>
              <span className="font-medium text-red-600">{orderStats.cancelled_orders || 0}</span>
            </div>
            
            {orderStats.last_order_date && (
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Последний заказ:</span>
                <span className="font-medium">
                  {new Date(orderStats.last_order_date).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}

            <div className="pt-4 border-t border-divider">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-text">Общая сумма покупок:</span>
                <span className="text-xl font-bold text-primary">
                  {!totalSpent || totalSpent === 0 
                    ? "0 ₽" 
                    : `${parseFloat(totalSpent).toLocaleString('ru-RU')} ₽`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderStatistics;