import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Button from '../ui/Button';

/**
 * Компонент фильтрации и поиска заказов
 * @param {Object} props - Свойства компонента
 * @param {Object} props.filters - Текущие фильтры
 * @param {Function} props.onFilterChange - Обработчик изменения фильтров
 * @param {Function} props.resetFilters - Функция для сброса фильтров
 * @param {Object} props.orderStatuses - Объект статусов заказов
 * @param {Boolean} props.showFilters - Показывать ли фильтры
 * @param {Function} props.setShowFilters - Функция изменения видимости фильтров
 */
const OrderFilters = ({
  filters,
  onFilterChange,
  resetFilters,
  orderStatuses,
  showFilters,
  setShowFilters
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Фильтры и поиск</h3>
        <Button
          variant="text"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          icon={showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        >
          {showFilters ? 'Скрыть' : 'Показать'}
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Поиск */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={16} />
              <input
                type="text"
                placeholder="Поиск по номеру заказа или имени..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>

            {/* Фильтры (адаптивный вид) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) => onFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="">Все статусы</option>
                {Object.entries(orderStatuses).map(([key, status]) => (
                  <option key={key} value={key}>{status.label}</option>
                ))}
              </select>

              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Дата от"
              />

              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFilterChange('dateTo', e.target.value)}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                placeholder="Дата до"
              />

              <select
                value={`${filters.sortBy}-${filters.sortDirection}`}
                onChange={(e) => {
                  const [sortBy, sortDirection] = e.target.value.split('-');
                  onFilterChange('sortBy', sortBy);
                  onFilterChange('sortDirection', sortDirection);
                }}
                className="px-3 py-2 border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              >
                <option value="created_at-desc">Сначала новые</option>
                <option value="created_at-asc">Сначала старые</option>
                <option value="total_amount-desc">По сумме (убыв.)</option>
                <option value="total_amount-asc">По сумме (возр.)</option>
                <option value="status-asc">По статусу</option>
              </select>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outlined"
                size="sm"
                onClick={resetFilters}
              >
                Сбросить фильтры
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderFilters;