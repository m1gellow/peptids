import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PaginationControls = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = ''
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Проверка на возможность навигации
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;
  
  // Формирование массива номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesShown = 5; // Максимальное количество отображаемых номеров страниц
    
    // Если общее число страниц меньше или равно maxPagesShown, показываем все
    if (totalPages <= maxPagesShown) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Иначе показываем диапазон вокруг текущей страницы
      let startPage = Math.max(1, currentPage - Math.floor(maxPagesShown / 2));
      let endPage = startPage + maxPagesShown - 1;
      
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesShown + 1);
      }
      
      // Первая страница
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }
      
      // Страницы в диапазоне
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      // Последняя страница
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Обработчик изменения размера страницы
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    onPageSizeChange(newSize);
  };
  
  // Если у нас нет элементов или всего одна страница, не показываем пагинацию
  if (totalItems <= 0 || totalPages <= 1) {
    return null;
  }
  
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center ${className}`}>
      {/* Информация о количестве элементов - адаптированная для мобильных */}
      <div className="text-sm text-text-secondary flex items-center justify-between sm:justify-start">
        <div className="flex-shrink-0">
          Показано {Math.min(totalItems, (currentPage - 1) * pageSize + 1)} - {Math.min(totalItems, currentPage * pageSize)} 
          <span className="hidden xs:inline"> из {totalItems} товаров</span>
          <span className="inline xs:hidden"> из {totalItems}</span>
        </div>
        
        {/* Выбор размера страницы - на мобильных в том же ряду */}
        <div className="ml-3 flex-shrink-0 sm:hidden">
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="py-1 px-1 border border-divider rounded text-sm bg-white font-medium"
            aria-label="Товаров на странице"
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
        {/* Выбор размера страницы - для планшетов и десктопа */}
        <div className="hidden sm:block mr-3">
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="py-1 px-2 border border-divider rounded text-sm bg-white"
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>{option} на странице</option>
            ))}
          </select>
        </div>
        
        {/* Кнопка "Назад" */}
        <button
          onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
          disabled={!canGoPrevious}
          className={`w-9 h-9 rounded flex items-center justify-center ${
            canGoPrevious
              ? 'bg-white border border-divider text-text hover:bg-gray-50'
              : 'bg-gray-100 text-text-secondary cursor-not-allowed'
          }`}
          aria-label="Предыдущая страница"
        >
          <FiChevronLeft size={18} />
        </button>
        
        {/* Номера страниц - адаптированные для мобильных */}
        <div className="flex">
          {getPageNumbers().map((page, index) => (
            <button
              key={`${page}-${index}`}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={typeof page !== 'number'}
              className={`w-9 h-9 flex items-center justify-center text-sm transition-colors ${
                page === currentPage
                  ? 'bg-primary text-white font-medium'
                  : typeof page === 'number'
                    ? 'bg-white border border-divider text-text hover:bg-gray-50'
                    : 'bg-white border border-divider text-text-secondary cursor-default'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
        
        {/* Кнопка "Вперед" */}
        <button
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className={`w-9 h-9 rounded flex items-center justify-center ${
            canGoNext
              ? 'bg-white border border-divider text-text hover:bg-gray-50'
              : 'bg-gray-100 text-text-secondary cursor-not-allowed'
          }`}
          aria-label="Следующая страница"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;