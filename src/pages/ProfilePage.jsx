import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiHeart, FiShoppingCart, FiClock, FiEdit, FiLogOut, FiPackage, FiCreditCard, FiMail, FiCopy, FiCamera, FiUpload, FiSave, FiX, FiKey, FiMessageSquare } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import { useCart } from '../contexts/CartContext';
import { useLocation } from 'react-router-dom';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import AvatarImage from '../components/ui/AvatarImage';
import AuthModal from '../components/auth/AuthModal';
import OrdersHistory from '../components/orders/OrdersHistory';
import UserFeedbackList from '../components/feedback/UserFeedbackList';
import { showNotification, showConfirmation } from '../utils/telegramUtils';
import { uploadImageFromUrl, uploadFile } from '../utils/storageUtils';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProfilePage = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  
  // Состояния для редактирования профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: ''
  });
  
  // Состояния для смены пароля
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Состояния для аватарки
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  
  const { 
    cartItems, 
    favorites, 
    removeFromCart, 
    updateCartItem, 
    toggleFavorite,
    getCartItemsCount 
  } = useCart();

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

  // Проверяем URL параметры для автоматического переключения вкладки
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    if (tab && ['profile', 'favorites', 'cart', 'orders', 'feedback'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Прокручиваем страницу вверх при загрузке
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  // Загрузка профиля пользователя
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
        
        // Добавляем метку времени для предотвращения кеширования аватара
        const avatarUrlWithCache = data.avatar_url ? 
          `${data.avatar_url}${data.avatar_url.includes('?') ? '&' : '?'}t=${Date.now()}` : 
          null;
          
        setAvatarUrl(avatarUrlWithCache);
        
        // Инициализация данных формы редактирования
        setEditData({
          name: data.name || currentUser?.user_metadata?.name || '',
          email: data.email || currentUser?.email || ''
        });
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [currentUser]);

  // Загрузка статистики заказов
  useEffect(() => {
    const loadOrderStats = async () => {
      if (!currentUser) return;

      try {
        const { data, error } = await supabase.rpc('get_user_order_stats', {
          p_user_id: currentUser.id
        });

        if (error) throw error;
        setOrderStats(data[0] || null);
      } catch (error) {
        console.error('Ошибка загрузки статистики заказов:', error);
      }
    };

    if (currentUser) {
      loadOrderStats();
    }
  }, [currentUser]);

  // Получение имени пользователя
  const getUserName = () => {
    if (userProfile?.name) return userProfile.name;
    if (currentUser?.user_metadata?.name) return currentUser.user_metadata.name;
    return currentUser?.email || 'Пользователь';
  };

  // Получение аватара пользователя
  const getUserAvatar = () => {
    if (avatarUrl) return avatarUrl;
    if (userProfile?.avatar_url) return userProfile.avatar_url;
    if (currentUser?.user_metadata?.avatar_url) return currentUser.user_metadata.avatar_url;
    return null;
  };
  
  // Форматирование email для мобильных устройств
  const formatEmail = (email) => {
    // Для мобильных устройств сокращаем email если он длинный
    const isMobile = window.innerWidth < 640;
    if (isMobile && email && email.length > 18) {
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        const username = email.substring(0, Math.min(8, atIndex));
        const domain = email.substring(atIndex);
        return `${username}...${domain}`;
      }
    }
    return email;
  };

  // Получение статистики пользователя
  const getUserStats = () => {
    return {
      favoriteCount: favorites.length,
      cartCount: getCartItemsCount(),
      ordersCount: orderStats?.total_orders || 0,
      totalSpent: orderStats?.total_amount_spent || 0,
      memberSince: userProfile?.created_at ? new Date(userProfile.created_at).getFullYear() : new Date().getFullYear()
    };
  };

  // Обработка успешной авторизации
  const handleAuthSuccess = (user) => {
    setShowAuthModal(false);
    // Перезагрузка страницы для обновления данных
    window.location.reload();
  };
  
  // Обработка загрузки аватара
  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Проверка размера файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors({...errors, avatar: 'Файл слишком большой (максимум 2MB)'});
        return;
      }
      
      // Проверка типа файла
      if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/)) {
        setErrors({...errors, avatar: 'Поддерживаются только изображения (JPEG, PNG, WEBP, GIF)'});
        return;
      }
      
      setUploading(true);
      setErrors({...errors, avatar: null});
      
      // Загрузка в storage с помощью нашей утилиты
      // Изменяем имя бакета с 'avatar' на 'user-avatars'
      const publicUrl = await uploadFile(file, currentUser.id, 'user-avatars');
      
      if (!publicUrl) {
        throw new Error('Не удалось получить публичный URL для загруженного файла');
      }
      
      // Обновление профиля пользователя
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);
      
      if (updateError) throw updateError;
      
      // Обновление аватара в метаданных
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      
      if (metadataError) console.warn("Не удалось обновить метаданные:", metadataError);
      
      setAvatarUrl(publicUrl);
      showNotification('Аватар успешно обновлен');
      
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      setErrors({...errors, avatar: 'Ошибка загрузки аватара'});
      showNotification('Ошибка загрузки аватара. Попробуйте еще раз.');
    } finally {
      setUploading(false);
      // Сбрасываем значение input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Обработка изменения данных формы редактирования профиля
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Сбрасываем ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Валидация формы редактирования
  const validateEditForm = () => {
    const newErrors = {};
    
    if (!editData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }
    
    if (!editData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
      newErrors.email = 'Некорректный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Валидация формы смены пароля
  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Минимальная длина пароля - 6 символов';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите новый пароль';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Сохранение изменений профиля
  const handleSaveProfile = async () => {
    if (!validateEditForm()) return;
    
    try {
      setLoading(true);
      
      // Обновляем данные в таблице users
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          name: editData.name,
          email: editData.email
        })
        .eq('id', currentUser.id);
      
      if (updateError) throw updateError;
      
      // Обновляем метаданные пользователя
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          name: editData.name
        }
      });
      
      if (metadataError) throw metadataError;
      
      // Обновляем локальное состояние
      setUserProfile(prev => ({
        ...prev,
        name: editData.name,
        email: editData.email
      }));
      
      setIsEditing(false);
      showNotification('Профиль успешно обновлен');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      showNotification('Ошибка обновления профиля. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };
  
  // Обработка изменения данных формы смены пароля
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Сбрасываем ошибки при изменении поля
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Обработка смены пароля
  const handleUpdatePassword = async () => {
    if (!validatePasswordForm()) return;
    
    try {
      setLoading(true);
      
      // Сначала проверяем текущий пароль
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        setErrors({...errors, currentPassword: 'Неверный текущий пароль'});
        throw signInError;
      }
      
      // Обновляем пароль
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      // Сбрасываем форму и закрываем её
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setIsChangingPassword(false);
      showNotification('Пароль успешно изменен');
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      if (!errors.currentPassword) {
        showNotification('Ошибка смены пароля. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tabs данные
  const tabs = [
    { id: 'profile', label: 'Профиль', icon: <FiUser size={16} /> },
    { id: 'orders', label: 'Заказы', icon: <FiPackage size={16} /> },
    { id: 'favorites', label: 'Избранное', icon: <FiHeart size={16} /> },
    { id: 'cart', label: 'Корзина', icon: <FiShoppingCart size={16} /> },
    { id: 'feedback', label: 'Вопросы', icon: <FiMessageSquare size={16} /> }
  ];

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
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
              <FiUser size={32} className="text-text-secondary" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Добро пожаловать!</h1>
            <p className="text-text-secondary mb-6">
              Войдите в аккаунт для доступа к персональным функциям: избранное, корзина, заказы и уведомления.
            </p>
            
            <div className="space-y-3 max-w-sm mx-auto">
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => setShowAuthModal(true)}
              >
                Войти в аккаунт
              </Button>
              
              <Button 
                variant="outlined" 
                fullWidth
                to="/"
              >
                На главную
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-primary-bg rounded-lg">
              <h3 className="font-semibold mb-2 text-primary-dark">Преимущества аккаунта:</h3>
              <div className="text-sm text-text-secondary space-y-1">
                <div>• Сохранение избранных товаров</div>
                <div>• Корзина покупок</div>
                <div>• История заказов с детальной информацией</div>
                <div>• Push-уведомления о статусе заказов</div>
                <div>• Быстрое оформление повторных заказов</div>
                <div>• Статистика покупок</div>
              </div>
            </div>
          </div>
        </Section>

        {/* Модальное окно авторизации */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </motion.div>
    );
  }

  if (loading) {
    return (
      <Section variant="default" className="py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </Section>
    );
  }

  const stats = getUserStats();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Профиль header с градиентным фоном */}
      <div className="relative bg-gradient-to-br from-primary to-primary-dark py-8">
        {/* Фоновый узор */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-white/20 mx-auto mb-4 border-4 border-white/30 group">
              {getUserAvatar() ? (
                <AvatarImage
                  src={getUserAvatar()}
                  alt="Avatar"
                  size="xl"
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <FiUser size={32} className="text-white" />
                </div>
              )}
              
              {/* Кнопка загрузки аватарки */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <FiCamera size={20} className="text-white" />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  className="sr-only" 
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                />
              </label>
              
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              {getUserName()}
            </h1>
            
            <p className="text-white/90 text-sm mb-6 flex items-center justify-center">
              <FiMail className="mr-1" size={14} />
              <span className="truncate max-w-[250px]" title={currentUser.email}>
                {formatEmail(currentUser.email)}
              </span>
            </p>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <div className="text-xl font-bold text-white">{stats.favoriteCount}</div>
                <div className="text-xs text-white/80">Избранное</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <div className="text-xl font-bold text-white">{stats.cartCount}</div>
                <div className="text-xs text-white/80">В корзине</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <div className="text-xl font-bold text-white">{stats.ordersCount}</div>
                <div className="text-xs text-white/80">Заказов</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <div className="text-xl font-bold text-white">{stats.memberSince}</div>
                <div className="text-xs text-white/80">Участник с</div>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="border-white text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-sm"
              onClick={onLogout}
              icon={<FiLogOut size={16} />}
            >
              Выйти из аккаунта
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs навигация */}
      <Section variant="default" className="py-0">
        <div className="bg-white sticky top-16 z-10 border-b border-divider">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Сбрасываем режимы редактирования при переключении вкладки
                  setIsEditing(false);
                  setIsChangingPassword(false);
                  // Прокрутка вверх при смене вкладки
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 py-3 px-2 sm:px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary-bg/30'
                    : 'text-text-secondary hover:text-primary hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'orders' && stats.ordersCount > 0 && (
                    <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stats.ordersCount > 99 ? '99+' : stats.ordersCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Контент tabs */}
      <Section variant="default" className="py-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {isEditing ? (
              // Форма редактирования профиля
              <div className="bg-white p-6 rounded-lg shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Редактирование профиля</h3>
                  <Button 
                    variant="text" 
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="text-text-secondary hover:text-error"
                    icon={<FiX size={16} />}
                  >
                    Отмена
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Имя"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="Ваше имя"
                    error={errors.name}
                    required
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    placeholder="Ваш email"
                    error={errors.email}
                    required
                  />
                  
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="primary"
                      icon={<FiSave size={16} />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setIsEditing(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            ) : isChangingPassword ? (
              // Форма смены пароля
              <div className="bg-white p-6 rounded-lg shadow-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Изменение пароля</h3>
                  <Button 
                    variant="text" 
                    size="sm"
                    onClick={() => setIsChangingPassword(false)}
                    className="text-text-secondary hover:text-error"
                    icon={<FiX size={16} />}
                  >
                    Отмена
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Текущий пароль"
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Введите текущий пароль"
                    error={errors.currentPassword}
                    required
                  />
                  
                  <Input
                    label="Новый пароль"
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Введите новый пароль"
                    error={errors.newPassword}
                    required
                  />
                  
                  <Input
                    label="Подтверждение пароля"
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Подтвердите новый пароль"
                    error={errors.confirmPassword}
                    required
                  />
                  
                  <div className="pt-2 flex gap-2">
                    <Button
                      variant="primary"
                      icon={<FiKey size={16} />}
                      onClick={handleUpdatePassword}
                      disabled={loading}
                    >
                      {loading ? 'Обновление...' : 'Обновить пароль'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Отображение информации о профиле
              <div className="bg-white p-6 rounded-lg shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-text">Информация о профиле</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-text-secondary">Имя</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-text">
                      {getUserName()}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-text-secondary">Email</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-text flex items-center">
                      <span className="truncate" title={currentUser.email}>
                        {currentUser.email}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentUser.email);
                          showNotification('Email скопирован');
                        }}
                        className="ml-2 text-text-secondary hover:text-primary p-1"
                        title="Скопировать"
                      >
                        <FiCopy size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-text-secondary">Дата регистрации</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md text-text">
                      {userProfile?.created_at ? 
                        new Date(userProfile.created_at).toLocaleDateString('ru-RU') : 
                        'Неизвестно'
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Статистика покупок */}
            {orderStats && (
              <div className="bg-white p-6 rounded-lg shadow-card">
                <h3 className="text-lg font-semibold mb-4 text-text">Статистика покупок</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{orderStats.total_orders || 0}</div>
                    <div className="text-sm text-blue-800">Всего заказов</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{orderStats.completed_orders || 0}</div>
                    <div className="text-sm text-green-800">Выполнено</div>
                  </div>
                  <div className="text-center p-4 bg-primary-bg rounded-lg">
                    <div className="text-lg font-bold text-primary">
                      {orderStats.total_amount_spent ? 
                        `${parseFloat(orderStats.total_amount_spent).toLocaleString('ru-RU')} ₽` : 
                        '0 ₽'
                      }
                    </div>
                    <div className="text-sm text-primary-dark">Потрачено</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow-card">
              <h3 className="text-lg font-semibold mb-4 text-text">Настройки аккаунта</h3>
              <div className="space-y-3">
                <Button 
                  variant="outlined" 
                  fullWidth 
                  icon={<FiEdit size={16} />}
                  onClick={() => {
                    setIsEditing(true);
                    setIsChangingPassword(false);
                  }}
                >
                  Редактировать профиль
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  icon={<FiKey size={16} />}
                  onClick={() => {
                    setIsChangingPassword(true);
                    setIsEditing(false);
                  }}
                >
                  Изменить пароль
                </Button>
                
                <Button 
                  variant="outlined" 
                  fullWidth
                  icon={<FiUpload size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Загрузить новый аватар
                  <input
                    id="avatarUpload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </Button>
              </div>
              
              {errors.avatar && (
                <div className="mt-2 text-sm text-error">{errors.avatar}</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <OrdersHistory currentUser={currentUser} />
        )}

        {activeTab === 'feedback' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">Мои вопросы и ответы</h3>
            <UserFeedbackList currentUser={currentUser} />
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">
              Избранные товары ({favorites.length})
            </h3>
            
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((favorite) => (
                  <Card
                    key={favorite.id}
                    title={favorite.product.name}
                    image={favorite.product.image_url}
                    link={`/catalog/${favorite.product.id}`}
                    linkText="Подробнее"
                    className="h-full"
                  >
                    <div className="mt-4 pt-4 border-t border-divider">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-text-secondary truncate max-w-[120px]" title={favorite.product.sku}>
                          Артикул: {favorite.product.sku}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary text-lg truncate max-w-[150px]" title={favorite.product.price}>
                          {favorite.product.base_price 
                            ? `${parseFloat(favorite.product.base_price).toLocaleString('ru-RU')} ₽` 
                            : favorite.product.price || 'По запросу'
                          }
                        </span>
                        <Button 
                          size="sm" 
                          variant="outlined"
                          onClick={() => toggleFavorite(favorite.product.id)}
                        >
                          <FiHeart size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiHeart size={48} className="text-text-secondary mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2 text-text">Нет избранных товаров</h4>
                <p className="text-text-secondary mb-4">
                  Добавьте товары в избранное для быстрого доступа
                </p>
                <Button variant="primary" to="/catalog">
                  Перейти в каталог
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-text">
              Корзина ({getCartItemsCount()} товаров)
            </h3>
            
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg shadow-card">
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product.image_url} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-text truncate" title={item.product.name}>
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-text-secondary truncate" title={`Артикул: ${item.product.sku}`}>
                          Артикул: {item.product.sku}
                        </p>
                        <p className="font-semibold text-primary">
                          {item.product.base_price 
                            ? `${parseFloat(item.product.base_price).toLocaleString('ru-RU')} ₽` 
                            : item.product.price || 'По запросу'
                          }
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0 mt-2 sm:mt-0">
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium text-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-error hover:text-red-600 transition-colors text-sm font-medium ml-2"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="bg-white p-4 rounded-lg shadow-card">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-text">Итого товаров:</span>
                    <span className="font-bold text-lg text-text">{getCartItemsCount()}</span>
                  </div>
                  <Button variant="primary" fullWidth to="/checkout">
                    Оформить заказ
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FiShoppingCart size={48} className="text-text-secondary mx-auto mb-4" />
                <h4 className="text-lg font-medium mb-2 text-text">Корзина пуста</h4>
                <p className="text-text-secondary mb-4">
                  Добавьте товары в корзину для оформления заказа
                </p>
                <Button variant="primary" to="/catalog">
                  Перейти в каталог
                </Button>
              </div>
            )}
          </div>
        )}
      </Section>
    </motion.div>
  );
};

export default ProfilePage;