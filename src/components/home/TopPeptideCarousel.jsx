import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiInfo } from 'react-icons/fi';
import supabase from '../../lib/supabase';
import Button from '../ui/Button';
import { useCart } from '../../contexts/CartContext';
import { showNotification } from '../../utils/telegramUtils';

const TopPeptideCarousel = () => {
  const [topPeptides, setTopPeptides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [displayCount, setDisplayCount] = useState(1); // Количество отображаемых карточек
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, isFavorite, toggleFavorite, currentUser } = useCart();
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Загрузка популярных пептидов и категорий
  useEffect(() => {
    loadTopPeptides();
    loadCategories();

    // Определяем количество отображаемых карточек в зависимости от ширины экрана
    const handleResize = () => {
      if (window.innerWidth >= 1280) setDisplayCount(4); // xl
      else if (window.innerWidth >= 1024) setDisplayCount(3); // lg
      else if (window.innerWidth >= 768) setDisplayCount(2); // md
      else setDisplayCount(1); // sm и меньше
    };

    handleResize(); // Вызываем при монтировании
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Загрузка категорий продуктов
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*');

      if (error) throw error;
      
      // Добавляем категорию "Все" в начало списка
      const allCategories = [
        { id: 'all', name: 'Все пептиды' },
        ...(data || [])
      ];
      
      setCategories(allCategories);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      setCategories([{ id: 'all', name: 'Все пептиды' }]);
    }
  };

  // Загрузка популярных пептидов
  const loadTopPeptides = async (categoryId = null) => {
    try {
      // Базовый запрос с выбором всех нужных полей и связей
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          base_price,
          image_url,
          sku,
          description,
          in_stock,
          category_id,
          category:product_categories(name)
        `)
        .eq('in_stock', true);
      
      // Добавляем фильтр по категории, если она выбрана
      if (categoryId && categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }
      
      // Завершаем запрос, сортируя по дате создания (новые в начале)
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(12); // Увеличиваем лимит для большего выбора

      if (error) throw error;
      
      // Обогащаем данные продуктов
      const enrichedProducts = (data || []).map(product => ({
        ...product,
        categoryName: product.category?.name || 'Без категории'
      }));

      setTopPeptides(enrichedProducts);
    } catch (error) {
      console.error('Ошибка загрузки топ пептидов:', error);
      // Fallback для демонстрации
      setTopPeptides(fallbackPeptides);
    } finally {
      setLoading(false);
    }
  };

  // Fallback данные на случай ошибки
  const fallbackPeptides = [
    {
      id: 'pep1',
      name: 'Пептид A',
      sku: 'PEP-001',
      price: '5800 ₽',
      base_price: 5800,
      image_url: 'https://images.pexels.com/photos/8325971/pexels-photo-8325971.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Биоактивные пептиды',
      in_stock: true
    },
    {
      id: 'pep2',
      name: 'Пептид B',
      sku: 'PEP-002',
      price: '7200 ₽',
      base_price: 7200,
      image_url: 'https://images.pexels.com/photos/8325913/pexels-photo-8325913.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Регуляторные пептиды',
      in_stock: true
    },
    {
      id: 'pep3',
      name: 'Пептид C',
      sku: 'PEP-003',
      price: '4500 ₽',
      base_price: 4500,
      image_url: 'https://images.pexels.com/photos/8326285/pexels-photo-8326285.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Пептидные гормоны',
      in_stock: true
    },
    {
      id: 'pep4',
      name: 'Пептид D',
      sku: 'PEP-004',
      price: '9300 ₽',
      base_price: 9300,
      image_url: 'https://images.pexels.com/photos/8325764/pexels-photo-8325764.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Структурные пептиды',
      in_stock: true
    },
    {
      id: 'pep5',
      name: 'Пептид E',
      sku: 'PEP-005',
      price: '6400 ₽',
      base_price: 6400,
      image_url: 'https://images.pexels.com/photos/8326542/pexels-photo-8326542.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Сигнальные пептиды',
      in_stock: true
    },
    {
      id: 'pep6',
      name: 'Пептид F',
      sku: 'PEP-006',
      price: '8100 ₽',
      base_price: 8100,
      image_url: 'https://images.pexels.com/photos/8326286/pexels-photo-8326286.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Защитные пептиды',
      in_stock: true
    },
    {
      id: 'pep7',
      name: 'Пептид G',
      sku: 'PEP-007',
      price: '7800 ₽',
      base_price: 7800,
      image_url: 'https://images.pexels.com/photos/8325932/pexels-photo-8325932.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Транспортные пептиды',
      in_stock: true
    },
    {
      id: 'pep8',
      name: 'Пептид H',
      sku: 'PEP-008',
      price: '5200 ₽',
      base_price: 5200,
      image_url: 'https://images.pexels.com/photos/8325902/pexels-photo-8325902.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Биоактивные пептиды',
      in_stock: true
    },
    {
      id: 'pep9',
      name: 'Пептид I',
      sku: 'PEP-009',
      price: '6900 ₽',
      base_price: 6900,
      image_url: 'https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Регуляторные пептиды',
      in_stock: true
    },
    {
      id: 'pep10',
      name: 'Пептид J',
      sku: 'PEP-010',
      price: '5500 ₽',
      base_price: 5500,
      image_url: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=600',
      categoryName: 'Пептидные гормоны',
      in_stock: true
    }
  ];

  // Обработчик смены категории
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentSlide(0); // Сбрасываем на первый слайд
    loadTopPeptides(categoryId);
  };

  // Обработчик начала свайпа
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  // Обработчик движения при свайпе
  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  // Обработчик окончания свайпа
  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const diffX = touchStartX - touchEndX;
    const threshold = 50; // Минимальное расстояние для распознавания свайпа
    
    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Свайп влево - следующий слайд
        nextSlide();
      } else {
        // Свайп вправо - предыдущий слайд
        prevSlide();
      }
    }
    
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Переход к предыдущему слайду
  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? Math.ceil(topPeptides.length / displayCount) - 1 : prev - 1
    );
  };

  // Переход к следующему слайду
  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === Math.ceil(topPeptides.length / displayCount) - 1 ? 0 : prev + 1
    );
  };

  // Форматирование цены товара
  const formatProductPrice = (product) => {
    if (product.base_price) {
      return `${product.base_price.toLocaleString('ru-RU')} ₽`;
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

  // Обработчик добавления в корзину
  const handleAddToCart = async (product) => {
    if (!currentUser) {
      showNotification('Для добавления в корзину необходимо авторизоваться');
      return;
    }

    try {
      await addToCart(product.id);
      showNotification(`${product.name} добавлен в корзину`);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      showNotification('Произошла ошибка при добавлении в корзину');
    }
  };

  // Обработчик переключения избранного
  const handleToggleFavorite = async (product) => {
    if (!currentUser) {
      showNotification('Для добавления в избранное необходимо авторизоваться');
      return;
    }

    try {
      await toggleFavorite(product.id);
      showNotification(
        isFavorite(product.id) 
          ? `${product.name} удален из избранного` 
          : `${product.name} добавлен в избранное`
      );
    } catch (error) {
      console.error('Ошибка управления избранным:', error);
      showNotification('Произошла ошибка');
    }
  };
  
  // Переход на страницу продукта
  const handleViewProduct = (productId) => {
    navigate(`/catalog/${productId}`);
  };

  // Функция для расчета текущей группы слайдов
  const getCurrentSlides = () => {
    const startIndex = currentSlide * displayCount;
    return topPeptides.slice(startIndex, startIndex + displayCount);
  };

  // Если данные загружаются
  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Популярные пептиды</h3>
        <div className="flex overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-2">
              <div className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse h-72">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Популярные пептиды</h3>
      </div>
      
      {/* Фильтр по категориям */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-secondary border border-divider hover:border-primary hover:text-primary'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div 
        className="relative overflow-hidden"
        ref={carouselRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="flex"
          >
            {getCurrentSlides().map((product) => (
              <div 
                key={product.id} 
                className={`p-2 ${
                  displayCount === 1 ? 'w-full' : 
                  displayCount === 2 ? 'w-1/2' : 
                  displayCount === 3 ? 'w-1/3' : 
                  'w-1/4'
                }`}
              >
                <div className="product-card h-full flex flex-col">
                  <Link to={`/catalog/${product.id}`} className="block overflow-hidden">
                    <div className="h-40 overflow-hidden bg-gray-50 relative">
                      <motion.img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-contain"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      />
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleFavorite(product);
                        }}
                        className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          isFavorite(product.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-text-secondary hover:text-red-500'
                        }`}
                      >
                        <FiHeart size={14} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </Link>
                  
                  <div className="p-4 flex-grow flex flex-col">
                    <Link to={`/catalog/${product.id}`}>
                      <h4 className="font-medium text-text hover:text-primary transition-colors mb-1 line-clamp-2">
                        {product.name}
                      </h4>
                    </Link>
                    
                    <div className="flex justify-between items-baseline mb-2 text-xs text-text-secondary">
                      <span>Артикул: {product.sku}</span>
                      <span className="bg-primary-bg px-2 py-0.5 rounded-full text-primary">
                        {product.categoryName}
                      </span>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="font-semibold text-primary mb-3">
                        {formatProductPrice(product)}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="flex-grow"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                          icon={<FiShoppingCart size={14} />}
                        >
                          В корзину
                        </Button>
                        
                        <Button 
                          variant="outlined" 
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewProduct(product.id);
                          }}
                          icon={<FiInfo size={14} />}
                        />
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
      <div className="flex justify-center space-x-2 mt-6">
        {[...Array(Math.ceil(topPeptides.length / displayCount))].map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full ${
              currentSlide === index ? 'bg-primary' : 'bg-gray-300'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="text-center mt-6">
        <Button 
          to="/catalog" 
          variant="primary"
        >
          Смотреть все пептиды
        </Button>
      </div>
    </div>
  );
};

export default TopPeptideCarousel;