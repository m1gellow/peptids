import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import WebApp from '@twa-dev/sdk';
import { CartProvider } from './contexts/CartContext';
import { notificationManager } from './utils/notificationUtils';
import useAnalyticsTracker from './hooks/useAnalyticsTracker';

// Компоненты
import Header from './components/layout/Header';
import TabBar from './components/layout/TabBar';
import Footer from './components/layout/Footer';
import AuthModal from './components/auth/AuthModal';
import CookieConsent from './components/ui/CookieConsent';

// Страницы
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import PrivacyPage from './pages/PrivacyPage';
import ArticlesListPage from './pages/ArticlesListPage';
import ArticlePage from './pages/ArticlePage';

// Инициализация Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  // Инициализация отслеживания аналитики
  useAnalyticsTracker(currentUser);
  
  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        // Инициализируем систему уведомлений для авторизованного пользователя
        if (user) {
          notificationManager.initialize(user.id);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      } finally {
        setPageLoading(false);
      }
    };
    
    checkAuth();
    
    // Подписка на изменения авторизации
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setCurrentUser(session.user);
          // Инициализируем уведомления для нового пользователя
          notificationManager.initialize(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          // Отписываемся от уведомлений при выходе
          notificationManager.unsubscribe();
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
      // Очищаем уведомления при размонтировании
      notificationManager.unsubscribe();
    };
  }, []);
  
  // Инициализация Telegram WebApp
  useEffect(() => {
    WebApp.ready();
    
    // Настройка основных параметров
    WebApp.expand();
    
    // Настройка цветовой схемы
    if (WebApp.themeParams) {
      document.documentElement.style.setProperty('--tg-theme-bg-color', WebApp.themeParams.bg_color || '#ffffff');
      document.documentElement.style.setProperty('--tg-theme-text-color', WebApp.themeParams.text_color || '#000000');
      document.documentElement.style.setProperty('--tg-theme-hint-color', WebApp.themeParams.hint_color || '#555555');
      document.documentElement.style.setProperty('--tg-theme-link-color', WebApp.themeParams.link_color || '#00A5A5');
      document.documentElement.style.setProperty('--tg-theme-button-color', WebApp.themeParams.button_color || '#00A5A5');
      document.documentElement.style.setProperty('--tg-theme-button-text-color', WebApp.themeParams.button_text_color || '#ffffff');
      
      // Добавляем класс для переопределения темы Telegram
      document.body.classList.add('force-app-colors');
    }
    
    // Отключение предупреждения о закрытии приложения
    if (WebApp.isVersionAtLeast('6.2')) {
      WebApp.enableClosingConfirmation();
    }
  }, []);
  
  // Отслеживание смены страницы для показа индикатора загрузки
  useEffect(() => {
    // Индикатор загрузки при переходах между страницами
    setPageLoading(true);
    
    // Сообщаем Telegram, что страница загружена
    WebApp.ready();
    
    // Прокручиваем страницу вверх при смене маршрута
    window.scrollTo(0, 0);
    
    // Задержка для анимации перехода
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  // Функция для выхода из аккаунта
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Ошибка при выходе:', error.message);
      } else {
        setCurrentUser(null);
        notificationManager.unsubscribe();
        
        if (WebApp.showPopup) {
          WebApp.showPopup({
            title: "Выход из аккаунта",
            message: "Вы успешно вышли из аккаунта",
            buttons: [{ id: "ok", text: "OK", type: "ok" }]
          });
        }
      }
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };
  
  return (
    <CartProvider currentUser={currentUser}>
      <div className="app-container tg-bg">
        <Header 
          onOpenAuthModal={() => setShowAuthModal(true)} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
        
        <main className="flex-grow pb-16">
          {pageLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white"></div>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:id" element={<ProductPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contacts" element={<ContactPage />} />
                <Route path="/profile" element={<ProfilePage currentUser={currentUser} onLogout={handleLogout} />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/:orderId" element={<PaymentPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/articles" element={<ArticlesListPage />} />
                <Route path="/articles/:slug" element={<ArticlePage />} />
                {/* Перенаправление с любого неопределенного маршрута на главную страницу */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          )}
        </main>
        
        <Footer />
        <TabBar />
        
        {/* Модальное окно авторизации */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            // Инициализируем уведомления для нового пользователя
            notificationManager.initialize(user.id);
          }}
        />
        
        {/* Модальное окно согласия на обработку данных */}
        <CookieConsent />
      </div>
    </CartProvider>
  );
}

export default App;