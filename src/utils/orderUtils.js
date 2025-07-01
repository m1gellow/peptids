/**
 * Вспомогательные функции для работы с заказами
 */

/**
 * Форматирование суммы с валютой
 * @param {number|string} amount - Сумма для форматирования
 * @param {string} currency - Валюта (по умолчанию RUB)
 * @return {string} Отформатированная сумма с символом валюты
 */
export const formatAmount = (amount, currency = 'RUB') => {
  // Проверяем, что значение существует и является числом
  if (amount === null || amount === undefined) return 'По запросу';
  
  // Преобразуем в число и проверяем на NaN
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return 'По запросу';
  
  // Проверяем, если значение равно 0
  if (numAmount === 0) return '0 ₽';
  
  // Форматируем число с разделителями тысяч
  const formattedAmount = numAmount.toLocaleString('ru-RU');
  
  // Добавляем символ валюты
  const currencySymbol = currency === 'RUB' ? '₽' : currency;
  
  return `${formattedAmount} ${currencySymbol}`;
};

/**
 * Объект статусов заказов с метками и цветами
 */
import { FiClock, FiCheck, FiX, FiPackage, FiTruck, FiCreditCard } from 'react-icons/fi';

export const orderStatuses = {
  'pending': { label: 'Ожидает оплаты', color: 'bg-yellow-100 text-yellow-800', icon: FiClock },
  'pending_approval': { label: 'На рассмотрении', color: 'bg-blue-100 text-blue-800', icon: FiClock },
  'approved': { label: 'Одобрен к оплате', color: 'bg-green-100 text-green-800', icon: FiCheck },
  'paid': { label: 'Оплачен', color: 'bg-green-200 text-green-900', icon: FiCreditCard },
  'processing': { label: 'В обработке', color: 'bg-purple-100 text-purple-800', icon: FiPackage },
  'shipped': { label: 'Отправлен', color: 'bg-indigo-100 text-indigo-800', icon: FiTruck },
  'delivered': { label: 'Доставлен', color: 'bg-green-200 text-green-900', icon: FiCheck },
  'cancelled': { label: 'Отменен', color: 'bg-red-100 text-red-800', icon: FiX }
};

/**
 * Вычисление общей суммы покупок
 * @param {Array} orders - Массив заказов
 * @return {number} Общая сумма
 */
export const calculateTotalSpent = (orders) => {
  return orders
    .filter(order => ['delivered', 'paid'].includes(order.status))
    .reduce((sum, order) => {
      // Проверка на наличие числового значения
      const amount = parseFloat(order.total_amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
};

/**
 * Группировка заказов по месяцам
 * @param {Array} orders - Массив заказов
 * @return {Object} Сгруппированные заказы
 */
export const groupOrdersByMonth = (orders) => {
  const grouped = {};
  
  orders.forEach(order => {
    const date = new Date(order.created_at);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!grouped[key]) {
      grouped[key] = {
        year: date.getFullYear(),
        month: date.getMonth(),
        orders: [],
        totalAmount: 0,
        count: 0
      };
    }
    
    grouped[key].orders.push(order);
    grouped[key].count++;
    
    // Проверка и корректное добавление суммы
    if (order.total_amount) {
      const amount = parseFloat(order.total_amount);
      if (!isNaN(amount)) {
        grouped[key].totalAmount += amount;
      }
    }
  });
  
  return grouped;
};

/**
 * Проверяет, можно ли отменить заказ с указанным статусом
 * @param {string} orderStatus - Статус заказа
 * @return {boolean} Можно ли отменить заказ
 */
export const canOrderBeCancelled = (orderStatus) => {
  return ['pending', 'pending_approval'].includes(orderStatus);
};

/**
 * Проверяет, можно ли удалить товары из заказа с указанным статусом
 * @param {string} orderStatus - Статус заказа
 * @return {boolean} Можно ли удалить товары
 */
export const canRemoveItemsFromOrder = (orderStatus) => {
  return ['pending', 'pending_approval'].includes(orderStatus);
};

/**
 * Получение названия месяца по его индексу
 * @param {number} monthIndex - Индекс месяца (0-11)
 * @return {string} Название месяца
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[monthIndex];
};

/**
 * Получение склонения слова "день" для числа
 * @param {number} number - Число для склонения
 * @return {string} Правильное склонение
 */
export function getWordDays(number) {
  const cases = [2, 0, 1, 1, 1, 2];
  const titles = ['день', 'дня', 'дней'];
  return titles[
    (number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]
  ];
}