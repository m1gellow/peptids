import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiFilter, FiChevronDown, FiMessageSquare, FiTag } from 'react-icons/fi';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import SearchBar from '../components/catalog/SearchBar';
import CategoryFilter from '../components/catalog/CategoryFilter';
import SortFilter from '../components/catalog/SortFilter';
import FeedbackForm from '../components/feedback/FeedbackForm';
import PaginationControls from '../components/ui/PaginationControls';
import ProductCard from '../components/catalog/ProductCard';
import ProductQuickView from '../components/catalog/ProductQuickView';
import ProductDetails from '../components/catalog/ProductDetails';
import SwipeGuide from '../components/ui/SwipeGuide';
import { showNotification } from '../utils/telegramUtils';
import { AdvancedSearch } from '../utils/searchUtils';
import { useCart } from '../contexts/CartContext';
import supabase from '../lib/supabase';


export default function CatalogPage() {
  // Состояния поиска и фильтров
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  // Состояния данных
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productQuantities, setProductQuantities] = useState({});
  
  // Состояния UI
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackProduct, setFeedbackProduct] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Состояния пагинации
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Получаем контекст корзины
  const { 
    cartItems, 
    addToCart, 
    removeFromCart,
    toggleFavorite, 
    isFavorite,
    currentUser
  } = useCart();

  // Создаем экземпляр продвинутого поиска
  const advancedSearch = useMemo(() => {
    return new AdvancedSearch(products, ['name', 'description', 'sku']);
  }, [products]);

  // Опции сортировки
  const sortOptions = [
    { value: 'relevance', label: 'По релевантности' },
    { value: 'name_asc', label: 'По названию (А-Я)' },
    { value: 'name_desc', label: 'По названию (Я-А)' },
    { value: 'price_asc', label: 'По цене (возрастание)' },
    { value: 'price_desc', label: 'По цене (убывание)' },
    { value: 'newest', label: 'Сначала новые' }
  ];

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

  // Проверяем URL параметры
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tagParam = searchParams.get('tag');
    
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [location]);

  // Инициализация состояний при первой загрузке компонента
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Загружаем товары и категории
        await loadProductsAndCategories();
        await loadTags();
        
        // Инициализируем количество товаров
        if (products.length > 0) {
          const initialQuantities = {};
          products.forEach(product => {
            initialQuantities[product.id] = 1;
          });
          setProductQuantities(initialQuantities);
        }
        
      } catch (error) {
        console.error('Ошибка инициализации компонента:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeComponent();
  }, []);

  // Загрузка продуктов и категорий из базы данных
  const loadProductsAndCategories = async () => {
    setLoading(true);
    try {
      // Загружаем продукты
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .eq('in_stock', true);

      if (productsError) throw productsError;

      // Обогащаем данные продуктов
      const enrichedProducts = (productsData || []).map(product => ({
        ...product,
        categoryName: product.category?.name || 'Без категории'
      }));

      setProducts(enrichedProducts);
      
      // Инициализируем количество товаров
      const initialQuantities = {};
      enrichedProducts.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setProductQuantities(initialQuantities);

      // Загружаем категории
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      // Подсчитываем количество товаров в каждой категории
      const categoriesWithCount = [
        { id: 'all', name: 'Все продукты', count: enrichedProducts.length },
        ...(categoriesData || []).map(category => ({
          ...category,
          count: enrichedProducts.filter(p => p.category_id === category.id).length
        }))
      ];

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showNotification('Ошибка загрузки каталога');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка тегов из базы данных
  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('product_tags')
        .select('*')
        .eq('is_active', true)
        .order('product_count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Ошибка загрузки тегов:', error);
    }
  };

  // Загрузка продуктов по тегу
  const loadProductsByTag = async (tagSlug) => {
    if (!tagSlug) return;

    setLoading(true);
    try {
      // Сначала получаем ID тега
      const { data: tagData, error: tagError } = await supabase
        .from('product_tags')
        .select('id')
        .eq('slug', tagSlug)
        .single();

      if (tagError) throw tagError;

      if (!tagData) {
        throw new Error('Тег не найден');
      }

      // Затем получаем ID продуктов, связанных с этим тегом
      const { data: relationData, error: relationError } = await supabase
        .from('product_tags_products')
        .select('product_id')
        .eq('tag_id', tagData.id);

      if (relationError) throw relationError;

      if (!relationData || relationData.length === 0) {
        // Если нет связей, просто очищаем фильтр
        setSelectedTag('');
        return;
      }

      // Получаем ID продуктов из связей
      const productIds = relationData.map(relation => relation.product_id);

      // Наконец, загружаем детали продуктов
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:product_categories(name)
        `)
        .in('id', productIds)
        .eq('in_stock', true);

      if (productsError) throw productsError;

      // Обогащаем данные продуктов
      const enrichedProducts = (productsData || []).map(product => ({
        ...product,
        categoryName: product.category?.name || 'Без категории'
      }));

      setProducts(enrichedProducts);
      
      // Инициализируем количество товаров
      const initialQuantities = {};
      enrichedProducts.forEach(product => {
        initialQuantities[product.id] = 1;
      });
      setProductQuantities(initialQuantities);
      
    } catch (error) {
      console.error('Ошибка загрузки продуктов по тегу:', error);
      showNotification('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  };

  // Следим за изменением выбранного тега
  useEffect(() => {
    if (selectedTag) {
      loadProductsByTag(selectedTag);
    } else {
      // Если тег сброшен, загружаем все продукты
      loadProductsAndCategories();
    }
  }, [selectedTag]);

  // Обновление поисковых предложений при изменении запроса
  useEffect(() => {
    if (searchTerm.length > 1) {
      const suggestions = advancedSearch.getAutocomplete(searchTerm, 8);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm, advancedSearch]);

  // Добавление/удаление из избранного
  const handleToggleFavorite = async (productId) => {
    if (!currentUser) {
      showNotification('Войдите в аккаунт для добавления в избранное');
      return;
    }

    try {
      await toggleFavorite(productId);
      showNotification(
        isFavorite(productId) 
          ? 'Товар удален из избранного' 
          : 'Товар добавлен в избранное'
      );
    } catch (error) {
      console.error('Ошибка управления избранным:', error);
      showNotification('Произошла ошибка. Попробуйте еще раз');
    }
  };

  // Добавление/удаление из корзины
  const handleToggleCart = async (productId, customQuantity = null) => {
    if (!currentUser) {
      showNotification('Войдите в аккаунт для добавления в корзину');
      return;
    }

    try {
      const cartItem = cartItems.find(item => item.product?.id === productId);
      
      if (cartItem) {
        // Если товар уже в корзине, удаляем его
        await removeFromCart(cartItem.id);
        showNotification('Товар удален из корзины');
      } else {
        // Если товара нет в корзине, добавляем его в указанном количестве
        const quantityToAdd = customQuantity || productQuantities[productId] || 1;
        await addToCart(productId, quantityToAdd);
        showNotification('Товар добавлен в корзину');
      }
    } catch (error) {
      console.error('Ошибка управления корзиной:', error);
      showNotification('Произошла ошибка. Попробуйте еще раз');
    }
  };

  // Открытие формы обратной связи о товаре
  const handleProductInquiry = (product) => {
    setFeedbackProduct(product);
    setShowFeedbackForm(true);
  };

  // Открытие быстрого просмотра товара
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
  };
  
  // Открытие детального просмотра товара
  const handleDetailsView = (product) => {
    setQuickViewProduct(product);
    setShowDetailsModal(true);
  };
  
  // Обработчик изменения количества товара
  const handleQuantityChange = (productId, delta) => {
    setProductQuantities(prev => {
      const currentQuantity = prev[productId] || 1;
      const newQuantity = Math.max(1, currentQuantity + delta);
      return { ...prev, [productId]: newQuantity };
    });
  };

  // Фильтрация и сортировка продуктов
  const filteredAndSortedProducts = useMemo(() => {
    let results = products;

    // Применяем поиск
    if (searchTerm.trim()) {
      results = advancedSearch.search(searchTerm, {
        threshold: 0.2,
        filterBy: selectedCategory !== 'all' 
          ? (item) => item.category_id === selectedCategory
          : null
      });
    } else {
      // Фильтр по категории без поиска
      if (selectedCategory !== 'all') {
        results = results.filter(product => product.category_id === selectedCategory);
      }
    }

    // Применяем сортировку
    results.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'ru');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'ru');
        case 'price_asc':
          return (a.base_price || 0) - (b.base_price || 0);
        case 'price_desc':
          return (b.base_price || 0) - (a.base_price || 0);
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'relevance':
        default:
          // Если есть поисковый запрос, используем _searchScore
          if (searchTerm.trim() && a._searchScore !== undefined) {
            return (b._searchScore || 0) - (a._searchScore || 0);
          }
          return 0;
      }
    });

    return results;
  }, [searchTerm, selectedCategory, sortBy, advancedSearch, products, selectedTag]);

  // Пагинация данных
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedProducts.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedProducts, currentPage, pageSize]);

  // Получение данных о выбранной категории
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Получение количества товара в корзине
  const getCartQuantity = (productId) => {
    const item = cartItems.find(item => item.product?.id === productId);
    return item ? item.quantity : 0;
  };

  // Обработчик изменения страницы
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Прокручиваем страницу вверх при переходе на новую страницу
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Обработчик изменения размера страницы
  const handlePageSizeChange = (size) => {
    setPageSize(size);
    // При изменении размера страницы возвращаемся на первую страницу
    setCurrentPage(1);
  };

  // Сброс фильтра по тегу
  const handleClearTagFilter = () => {
    setSelectedTag('');
    // Удаляем параметр из URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tag');
    navigate({ search: searchParams.toString() });
  };

  // Получаем имя выбранного тега
  const getSelectedTagName = () => {
    if (!selectedTag) return null;
    const tag = tags.find(t => t.slug === selectedTag);
    return tag ? tag.name : selectedTag;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Загрузка каталога...</div>
      </div>
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
      <Section 
        title={<span className="text-primary">Каталог продукции</span>}
        subtitle="Высококачественные пептиды и биоактивные соединения для исследований"
        variant="primary"
        className="py-6"
        centered
      >
        {/* Поиск и фильтры */}
        <div className="mb-6 space-y-4">
          {/* Строка поиска */}
          <SearchBar
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Сбрасываем на первую страницу при поиске
            }}
            placeholder="Поиск по названию, артикулу, описанию..."
            suggestions={searchSuggestions}
            onClear={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
          />

          {/* Фильтры и сортировка - измененная структура для мобильных */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Кнопка показа фильтров на мобильных */}
            <div className="md:hidden w-full">
              <Button 
                variant="secondary"
                icon={<FiFilter size={16} />}
                onClick={() => setShowFilters(!showFilters)}
                fullWidth
              >
                Фильтры
                <FiChevronDown 
                  size={16} 
                  className={`ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} 
                />
              </Button>
            </div>

            {/* Блок сортировки - на мобильных отдельно от фильтров */}
            <div className="w-full md:w-auto">
              <div className="text-sm font-medium mb-2 text-text-secondary md:hidden">
                Сортировка:
              </div>
              <SortFilter
                value={sortBy}
                onChange={(value) => {
                  setSortBy(value);
                  setCurrentPage(1); // Сбрасываем на первую страницу при изменении сортировки
                }}
                options={sortOptions}
              />
            </div>
          </div>

          {/* Категории */}
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              setSelectedCategory(category);
              setCurrentPage(1); // Сбрасываем на первую страницу при изменении категории
            }}
            showFilters={showFilters}
          />

          {/* Информация о выбранной категории, теге и результатах поиска */}
          {(selectedCategoryData && selectedCategory !== 'all') || searchTerm || selectedTag ? (
            <div className="p-4 bg-primary-bg rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  {searchTerm && (
                    <h3 className="font-medium text-primary mb-1">
                      Результаты поиска: "{searchTerm}"
                    </h3>
                  )}
                  
                  {selectedTag && (
                    <div className="flex items-center mb-1">
                      <FiTag className="mr-1 text-primary" size={14} />
                      <h3 className="font-medium text-primary">
                        Метка: {getSelectedTagName()}
                      </h3>
                    </div>
                  )}
                  
                  {selectedCategoryData && selectedCategory !== 'all' && (
                    <h3 className="font-medium text-primary mb-1">
                      Категория: {selectedCategoryData.name}
                    </h3>
                  )}
                  
                  <p className="text-sm text-text-secondary">
                    Найдено продуктов: {filteredAndSortedProducts.length}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {selectedTag && (
                    <Button 
                      variant="text"
                      onClick={handleClearTagFilter}
                      className="text-xs"
                    >
                      Сбросить метку
                    </Button>
                  )}
                  
                  {(searchTerm || (selectedCategory !== 'all' && !selectedTag)) && (
                    <Button 
                      variant="text"
                      onClick={() => {
                        setSearchTerm('');
                        if (!selectedTag) {
                          setSelectedCategory('all');
                        }
                        setCurrentPage(1);
                      }}
                      className="text-xs"
                    >
                      Сбросить фильтры
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Пагинация (верхняя) */}
          {filteredAndSortedProducts.length > pageSize && (
            <PaginationControls
              totalItems={filteredAndSortedProducts.length}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              className="mt-4 mb-2"
            />
          )}
        </div>
        
        {/* Результаты */}
        <div>
          {filteredAndSortedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={isFavorite(product.id)}
                    cartQuantity={getCartQuantity(product.id)}
                    onToggleFavorite={() => handleToggleFavorite(product.id)}
                    onAddToCart={(quantity) => handleToggleCart(product.id, quantity)}
                    onInquiry={() => handleProductInquiry(product)}
                    onQuickView={() => handleQuickView(product)}
                  />
                ))}
              </div>

              {/* Пагинация (нижняя) */}
              {filteredAndSortedProducts.length > pageSize && (
                <PaginationControls
                  totalItems={filteredAndSortedProducts.length}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  className="mt-8"
                />
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <FiFilter size={48} className="text-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Ничего не найдено</h3>
                <p className="text-text-secondary">
                  {searchTerm 
                    ? `По вашему запросу "${searchTerm}" ${selectedCategory !== 'all' ? `в категории "${selectedCategoryData?.name}"` : ''} ничего не найдено.`
                    : selectedTag
                      ? `По выбранной метке "${getSelectedTagName()}" ничего не найдено.`
                      : `В категории "${selectedCategoryData?.name}" пока нет товаров.`
                  }
                </p>
                <p className="text-text-secondary text-sm mt-2">
                  Попробуйте изменить условия поиска или выбрать другую категорию.
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedTag('');
                  setCurrentPage(1);
                  
                  // Очищаем URL параметры
                  const searchParams = new URLSearchParams(location.search);
                  searchParams.delete('tag');
                  navigate({ search: searchParams.toString() });
                }}
              >
                Показать все товары
              </Button>
            </div>
          )}
        </div>

        {/* Теги пептидов */}
        {tags.length > 0 && (
          <div className="mt-8 border-t border-divider pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FiTag className="mr-2" /> Метки пептидов
            </h3>
            <div className="bg-white p-4 rounded-lg shadow-card">
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Button
                    key={tag.id}
                    variant={selectedTag === tag.slug ? 'primary' : 'outlined'}
                    size="sm"
                    onClick={() => {
                      // Если метка уже выбрана, снимаем выбор
                      if (selectedTag === tag.slug) {
                        setSelectedTag('');
                        
                        // Очищаем параметр из URL
                        const searchParams = new URLSearchParams(location.search);
                        searchParams.delete('tag');
                        navigate({ search: searchParams.toString() });
                      } else {
                        // Иначе выбираем метку
                        setSelectedTag(tag.slug);
                        
                        // Добавляем параметр в URL
                        const searchParams = new URLSearchParams(location.search);
                        searchParams.set('tag', tag.slug);
                        navigate({ search: searchParams.toString() });
                      }
                      setCurrentPage(1);
                    }}
                    className="text-xs"
                  >
                    {tag.name}
                    <span className="ml-1 text-xs opacity-70">({tag.product_count})</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Кнопка общей обратной связи */}
        <div className="mt-8 text-center">
          <Button 
            variant="outlined"
            icon={<FiMessageSquare size={16} />}
            onClick={() => setShowFeedbackForm(true)}
          >
            Задать вопрос или оставить отзыв
          </Button>
        </div>
      </Section>

      {/* Форма обратной связи */}
      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={() => {
          setShowFeedbackForm(false);
          setFeedbackProduct(null);
        }}
        productId={feedbackProduct?.id}
        productName={feedbackProduct?.name}
        currentUser={currentUser}
      />

      {/* Быстрый просмотр товара */}
      <ProductQuickView
        product={quickViewProduct}
        isFavorite={quickViewProduct ? isFavorite(quickViewProduct.id) : false}
        cartQuantity={quickViewProduct ? getCartQuantity(quickViewProduct.id) : 0}
        isOpen={!!quickViewProduct && !showDetailsModal}
        onClose={() => setQuickViewProduct(null)}
        onToggleFavorite={() => quickViewProduct && handleToggleFavorite(quickViewProduct.id)}
        onAddToCart={() => quickViewProduct && handleToggleCart(quickViewProduct.id)}
        onInquiry={() => {
          if (quickViewProduct) {
            handleProductInquiry(quickViewProduct);
            setQuickViewProduct(null);
          }
        }}
        onViewDetails={() => {
          if (quickViewProduct) {
            setShowDetailsModal(true);
          }
        }}
      />
      
      {/* Детальный просмотр товара */}
      {quickViewProduct && (
        <ProductDetails
          product={quickViewProduct}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setQuickViewProduct(null);
          }}
        />
      )}

      {/* Руководство по свайпам */}
      <SwipeGuide />
    </motion.div>
  );
}
