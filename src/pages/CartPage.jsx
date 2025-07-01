import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowRight, FiEdit, FiCheck } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import { showNotification, showConfirmation } from '../utils/telegramUtils';
import { useCart } from '../contexts/CartContext';

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
  const [editingItemId, setEditingItemId] = useState(null);
  const [quantityInput, setQuantityInput] = useState('');
  const inputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  useEffect(() => {
    calculateTotal(cartItems);
    setLoading(false);
  }, [cartItems]);

  const handleDoubleClick = (item) => {
    if (!isMobile) {
      setEditingItemId(item.id);
      setQuantityInput(item.quantity.toString());
    }
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setQuantityInput(item.quantity.toString());
  };

  const handleQuantityChange = (itemId) => {
    const newQuantity = parseInt(quantityInput) || 1;
    if (newQuantity > 0) {
      updateCartItem(itemId, newQuantity);
    }
    setEditingItemId(null);
  };

  const handleKeyDown = (e, itemId) => {
    if (e.key === 'Enter') {
      handleQuantityChange(itemId);
    } else if (e.key === 'Escape') {
      setEditingItemId(null);
    }
  };

  useEffect(() => {
    if (editingItemId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingItemId]);

  const calculateTotal = (items) => {
    let total = 0;
    
    items.forEach(item => {
      if (item.product.base_price && !isNaN(parseFloat(item.product.base_price))) {
        total += parseFloat(item.product.base_price) * item.quantity;
      } else if (item.product.price) {
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

  const proceedToCheckout = () => {
    navigate('/checkout');
  };

  const formatProductPrice = (product) => {
    if (product.base_price) {
      return `${parseFloat(product.base_price).toLocaleString('ru-RU')} ₽`;
    }
    
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
                  <Link to={`/catalog/${item.product.id}`} className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={item.product.image_url} 
                        alt={item.product.name}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </Link>
                  
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
                  
                  <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-3 mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={14} />
                      </button>
                      
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            ref={inputRef}
                            type="number"
                            min="1"
                            value={quantityInput}
                            onChange={(e) => setQuantityInput(e.target.value)}
                            onBlur={() => handleQuantityChange(item.id)}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id)}
                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
                          >
                            <FiCheck size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span 
                            className={`w-8 text-center font-medium text-text ${isMobile ? 'hidden' : 'block'}`}
                            onDoubleClick={() => handleDoubleClick(item)}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleEditClick(item)}
                            className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors ${isMobile ? 'block' : 'hidden sm:block'}`}
                          >
                            {isMobile ? <FiEdit size={14} /> : <span className='flex items-center justify-center'><FiEdit size={14} /></span>}
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>
                    
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