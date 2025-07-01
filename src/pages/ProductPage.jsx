import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiDownload, 
  FiMessageSquare, 
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiInfo
} from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import WebApp from '@twa-dev/sdk';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import FeedbackForm from '../components/feedback/FeedbackForm';
import ProductDetails from '../components/catalog/ProductDetails';
import { showNotification } from '../utils/telegramUtils';
import { useCart } from '../contexts/CartContext';

// Создаем клиента Supabase (глобальный для страницы)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite, cartItems, currentUser } = useCart();
  
  // Состояния
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Состояния для слайдера похожих продуктов
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(1);
  
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

  // Получение количества товара в корзине
  const getCartQuantity = () => {
    if (!product || !cartItems) return 0;
    
    const cartItem = cartItems.find(item => item.product?.id === product.id);
    return cartItem ? cartItem.quantity : 0;
  };

  // Проверка размеров экрана для определения количества слайдов
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) setSlidesPerView(4); // xl
      else if (window.innerWidth >= 1024) setSlidesPerView(3); // lg
      else if (window.innerWidth >= 768) setSlidesPerView(2); // md
      else setSlidesPerView(1); // sm и меньше
    };

    handleResize(); // Вызываем при монтировании
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Инициализация Telegram WebApp
  useEffect(() => {
    // Один раз инициализируем WebApp
    if (typeof WebApp !== 'undefined') {
      try {
        WebApp.ready();
      } catch (e) {
        console.warn('Telegram WebApp initialization error:', e);
      }
    }
  }, []);

  // Кнопка "Назад" для Telegram WebApp
  useEffect(() => {
    const setupBackButton = () => {
      try {
        if (WebApp && WebApp.BackButton) {
          WebApp.BackButton.isVisible = true;
          WebApp.BackButton.onClick(() => navigate(-1));
        }
      } catch (e) {
        console.warn('Error setting up back button:', e);
      }
    };
    
    setupBackButton();
    
    return () => {
      try {
        if (WebApp && WebApp.BackButton) {
          WebApp.BackButton.isVisible = false;
          WebApp.BackButton.offClick();
        }
      } catch (e) {
        console.warn('Error cleaning up back button:', e);
      }
    };
  }, [navigate]);

  // Инициализация
  useEffect(() => {
    let isComponentMounted = true;
    
    const initialize = async () => {
      try {
        // Загружаем продукт
        await loadProduct();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        if (isComponentMounted) {
          setLoadError('Произошла ошибка при загрузке данных');
        }
      } finally {
        if (isComponentMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      initialize();
    } else {
      navigate('/catalog');
    }
    
    return () => {
      isComponentMounted = false;
    };
  }, [id, navigate]);

  // Загрузка продукта
  const loadProduct = async () => {
    try {
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .eq('id', id)
        .single();

      if (productError) {
        console.error('Ошибка загрузки продукта:', productError);
        setLoadError('Товар не найден');
        return;
      }

      // Парсим specifications если это строка
      let specifications = [];
      if (productData.specifications) {
        try {
          specifications = typeof productData.specifications === 'string' 
            ? JSON.parse(productData.specifications) 
            : productData.specifications;
        } catch (error) {
          console.error('Ошибка парсинга specifications:', error);
          specifications = [];
        }
      }

      // Дополнительно загружаем расширенные данные о продукте
      const extendedProductData = {
        ...productData,
        categoryName: productData.category?.name || 'Без категории',
        specifications: specifications || [],
        cas_number: productData.cas_number || '80714-61-0',
        quantity: productData.quantity || '10 мл',
        peptide_content: productData.peptide_content || '0,1% (10 мг)',
        purity: productData.purity || 'более 97%',
        form: productData.form || 'раствор в дозаторе',
        auxiliary_substances: productData.auxiliary_substances || 'вода очищенная, натрия хлорид, метилпарабен',
        storage: productData.storage || 'не более +5 °С',
        sequence: productData.sequence || 'Met-Glu-His-Phe-Pro-Gly-Pro',
        chemical_name: productData.chemical_name || 'метионил-глутамил-гистидил-фенилаланил-пролил-глицил-пролина ацетат',
        molecular_weight: productData.molecular_weight || '813,922',
        molecular_formula: productData.molecular_formula || 'C41H53N9O10S',
        synonyms: productData.synonyms || 'MEHFPGP, ACTH (4-7) Pro-Gly-Pro-',
        research_area: productData.research_area || 'нейропротекторная и ноотропная активность',
        dosage: productData.dosage || '1 нажатие — 125 мкг'
      };

      setProduct(extendedProductData);

      // Загружаем похожие продукты
      if (productData.category_id) {
        await loadRelatedProducts(productData.category_id, id);
      }
    } catch (error) {
      console.error('Ошибка загрузки продукта:', error);
      setLoadError('Произошла ошибка при загрузке товара');
    }
  };

  // Загрузка похожих продуктов
  const loadRelatedProducts = async (categoryId, currentProductId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          base_price,
          image_url,
          sku,
          category:product_categories(name)
        `)
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .eq('in_stock', true)
        .limit(8);

      if (error) throw error;
      
      // Обогащаем данные продуктов
      const enrichedProducts = (data || []).map(product => ({
        ...product,
        categoryName: product.category?.name || 'Без категории'
      }));

      setRelatedProducts(enrichedProducts);
    } catch (error) {
      console.error('Ошибка загрузки похожих продуктов:', error);
    }
  };

  // Переключение избранного
  const handleToggleFavorite = async () => {
    if (!currentUser) {
      showNotification('Войдите в аккаунт для добавления в избранное');
      return;
    }

    try {
      await toggleFavorite(product.id);
      showNotification(
        isFavorite(product.id) 
          ? 'Товар удален из избранного' 
          : 'Товар добавлен в избранное'
      );
    } catch (error) {
      console.error('Ошибка управления избранным:', error);
      showNotification('Произошла ошибка. Попробуйте еще раз');
    }
  };

  // Добавление в корзину
  const handleAddToCart = async () => {
    if (!currentUser) {
      showNotification('Войдите в аккаунт для добавления в корзину');
      return;
    }

    try {
      await addToCart(product.id);
      showNotification(`${product.name} добавлен в корзину`);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showNotification('Произошла ошибка. Попробуйте еще раз');
    }
  };

  // Открытие формы обратной связи
  const handleOpenFeedbackForm = () => {
    setShowFeedbackForm(true);
  };
  
  // Открытие модального окна с детальной информацией
  const handleShowDetails = () => {
    setShowDetailsModal(true);
  };

  // Варианты анимации для изображения
  const imageVariants = {
    initial: { scale: 1, filter: 'brightness(1)' },
    hover: { scale: 1.05, filter: 'brightness(1.1) contrast(1.05)' }
  };

  // Форматирование цены продукта
  const formatProductPrice = (product) => {
    if (!product) return 'По запросу';
    
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

  // Переход к предыдущему слайду похожих продуктов
  const prevRelatedSlide = () => {
    const maxSlides = Math.ceil(relatedProducts.length / slidesPerView) - 1;
    setCurrentSlide(prev => prev <= 0 ? maxSlides : prev - 1);
  };

  // Переход к следующему слайду похожих продуктов
  const nextRelatedSlide = () => {
    const maxSlides = Math.ceil(relatedProducts.length / slidesPerView) - 1;
    setCurrentSlide(prev => prev >= maxSlides ? 0 : prev + 1);
  };

  // Получение текущих отображаемых похожих продуктов
  const getCurrentRelatedProducts = () => {
    const startIndex = currentSlide * slidesPerView;
    return relatedProducts.slice(startIndex, startIndex + slidesPerView);
  };

  if (loading) {
    return (
      <Section variant="default" className="py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="w-full h-64 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (loadError) {
    return (
      <Section variant="default" className="py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{loadError}</h1>
          <p className="text-text-secondary mb-4">
            Произошла ошибка при загрузке данных о товаре.
          </p>
          <Button variant="primary" to="/catalog">
            Вернуться в каталог
          </Button>
        </div>
      </Section>
    );
  }

  if (!product) {
    return (
      <Section variant="default" className="py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <p className="text-text-secondary mb-4">
            Запрашиваемый товар не существует или был удален
          </p>
          <Button variant="primary" to="/catalog">
            Вернуться в каталог
          </Button>
        </div>
      </Section>
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
      <Section variant="default" className="py-6">
        {/* Навигация назад */}
        <Button
          variant="text"
          onClick={() => navigate(-1)}
          icon={<FiArrowLeft size={16} />}
          className="mb-4"
        >
          Назад к каталогу
        </Button>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {/* Изображение продукта */}
          <div className="relative w-full h-64 md:h-96 bg-gray-50">
            <motion.img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-contain"
              initial="initial"
              whileHover="hover"
              variants={imageVariants}
              transition={{ duration: 0.4 }}
            />
            
            {/* Кнопка избранного */}
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isFavorite(product.id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-text-secondary hover:text-red-500'
              }`}
            >
              <FiHeart size={20} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          {/* Информация о продукте */}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-text mb-2">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <span className="bg-primary-bg text-primary text-xs font-medium px-2 py-1 rounded-full">
                {product.categoryName}
              </span>
              <span className="ml-2 text-xs text-text-secondary">
                Артикул: {product.sku}
              </span>
            </div>
            
            <div className="flex items-baseline mb-6">
              <div className="text-2xl font-bold text-primary mr-2">
                {formatProductPrice(product)}
              </div>
              
              {/* Отображение количества в корзине */}
              {getCartQuantity() > 0 && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  В корзине: {getCartQuantity()}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Описание</h3>
              <p className="text-sm text-text-secondary">{product.description}</p>
            </div>
            
            {/* Основные характеристики */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Характеристики</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex justify-between py-1 border-b border-divider">
                  <span className="text-sm text-text-secondary">Количество:</span>
                  <span className="text-sm font-medium">{product.quantity || '10 мл'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider">
                  <span className="text-sm text-text-secondary">Содержание пептида:</span>
                  <span className="text-sm font-medium">{product.peptide_content || '0,1% (10 мг)'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider">
                  <span className="text-sm text-text-secondary">Чистота:</span>
                  <span className="text-sm font-medium">{product.purity || 'более 97%'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider">
                  <span className="text-sm text-text-secondary">Форма:</span>
                  <span className="text-sm font-medium">{product.form || 'раствор в дозаторе'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-divider">
                  <span className="text-sm text-text-secondary">Хранение:</span>
                  <span className="text-sm font-medium">{product.storage || 'не более +5 °С'}</span>
                </div>
              </div>
              <Button 
                variant="text"
                className="mt-3 text-primary"
                onClick={handleShowDetails}
              >
                Показать все характеристики
              </Button>
            </div>
            
            {/* Кнопки действий */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Button 
                  variant="primary"
                  icon={<FiShoppingCart size={16} />}
                  fullWidth
                  onClick={handleAddToCart}
                >
                  {getCartQuantity() > 0 
                    ? `В корзине (${getCartQuantity()}) • Добавить еще` 
                    : 'Добавить в корзину'
                  }
                </Button>
                
                <Button 
                  variant={isFavorite(product.id) ? 'primary' : 'outlined'}
                  icon={<FiHeart size={16} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />}
                  onClick={handleToggleFavorite}
                  className={isFavorite(product.id) ? 'bg-red-500 border-red-500 hover:bg-red-600' : ''}
                />
              </div>
              
              <Button 
                variant="secondary"
                icon={<FiMessageSquare size={16} />}
                fullWidth
                onClick={handleOpenFeedbackForm}
              >
                Задать вопрос о товаре
              </Button>
              
              <Button 
                variant="outlined"
                icon={<FiInfo size={16} />}
                fullWidth
                onClick={handleShowDetails}
              >
                Подробные характеристики
              </Button>
              
              {product.datasheet && (
                <Button 
                  variant="outlined"
                  icon={<FiDownload size={16} />}
                  fullWidth
                  href={product.datasheet}
                >
                  Скачать спецификацию
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Метки пептидов (теги) */}
        <div className="mt-8 pt-4 border-t border-divider">
          <h3 className="text-lg font-semibold mb-3">Категории</h3>
          <div className="flex flex-wrap gap-2">
            {['Пептиды', 'Сигнальные пептиды', 'Ноотропы', 'Нейропептиды'].map((tag) => (
              <a
                key={tag}
                href={`/catalog?tag=${tag.toLowerCase()}`}
                className="px-3 py-1 text-sm rounded-full bg-white border border-divider text-text-secondary hover:bg-primary-bg hover:text-primary hover:border-primary transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        </div>
        
        {/* Похожие продукты (слайдер) */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Похожие продукты</h3>
              
              {relatedProducts.length > slidesPerView && (
                <div className="flex space-x-2">
                  <button 
                    onClick={prevRelatedSlide} 
                    className="w-10 h-10 rounded-full bg-white text-primary border border-primary hover:bg-primary-bg flex items-center justify-center"
                    aria-label="Предыдущий слайд"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextRelatedSlide} 
                    className="w-10 h-10 rounded-full bg-white text-primary border border-primary hover:bg-primary-bg flex items-center justify-center"
                    aria-label="Следующий слайд"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                  className="flex"
                >
                  {getCurrentRelatedProducts().map(relatedProduct => (
                    <div 
                      key={relatedProduct.id}
                      className={`px-2 ${
                        slidesPerView === 1 ? 'w-full' :
                        slidesPerView === 2 ? 'w-1/2' :
                        slidesPerView === 3 ? 'w-1/3' :
                        'w-1/4'
                      }`}
                    >
                      <div 
                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
                        onClick={() => navigate(`/catalog/${relatedProduct.id}`)}
                      >
                        <div className="h-32 bg-gray-50 overflow-hidden">
                          <motion.img 
                            src={relatedProduct.image_url} 
                            alt={relatedProduct.name} 
                            className="w-full h-full object-contain"
                            initial="initial"
                            whileHover="hover"
                            variants={imageVariants}
                            transition={{ duration: 0.4 }}
                          />
                        </div>
                        <div className="p-3 flex flex-col flex-grow">
                          <h4 className="text-sm font-medium mb-1 line-clamp-2">{relatedProduct.name}</h4>
                          <div className="mt-auto flex justify-between items-baseline">
                            <div className="text-xs text-text-secondary">{relatedProduct.categoryName}</div>
                            <div className="text-sm text-primary font-medium">
                              {formatProductPrice(relatedProduct)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Индикаторы слайдов (точки) */}
            {relatedProducts.length > slidesPerView && (
              <div className="flex justify-center space-x-2 mt-4">
                {[...Array(Math.ceil(relatedProducts.length / slidesPerView))].map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Перейти к слайду ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Форма обратной связи */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        productId={product.id}
        productName={product.name}
        currentUser={currentUser}
      />
      
      {/* Модальное окно с подробной информацией */}
      <ProductDetails
        product={product}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </motion.div>
  );
};

export default ProductPage;