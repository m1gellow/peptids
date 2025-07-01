import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { showNotification } from '../../utils/telegramUtils';
import Button from '../ui/Button';
import supabase from '../../lib/supabase';


const ProductSamples = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemQuantities, setItemQuantities] = useState({});
  
  // Используем контекст корзины
  const { 
    addToCart, 
    removeFromCart, 
    cartItems, 
    toggleFavorite, 
    isFavorite,
    currentUser 
  } = useCart();

  // Загрузка популярных продуктов
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, price, base_price, currency, image_url, sku')
          .eq('in_stock', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts(data || []);
        
        // Инициализируем количества товаров
        const initialQuantities = {};
        data?.forEach(product => {
          initialQuantities[product.id] = 1;
        });
        setItemQuantities(initialQuantities);
        
      } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  // Варианты анимации для изображения
  const imageVariants = {
    initial: { scale: 1, filter: 'brightness(1)' },
    hover: { scale: 1.05, filter: 'brightness(1.1)' }
  };
  
  // Обработчик добавления/удаления из корзины
  const handleToggleCart = async (product) => {
    if (!currentUser) {
      showNotification('Для добавления в корзину необходимо авторизоваться');
      return;
    }

    try {
      const quantity = getCartQuantity(product.id);
      
      if (quantity > 0) {
        // Если товар уже в корзине, удаляем его
        const cartItem = cartItems.find(item => item.product?.id === product.id);
        if (cartItem) {
          await removeFromCart(cartItem.id);
          showNotification(`${product.name} удален из корзины`);
        }
      } else {
        // Если товара нет в корзине, добавляем его в указанном количестве
        const quantityToAdd = itemQuantities[product.id] || 1;
        await addToCart(product.id, quantityToAdd);
        showNotification(`${product.name} добавлен в корзину`);
      }
    } catch (error) {
      console.error('Ошибка управления корзиной:', error);
      showNotification('Произошла ошибка. Попробуйте еще раз');
    }
  };
  
  // Получение количества товара в корзине
  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.product?.id === productId);
    return item ? item.quantity : 0;
  };
  
  // Обработчик изменения количества товара
  const handleQuantityChange = (productId, delta) => {
    setItemQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, currentQuantity + delta);
      return { ...prev, [productId]: newQuantity };
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <div className="product-card text-center h-full flex flex-col">
            <Link to={`/catalog/${product.id}`} className="block flex-grow">
              <div className="h-40 overflow-hidden bg-gray-50">
                <motion.img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  initial="initial"
                  whileHover="hover"
                  variants={imageVariants}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <div className="p-3">
                <h6 className="text-sm font-medium mb-2 text-text line-clamp-2">{product.name}</h6>
                <div className="text-xs text-text-secondary mb-1">
                  Артикул: {product.sku}
                </div>
                <div className="text-sm font-medium text-primary">
                  {product.price}
                  {product.base_price && (
                    <div className="text-xs text-text-secondary">
                      от {product.base_price.toLocaleString('ru-RU')} ₽
                    </div>
                  )}
                </div>
              </div>
            </Link>
            
            {/* Управление количеством и добавление в корзину */}
            <div className="mt-auto p-3 pt-0">
              {getCartQuantity(product.id) > 0 ? (
                // Если товар в корзине - показываем управление количеством или кнопку удаления
                <div className="flex items-center gap-1 mt-1">
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleCart(product);
                    }}
                    fullWidth
                    className="text-red-500 border-red-200 hover:bg-red-50 text-xs py-1.5"
                    icon={<FiTrash2 size={12} className="mr-1" />}
                  >
                    Удалить ({getCartQuantity(product.id)})
                  </Button>
                </div>
              ) : (
                // Если товара нет в корзине - показываем выбор количества и кнопку добавления
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuantityChange(product.id, -1);
                      }}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                      disabled={itemQuantities[product.id] <= 1}
                    >
                      <FiMinus size={12} />
                    </button>
                    
                    <span className="w-6 text-center font-medium text-text text-sm">
                      {itemQuantities[product.id] || 1}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleQuantityChange(product.id, 1);
                      }}
                      className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleCart(product);
                    }}
                    fullWidth
                    className="text-xs py-1.5"
                    icon={<FiShoppingCart size={12} className="mr-1" />}
                  >
                    В корзину
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ProductSamples;