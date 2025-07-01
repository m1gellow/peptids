import React from 'react';
import { FiPackage } from 'react-icons/fi';
import Button from '../ui/Button';

/**
 * Компонент для отображения пустого состояния списка заказов
 * @param {Object} props - Свойства компонента
 * @param {Boolean} props.hasFilters - Есть ли активные фильтры
 */
const EmptyOrdersView = ({ hasFilters }) => {
  return (
    <div className="text-center py-12">
      <FiPackage size={48} className="text-text-secondary mx-auto mb-4" />
      <h4 className="text-lg font-medium mb-2 text-text">
        {hasFilters ? 'Заказы не найдены' : 'Нет заказов'}
      </h4>
      <p className="text-text-secondary mb-4">
        {hasFilters 
          ? 'Попробуйте изменить параметры фильтрации'
          : 'Вы еще не создали ни одного заказа'
        }
      </p>
      {!hasFilters && (
        <Button variant="primary" to="/catalog">
          Перейти в каталог
        </Button>
      )}
    </div>
  );
};

export default EmptyOrdersView;