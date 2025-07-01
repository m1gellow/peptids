import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiInfo, FiExternalLink } from 'react-icons/fi';
import Button from '../ui/Button';

const ProductDetails = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  // Функция для форматирования характеристик продукта
  const renderDetailedInfo = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.cas_number && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">CAS No.:</span>
              <span className="font-medium text-text">
                {product.cas_number}
              </span>
            </div>
          )}
          
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm">Количество:</span>
            <span className="font-medium text-text">
              {product.quantity || '10 мл'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm">Содержание пептида:</span>
            <span className="font-medium text-text">
              {product.peptide_content || '0,1% (10 мг)'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm">Чистота:</span>
            <span className="font-medium text-text">
              {product.purity || 'более 97%'}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm">Форма:</span>
            <span className="font-medium text-text">
              {product.form || 'раствор в дозаторе'}
            </span>
          </div>
          
          {product.storage && (
            <div className="flex flex-col">
              <span className="text-text-secondary text-sm">Хранение:</span>
              <span className="font-medium text-text">
                {product.storage}
              </span>
            </div>
          )}
        </div>
        
        <div className="border-t border-divider pt-4">
          <h4 className="font-medium text-text mb-3">Дополнительная информация:</h4>
          <div className="grid grid-cols-1 gap-3">
            {product.sequence && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Аминокислотная последовательность:</span>
                <span className="font-medium text-text">
                  {product.sequence}
                </span>
              </div>
            )}
            
            {product.chemical_name && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Химическое название:</span>
                <span className="font-medium text-text">
                  {product.chemical_name}
                </span>
              </div>
            )}
            
            {product.molecular_weight && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Молекулярная масса:</span>
                <span className="font-medium text-text">
                  {product.molecular_weight}
                </span>
              </div>
            )}
            
            {product.molecular_formula && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Молекулярная формула:</span>
                <span className="font-medium text-text">
                  {product.molecular_formula}
                </span>
              </div>
            )}
            
            {product.synonyms && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Синонимы:</span>
                <span className="font-medium text-text">
                  {product.synonyms}
                </span>
              </div>
            )}
            
            {product.research_area && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Основная область исследования:</span>
                <span className="font-medium text-text">
                  {product.research_area}
                </span>
              </div>
            )}
            
            {product.dosage && (
              <div className="flex flex-col">
                <span className="text-text-secondary text-sm">Дозировка:</span>
                <span className="font-medium text-text">
                  {product.dosage}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {product.auxiliary_substances && (
          <div className="flex flex-col">
            <span className="text-text-secondary text-sm">Вспомогательные вещества:</span>
            <span className="font-medium text-text">
              {product.auxiliary_substances || 'вода очищенная, натрия хлорид, метилпарабен'}
            </span>
          </div>
        )}
        
        {/* Отображение характеристик из specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="border-t border-divider pt-4">
            <h4 className="font-medium text-text mb-2">Характеристики:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-1 border-b border-divider last:border-b-0">
                  <span className="text-sm text-text-secondary">
                    {spec.name}:
                  </span>
                  <span className="text-sm font-medium text-text">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Дополнительные изображения, если есть */}
        {product.additional_images && product.additional_images.length > 0 && (
          <div className="border-t border-divider pt-4">
            <h4 className="font-medium text-text mb-2">Дополнительные изображения:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {product.additional_images.map((image, index) => (
                <div key={index} className="bg-gray-50 rounded-md overflow-hidden">
                  <img src={image} alt={`${product.name} - изображение ${index+1}`} 
                    className="w-full h-32 object-contain" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Структурная формула, если есть */}
        {product.structural_formula && (
          <div className="border-t border-divider pt-4">
            <h4 className="font-medium text-text mb-2">Структурная формула:</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <img 
                src={product.structural_formula} 
                alt={`Структурная формула ${product.name}`}
                className="max-w-full mx-auto" 
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Заголовок */}
        <div className="p-4 border-b border-divider flex justify-between items-center">
          <h2 className="font-semibold text-xl text-text">Характеристики товара</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
          >
            <FiX size={18} />
          </button>
        </div>
        
        {/* Контент */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-col md:flex-row mb-6">
            <div className="md:w-1/3 mb-4 md:mb-0 md:pr-6">
              <div className="bg-gray-50 rounded-lg overflow-hidden h-48 md:h-64">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-xl font-semibold mb-2 text-text">{product.name}</h3>
              <p className="text-text-secondary mb-4">{product.description}</p>
              
              <div className="mb-4 flex items-center gap-2">
                <span className="px-2 py-1 bg-primary-bg text-primary text-xs rounded-full">
                  {product.categoryName || 'Пептиды'}
                </span>
                <span className="text-xs text-text-secondary">
                  Артикул: {product.sku}
                </span>
              </div>
              
              <div className="text-xl font-bold text-primary mb-6">
                {product.price || (product.base_price && `${product.base_price.toLocaleString('ru-RU')} ₽`) || 'По запросу'}
              </div>
              
              {renderDetailedInfo()}
              
              <div className="mt-6 pt-4 border-t border-divider">
                <Button 
                  variant="primary"
                  icon={<FiExternalLink size={16} />}
                  onClick={() => window.location.href = `/catalog/${product.id}`}
                >
                  Перейти на страницу товара
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails;