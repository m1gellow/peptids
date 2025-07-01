import React, { useState, useRef } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiMessageSquare, FiInfo, FiTrash2, FiMinus, FiPlus, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

const ProductCard = ({
  product,
  isFavorite,
  cartQuantity = 0,
  onToggleFavorite,
  onAddToCart,
  onInquiry,
  onQuickView
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  
  // Состояния для свайпа
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const touchStartX = useRef(null);
  const cardRef = useRef(null);
  
  // Значения для анимации свайпа
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Трансформации для индикаторов
  const rightOpacity = useTransform(x, [-200, -50, 0], [1, 0.5, 0]);
  const leftOpacity = useTransform(x, [0, 50, 200], [0, 0.5, 1]);
  
  // Обработчик начала свайпа
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  
  // Обработчик движения при свайпе
  const handleTouchMove = (e) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartX.current;
    
    // Ограничиваем движение карточки
    const moveX = Math.max(-150, Math.min(150, diffX));
    x.set(moveX);
    
    // Определяем направление свайпа
    if (diffX > 50) {
      setSwipeDirection('right'); // В избранное
    } else if (diffX < -50) {
      setSwipeDirection('left'); // В корзину
    } else {
      setSwipeDirection(null);
    }
  };
  
  // Обработчик окончания свайпа
  const handleTouchEnd = async (e) => {
    if (!touchStartX.current) return;
    
    const currentDirection = swipeDirection;
    
    // Сбрасываем позицию карточки с анимацией
    await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } });
    x.set(0);
    touchStartX.current = null;
    
    // Выполняем действие в зависимости от направления свайпа
    if (currentDirection) {
      setIsLoading(true);
      
      try {
        if (currentDirection === 'right') {
          await onToggleFavorite();
        } else if (currentDirection === 'left') {
          await onAddToCart();
        }
      } catch (error) {
        console.error(`Ошибка при обработке свайпа ${currentDirection}:`, error);
      } finally {
        setIsLoading(false);
        setSwipeDirection(null);
      }
    }
  };
  
  // Обработчики событий
  const handleCardClick = () => {
    navigate(`/catalog/${product.id}`);
  };
  
  // Предотвращение нажатия на карточку при нажатии на кнопки
  const handleActionClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    callback();
  };
  
  // Обработчик изменения количества
  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(newQuantity);
  };
  
  // Обработчик добавления в корзину с указанным количеством
  const handleAddToCart = () => {
    // Если товар уже в корзине, просто вызываем функцию onAddToCart (удаление)
    if (cartQuantity > 0) {
      onAddToCart();
      return;
    }
    
    // Если товар не в корзине, показываем выбор количества
    if (!showQuantity) {
      setShowQuantity(true);
      return;
    }
    
    // Если количество уже выбрано, вызываем функцию добавления с указанным количеством
    onAddToCart(quantity);
    setShowQuantity(false);
  };
  
  // Варианты анимации для карточки
  const cardVariants = {
    hover: {
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };
  
  // Варианты анимации для изображения
  const imageVariants = {
    initial: { scale: 1, filter: 'brightness(1) blur(0px)' },
    hover: { 
      scale: 1.05, 
      filter: 'brightness(1.1) blur(0.5px)', 
      transition: { duration: 0.5, ease: 'easeOut' } 
    }
  };
  
  // Форматирование цены
  const formatPrice = () => {
    if (product.base_price) {
      return `${product.base_price.toLocaleString('ru-RU')} ₽`;
    }
    // Пытаемся извлечь числовое значение из строки цены
    if (product.price) {
      const priceMatch = product.price.match(/[\d\s,]+/);
      if (priceMatch) {
        const numericPrice = parseFloat(priceMatch[0].replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(numericPrice)) {
          return `${numericPrice.toLocaleString('ru-RU')} ₽`;
        }
      }
    }
    return 'По запросу';
  };
  
  return (
    <motion.div 
      className="group relative bg-white rounded-lg shadow-card overflow-hidden"
      whileHover="hover"
      variants={cardVariants}
      layout
      ref={cardRef}
      style={{ x }}
      animate={controls}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Индикаторы свайпа */}
      <motion.div 
        className="absolute inset-0 bg-green-100 flex items-center justify-start pl-4 pointer-events-none"
        style={{ opacity: leftOpacity, zIndex: 1 }}
      >
        <div className="flex items-center bg-white rounded-full p-2 shadow-md text-green-600">
          <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
          <motion.div
            animate={swipeDirection === 'right' && isLoading ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FiChevronLeft size={20} />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="absolute inset-0 bg-blue-100 flex items-center justify-end pr-4 pointer-events-none"
        style={{ opacity: rightOpacity, zIndex: 1 }}
      >
        <div className="flex items-center bg-white rounded-full p-2 shadow-md text-blue-600">
          <motion.div
            animate={swipeDirection === 'left' && isLoading ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FiChevronRight size={20} />
          </motion.div>
          <FiShoppingCart size={20} />
        </div>
      </motion.div>
      
      {/* Основной контент карточки */}
      <div onClick={handleCardClick} className="relative z-2">
        {/* Фото товара */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <motion.img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-contain"
            initial="initial"
            variants={imageVariants}
          />
          
          {/* Кнопка избранного */}
          <button
            onClick={(e) => handleActionClick(e, onToggleFavorite)}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-text-secondary hover:text-red-500'
            }`}
          >
            <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Индикатор поискового релевантности */}
          {product._searchScore !== undefined && (
            <div className="absolute top-3 left-3 bg-primary text-white text-xs px-2 py-1 rounded-full">
              {Math.round(product._searchScore * 100)}%
            </div>
          )}
        </div>
        
        {/* Контент карточки */}
        <div className="p-4">
          <h3 className="font-semibold text-text mb-2 line-clamp-2 h-12">
            {product.name}
          </h3>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-text-secondary">
              Артикул: {product.sku}
            </span>
            <span className="text-xs bg-primary-bg text-primary px-2 py-1 rounded-full">
              {product.categoryName}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="font-semibold text-primary text-lg">
                {formatPrice()}
              </span>
            </div>
            {cartQuantity > 0 && (
              <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                В корзине: {cartQuantity}
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {/* Выбор количества (показывается при нажатии на "В корзину") */}
            {showQuantity && cartQuantity === 0 && (
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-2 mb-2">
                <button
                  onClick={(e) => handleActionClick(e, () => handleQuantityChange(-1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
                  disabled={quantity <= 1}
                >
                  <FiMinus size={14} />
                </button>
                
                <span className="w-8 text-center font-medium text-text">
                  {quantity}
                </span>
                
                <button
                  onClick={(e) => handleActionClick(e, () => handleQuantityChange(1))}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <button 
                className="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-light active:bg-primary-dark transition-colors"
                onClick={(e) => handleActionClick(e, handleCardClick)}
              >
                Подробнее
              </button>
              
              {cartQuantity > 0 ? (
                <button 
                  className="p-2 text-sm font-medium rounded-md bg-transparent border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                  onClick={(e) => handleActionClick(e, handleAddToCart)}
                  title="Удалить из корзины"
                >
                  <FiTrash2 size={14} />
                </button>
              ) : (
                <button 
                  className="p-2 text-sm font-medium rounded-md bg-transparent border border-primary text-primary hover:bg-primary-bg transition-colors"
                  onClick={(e) => handleActionClick(e, handleAddToCart)}
                  title="Добавить в корзину"
                >
                  <FiShoppingCart size={14} />
                </button>
              )}

              <button 
                className="p-2 text-sm font-medium rounded-md bg-transparent border border-gray-300 text-text-secondary hover:border-primary hover:text-primary transition-colors"
                onClick={(e) => handleActionClick(e, onInquiry)}
                title="Задать вопрос о товаре"
              >
                <FiMessageSquare size={14} />
              </button>
              
              <button 
                className="p-2 text-sm font-medium rounded-md bg-transparent border border-gray-300 text-text-secondary hover:border-primary hover:text-primary transition-colors"
                onClick={(e) => handleActionClick(e, onQuickView)}
                title="Быстрый просмотр"
              >
                <FiInfo size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;