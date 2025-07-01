import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiLogOut, FiMenu, FiHome, FiGrid, FiLayers, FiInfo, FiX, FiRefreshCw } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import WebApp from '@twa-dev/sdk';

import { showConfirmation, showNotification } from '../../utils/telegramUtils';
import NotificationBell from '../ui/NotificationBell';
import { useCart } from '../../contexts/CartContext'; // Импорт контекста корзины

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Header = ({ onOpenAuthModal, currentUser, onLogout }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate(); // Добавим хук навигации
  const { getCartItemsCount } = useCart(); // Используем контекст корзины

  // Основные пункты меню
  const mainMenuItems = [
    { path: '/', icon: <FiHome size={16} />, label: 'Главная' },
    { path: '/catalog', icon: <FiGrid size={16} />, label: 'Каталог' },
    { path: '/profile', icon: <FiUser size={16} />, label: 'Профиль' }
  ];

  // Дополнительные пункты меню для выпадающего списка
  const extraMenuItems = [
    { path: '/services', icon: <FiLayers size={16} />, label: 'Услуги' },
    { path: '/about', icon: <FiInfo size={16} />, label: 'О нас' }
  ];

  // Обработка скролла
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие мобильного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закрытие мобильного меню при изменении пути
  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  // Обрабатываем клик по иконке "назад" в Telegram
  useEffect(() => {
    WebApp.BackButton.isVisible = location.pathname !== '/';
    
    return () => {
      WebApp.BackButton.isVisible = false;
    };
  }, [location.pathname]);

  // Быстрый выход из аккаунта
  const handleQuickLogout = () => {
    showConfirmation(
      'Вы действительно хотите выйти из аккаунта?',
      'Подтверждение выхода',
      (buttonId) => {
        if (buttonId === 'ok') {
          onLogout();
        }
      }
    );
  };

  // Обработка клика по иконке пользователя для неавторизованных
  const handleUserIconClick = () => {
    if (!currentUser && onOpenAuthModal) {
      onOpenAuthModal();
    }
  };
  
  // Функция обновления страницы
  const handleRefresh = () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    
    // Тактильная обратная связь для Telegram
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('medium');
    }
    
    // Показываем уведомление
    showNotification('Обновление страницы...');
    
    // Небольшая задержка для анимации
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  // Получение текущего количества товаров в корзине
  const cartCount = getCartItemsCount();
  
  // Обработчик клика по иконке поиска
  const handleSearchClick = () => {
    navigate('/catalog'); // Перенаправляем на страницу каталога, где есть поиск
  };

  return (
    <header 
      className={`sticky top-0 z-20 bg-white transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            {/* Адаптивный логотип */}
            <picture>
              {/* Мобильная версия - компактный логотип */}
              <source 
                media="(max-width: 640px)" 
                srcSet="https://russianpeptide.com/wp-content/uploads/2017/05/cropped-russian_peptide_logo_ru_fav-180x180.png" 
              />
              {/* Планшетная версия - средний логотип */}
              <source 
                media="(max-width: 1024px)" 
                srcSet="https://russianpeptide.com/wp-content/uploads/2017/05/russian_peptide_logo_ru_320.png" 
              />
              {/* Десктопная версия - полный логотип */}
              <img 
                src="https://russianpeptide.com/wp-content/uploads/2017/05/russian_peptide_logo_ru_320.png" 
                alt="Russian Peptide" 
                className="h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[160px] md:max-w-[200px] object-contain"
              />
            </picture>
          </Link>
          
          {/* Навигационное меню для крупных экранов */}
          <div className="hidden md:flex ml-8 space-x-6">
            {mainMenuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className="flex items-center text-text-secondary hover:text-primary transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ))}

            {extraMenuItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className="flex items-center text-text-secondary hover:text-primary transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Кнопка обновления */}
          <button 
            className={`w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30 ${isRefreshing ? 'animate-spin text-primary' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Обновить страницу"
            title="Обновить страницу"
          >
            <FiRefreshCw size={20} />
          </button>
        
          <button 
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30"
            aria-label="Поиск"
            onClick={handleSearchClick}
          >
            <FiSearch size={20} />
          </button>
          
          <Link
            to="/cart"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30 relative"
            aria-label="Корзина"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Уведомления (только для авторизованных пользователей) */}
          {currentUser && (
            <NotificationBell userId={currentUser.id} />
          )}

          {/* Навигация на мобильных устройствах - основные иконки */}
          <div className="flex md:hidden">
            {/* Кнопка "Еще" для мобильного меню */}
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Меню"
            >
              {showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>

          {/* Кнопки для больших экранов */}
          <div className="hidden md:flex">
            {currentUser ? (
              <div className="flex items-center gap-1">
                <Link
                  to="/profile"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30"
                  aria-label="Профиль"
                >
                  <FiUser size={20} />
                </Link>
                
                <button
                  onClick={handleQuickLogout}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-red-500 transition-colors hover:bg-red-50"
                  aria-label="Выйти"
                  title="Быстрый выход"
                >
                  <FiLogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleUserIconClick}
                className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30"
                aria-label="Войти"
                title="Войти в аккаунт"
              >
                <FiUser size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {showMobileMenu && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            ref={menuRef} 
            className="absolute top-16 right-0 bg-white w-64 shadow-lg rounded-l-lg p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Основные пункты меню */}
              {mainMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary-bg text-text-secondary hover:text-primary transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Разделитель */}
              <div className="border-t border-divider my-2"></div>

              {/* Дополнительные пункты меню */}
              {extraMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary-bg text-text-secondary hover:text-primary transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Кнопка обновления в мобильном меню */}
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary-bg text-text-secondary hover:text-primary transition-colors w-full"
              >
                <FiRefreshCw size={16} />
                <span>Обновить страницу</span>
              </button>

              {/* Кнопки входа/выхода */}
              {currentUser ? (
                <>
                  <div className="border-t border-divider my-2"></div>
                  <button
                    onClick={handleQuickLogout}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-red-50 text-text-secondary hover:text-red-500 transition-colors w-full"
                  >
                    <FiLogOut size={16} />
                    <span>Выйти из аккаунта</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-divider my-2"></div>
                  <button
                    onClick={handleUserIconClick}
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-primary-bg text-text-secondary hover:text-primary transition-colors w-full"
                  >
                    <FiUser size={16} />
                    <span>Войти в аккаунт</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;