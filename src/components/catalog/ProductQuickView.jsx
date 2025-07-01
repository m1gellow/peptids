import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiShoppingCart, FiHeart, FiMessageSquare, FiExternalLink, FiInfo, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import Button from '../ui/Button';

const ProductQuickView = ({
  product,
  isFavorite,
  cartQuantity = 0,
  isOpen,
  onClose,
  onToggleFavorite,
  onAddToCart,
  onInquiry,
  onViewDetails
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  // Форматирование характеристик продукта из JSON
  const formatSpecifications = (specifications) => {
    if (!specifications || !Array.isArray(specifications)) return [];
    return specifications;
  };

  // Форматирование цены продукта
  const formatPrice = (price, currency = 'RUB') => {
    if (price === null || price === undefined) return 'По запросу';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return price || 'По запросу';
    if (numPrice === 0) return '0 ₽';
    return `${numPrice.toLocaleString('ru-RU')} ₽`;
  };

  // Обработчик изменения количества
  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Обработчик добавления/удаления из корзины
  const handleCartAction = () => {
    if (cartQuantity > 0) {
      // Если товар уже в корзине - удаляем
      onAddToCart();
    } else {
      // Если товара нет в корзине - добавляем в выбранном количестве
      onAddToCart(quantity);
    }
  };

  const specs = formatSpecifications(product.specifications);

  // Функция для отображения спецификаций
  const renderSpecifications = () => {
    if (!specs.length) return null;
    
    return (
      <div className="space-y-2">
        <h4 className="font-medium text-text">Характеристики:</h4>
        <div className="bg-gray-50 p-3 rounded-md text-sm">
          {specs.map((spec, index) => (
            <div key={index} className="flex justify-between py-1 border-b border-divider last:border-b-0">
              <span className="text-text-secondary">
                {spec.name}:
              </span>
              <span className="font-medium text-text">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Функция для отображения детальной информации
  const renderDetailedInfo = () => {
    return (
      <div className="space-y-3 mt-4">
        {product.cas_number && (
          <div>
            <span className="text-text-secondary text-sm">CAS No.:</span>
            <span className="font-medium text-text ml-2">{product.cas_number}</span>
          </div>
        )}
        
        <div>
          <span className="text-text-secondary text-sm">Количество:</span>
          <span className="font-medium text-text ml-2">{product.quantity || '10 мл'}</span>
        </div>
        
        <div>
          <span className="text-text-secondary text-sm">Содержание пептида:</span>
          <span className="font-medium text-text ml-2">{product.peptide_content || '0,1% (10 мг)'}</span>
        </div>
        
        <div>
          <span className="text-text-secondary text-sm">Чистота:</span>
          <span className="font-medium text-text ml-2">{product.purity || 'более 97%'}</span>
        </div>
        
        <div>
          <span className="text-text-secondary text-sm">Форма:</span>
          <span className="font-medium text-text ml-2">{product.form || 'раствор в дозаторе'}</span>
        </div>
        
        {product.storage && (
          <div>
            <span className="text-text-secondary text-sm">Хранение:</span>
            <span className="font-medium text-text ml-2">{product.storage}</span>
          </div>
        )}
        
        {product.sequence && (
          <div>
            <span className="text-text-secondary text-sm">Аминокислотная последовательность:</span>
            <span className="font-medium text-text ml-2">{product.sequence}</span>
          </div>
        )}
        
        {product.chemical_name && (
          <div>
            <span className="text-text-secondary text-sm">Химическое название:</span>
            <span className="font-medium text-text ml-2">{product.chemical_name}</span>
          </div>
        )}
        
        {product.molecular_weight && (
          <div>
            <span className="text-text-secondary text-sm">Молекулярная масса:</span>
            <span className="font-medium text-text ml-2">{product.molecular_weight}</span>
          </div>
        )}
        
        {product.molecular_formula && (
          <div>
            <span className="text-text-secondary text-sm">Молекулярная формула:</span>
            <span className="font-medium text-text ml-2">{product.molecular_formula}</span>
          </div>
        )}
        
        {product.synonyms && (
          <div>
            <span className="text-text-secondary text-sm">Синонимы:</span>
            <span className="font-medium text-text ml-2">{product.synonyms}</span>
          </div>
        )}
        
        {product.research_area && (
          <div>
            <span className="text-text-secondary text-sm">Основная область исследования:</span>
            <span className="font-medium text-text ml-2">{product.research_area}</span>
          </div>
        )}
        
        {product.dosage && (
          <div>
            <span className="text-text-secondary text-sm">Дозировка:</span>
            <span className="font-medium text-text ml-2">{product.dosage}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div 
        className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        {/* Верхняя панель с кнопкой закрытия */}
        <div className="p-4 border-b border-divider flex justify-between items-center">
          <h3 className="font-semibold text-lg text-text">Быстрый просмотр</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
          >
            <FiX size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col sm:flex-row">
            {/* Изображение товара */}
            <div className="sm:w-1/2 p-4">
              <div className="bg-gray-50 rounded-lg overflow-hidden h-64">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Информация о товаре */}
            <div className="sm:w-1/2 p-4">
              <h2 className="text-xl font-semibold mb-2 text-text">{product.name}</h2>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 bg-primary-bg text-primary text-xs rounded-full">
                  {product.categoryName}
                </span>
                <span className="text-xs text-text-secondary">
                  Артикул: {product.sku}
                </span>
              </div>
              
              <div className="mb-3">
                <div className="text-xl font-bold text-primary">
                  {formatPrice(product.base_price) || product.price}
                </div>
              </div>
              
              {/* Детальная информация */}
              {renderDetailedInfo()}
              
              {/* Краткое описание */}
              {product.description && (
                <div className="mt-3">
                  <p className="text-sm text-text-secondary">{product.description}</p>
                </div>
              )}
              
              {/* Действия */}
              <div className="space-y-3 mt-4">
                {/* Если товар в корзине, показываем кнопку удаления */}
                {cartQuantity > 0 ? (
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    onClick={handleCartAction}
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    icon={<FiTrash2 size={16} />}
                  >
                    Удалить из корзины ({cartQuantity})
                  </Button>
                ) : (
                  // Иначе показываем выбор количества и добавление в корзину
                  <>
                    {/* Выбор количества */}
                    <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-md p-2">
                      <span className="text-sm text-text-secondary">Количество:</span>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
                          disabled={quantity <= 1}
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-10 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      variant="primary" 
                      fullWidth 
                      icon={<FiShoppingCart size={16} />} 
                      onClick={handleCartAction}
                    >
                      В корзину
                    </Button>
                  </>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    variant={isFavorite ? 'primary' : 'secondary'}
                    icon={<FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />}
                    onClick={onToggleFavorite}
                    className={isFavorite ? 'bg-red-500 border-red-500 hover:bg-red-600' : ''}
                  >
                    {isFavorite ? 'В избранном' : 'В избранное'}
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    icon={<FiMessageSquare size={16} />}
                    onClick={onInquiry}
                    fullWidth
                  >
                    Задать вопрос
                  </Button>
                </div>
                
                <Button 
                  variant="outlined"
                  fullWidth
                  onClick={onViewDetails}
                  icon={<FiExternalLink size={16} />}
                >
                  Подробнее о товаре
                </Button>
              </div>
            </div>
          </div>
          
          {/* Дополнительные характеристики */}
          <div className="p-4 border-t border-divider">
            {renderSpecifications()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductQuickView;