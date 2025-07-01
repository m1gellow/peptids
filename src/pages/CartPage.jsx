import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowRight } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { showNotification, showConfirmation } from '../utils/telegramUtils';
import { useCart } from '../contexts/CartContext';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const CartPage = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    removeFromCart, 
    updateCartItem, 
    clearCart, 
    getCartItemsCount, 
    currentUser 
  } = useCart();
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Анимация страницы
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };

  // Эффект для обновления общей суммы
  useEffect(() => {
    calculateTotal(cartItems);
    setLoading(false);
  }, [cartItems]);

  // Расчет общей суммы корзины
  const calculateTotal = (items) => {
    let total = 0;
    
    items.forEach(item => {
      // Используем base_price если есть, иначе пытаемся извлечь число из price
      if (item.product.base_price && !isNaN(parseFloat(item.product.base_price))) {
        total += parseFloat(item.product.base_price) * item.quantity;
      } else if (item.product.price) {
        // Пытаемся извлечь число из строки цены
        const priceMatch = item.product.price.match(/[\d\s,]+/);
        if (priceMatch) {
          const numericPrice = parseFloat(priceMatch[0].replace(/\s/g, '').replace(',', '.'));
          if (!isNaN(numericPrice)) {
            total += numericPrice * item.quantity;
          }
        }
      }
    });
    
    setTotalAmount(total);
  };

  // Переход к оформлению заказа
  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  // Форматирование цены товара
  const formatProductPrice = (product) => {
    if (product.base_price) {
      return `${parseFloat(product.base_price).toLocaleString('ru-RU')} ₽`;
    }
    
    // Попробуем извлечь число из строки цены
    if (product.price) {
      const priceMatch = product.price.match(/[\d\s,]+/);
      if (priceMatch) {
        const numericPrice = parseFloat(priceMatch[0].replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(numericPrice)) {
          return `${numericPrice.toLocaleString('ru-RU')} ₽`;
        }
      }
    }
    
    return product.price || 'По запросу';
  };

  if (!currentUser) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fade-in"
      >
        <Section variant="default" className="py-8">
          <div className="text-center">
            <FiShoppingCart size={64} className="text-text-secondary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Корзина</h1>
            <p className="text-text-secondary mb-6">
              Для просмотра корзины необходимо войти в аккаунт
            </p>
            <Button variant="primary" to="/profile">
              Войти в аккаунт
            </Button>
          </div>
        </Section>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fade-in"
      >
        <Section variant="default" className="py-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </Section>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Корзина</h1>
              <p className="text-white/90 text-sm">
                {getCartItemsCount()} товаров в корзине
              </p>
            </div>
            <div className="text-right">
              <FiShoppingCart size={32} className="text-white/80" />
            </div>
          </div>
        </div>
      </div>

      <Section variant="default" className="py-6">
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {/* Товары в корзине */}
            {cartItems.map((item) => (
              <motion.div 
                key={item.id} 
                className="bg-white p-4 rounded-lg shadow-card"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Изображение товара */}
                  <Link to={`/catalog/${item.product.id}`} className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </Link>
                  
                  {/* Информация о товаре */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/catalog/${item.product.id}`}>
                      <h4 className="font-medium text-text hover:text-primary transition-colors truncate" title={item.product.name}>
                        {item.product.name}
                      </h4>
                    </Link>
                    <p className="text-sm text-text-secondary truncate" title={`Артикул: ${item.product.sku}`}>
                      Артикул: {item.product.sku}
                    </p>
                    <p className="font-semibold text-primary truncate" title={formatProductPrice(item.product)}>
                      {formatProductPrice(item.product)}
                    </p>
                  </div>
                  
                  {/* Управление количеством и удаление - адаптивно */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 mt-2 sm:mt-0">
                    {/* Управление количеством */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={14} />
                      </button>
                      
                      <span className="w-8 text-center font-medium text-text">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    
                    {/* Кнопка удаления */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Удалить товар"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Итоговая информация */}
            <div className="bg-white p-6 rounded-lg shadow-card">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-text">Итого товаров:</span>
                <span className="font-bold text-lg text-text">{getCartItemsCount()}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-semibold text-text">Общая стоимость:</span>
                <span className="font-bold text-lg text-primary">
                  {totalAmount > 0 
                    ? `${totalAmount.toLocaleString('ru-RU')} ₽` 
                    : 'По запросу'
                  }
                </span>
              </div>
              
              <div className="border-t border-divider pt-4">
                <p className="text-sm text-text-secondary mb-4">
                  {totalAmount > 0 
                    ? 'Точная стоимость будет уточнена менеджером после отправки заказа.'
                    : 'Точная стоимость заказа будет рассчитана после отправки запроса. Наш менеджер свяжется с вами для уточнения деталей.'
                  }
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="primary" 
                    fullWidth
                    icon={<FiArrowRight size={16} />}
                    iconPosition="right"
                    onClick={proceedToCheckout}
                  >
                    Оформить заказ
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      showConfirmation(
                        'Вы действительно хотите очистить всю корзину?',
                        'Очистка корзины',
                        async (buttonId) => {
                          if (buttonId === 'ok') {
                            await clearCart();
                            showNotification('Корзина очищена');
                          }
                        }
                      );
                    }}
                  >
                    Очистить корзину
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Пустая корзина
          <div className="text-center py-12">
            <FiShoppingCart size={64} className="text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-text">Корзина пуста</h3>
            <p className="text-text-secondary mb-6">
              Добавьте товары в корзину для оформления заказа
            </p>
            <Button variant="primary" to="/catalog">
              Перейти в каталог
            </Button>
          </div>
        )}
      </Section>
    </motion.div>
  );
};

export default CartPage;