import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheck, 
  FiAward, 
  FiUsers, 
  FiTarget, 
  FiTrendingUp, 
  FiLayers,
  FiShield,
  FiGlobe,
  FiZap,
  FiHeart,
  FiStar,
  FiX,
  FiUser,
  FiMail,
  FiLock,
  FiMessageSquare,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiClock,
  FiBriefcase,
  FiTool,
  FiCheckCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { showNotification } from '../utils/telegramUtils';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AboutPage = () => {
  // Состояния для авторизации/регистрации
  const [authMode, setAuthMode] = useState('login'); // login, register, forgot
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Состояние для формы
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    captcha: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');

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

  // Анимация для элементов
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    checkAuth();
  }, []);

  // Генерация капчи
  const generateCaptcha = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let captcha = '';
    
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      captcha += chars[randomIndex];
    }
    
    setCaptchaCode(captcha);
    
    // Создаем canvas для отрисовки капчи
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    // Фон
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Текст
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#00A5A5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Рисуем текст с небольшими смещениями для каждого символа
    for (let i = 0; i < captcha.length; i++) {
      const x = (i + 1) * (canvas.width / (captcha.length + 1));
      const y = canvas.height / 2 + Math.random() * 5 - 2.5;
      const rotation = Math.random() * 0.4 - 0.2; // поворот +/- 0.2 радиан
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillText(captcha[i], 0, 0);
      ctx.restore();
    }
    
    // Добавляем линии для шума
    ctx.strokeStyle = '#009090';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
    
    // Преобразуем canvas в base64 строку
    setCaptchaImage(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    // Генерируем капчу при открытии модального окна регистрации
    if (showAuthModal && authMode === 'register') {
      generateCaptcha();
    }
  }, [showAuthModal, authMode]);

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Сбрасываем ошибку для поля, которое меняем
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (authMode === 'register') {
      if (!formData.name.trim()) {
        errors.name = 'Необходимо указать имя';
      }
      
      if (!formData.confirmPassword.trim()) {
        errors.confirmPassword = 'Необходимо подтвердить пароль';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Пароли не совпадают';
      }
      
      if (!formData.captcha.trim()) {
        errors.captcha = 'Введите код с картинки';
      } else if (formData.captcha.toUpperCase() !== captchaCode) {
        errors.captcha = 'Неверный код с картинки';
      }
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Необходимо указать email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Необходимо указать пароль';
    } else if (formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Авторизация через Telegram
  const handleTelegramAuth = () => {
    showNotification(
      'Авторизация через Telegram будет реализована в следующей версии',
      'Информация'
    );
  };

  // Обработка отправки формы авторизации/регистрации
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        setCurrentUser(data.user);
        setShowAuthModal(false);
        
        showNotification('Вы успешно вошли в систему', 'Успешная авторизация');
      } 
      else if (authMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name
            }
          }
        });
        
        if (error) throw error;
        
        // После успешной регистрации добавляем запись в public.users
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id, 
                name: formData.name,
                email: formData.email,
                role: 'user' 
              }
            ]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        setShowAuthModal(false);
        
        showNotification(
          'На ваш email отправлено письмо для подтверждения регистрации',
          'Успешная регистрация'
        );
      }
      else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          { redirectTo: window.location.origin + '/reset-password' }
        );
        
        if (error) throw error;
        
        setShowAuthModal(false);
        
        showNotification(
          'На ваш email отправлена инструкция по восстановлению пароля',
          'Восстановление пароля'
        );
      }
    } catch (error) {
      console.error('Ошибка:', error.message);
      showNotification(error.message, 'Ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция для выхода из аккаунта
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Ошибка при выходе:', error.message);
    } else {
      setCurrentUser(null);
      showNotification('Вы успешно вышли из аккаунта', 'Выход из аккаунта');
    }
  };

  // Модальное окно авторизации/регистрации
  const renderAuthModal = () => {
    if (!showAuthModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
          <button 
            className="absolute top-3 right-3 text-text-secondary hover:text-text transition-colors"
            onClick={() => setShowAuthModal(false)}
          >
            <FiX size={24} />
          </button>
          
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold mb-2">
              {authMode === 'login' && 'Вход'}
              {authMode === 'register' && 'Регистрация'}
              {authMode === 'forgot' && 'Восстановление пароля'}
            </h3>
            <p className="text-text-secondary text-sm">
              {authMode === 'login' && 'Войдите в свой аккаунт для доступа к персональным функциям'}
              {authMode === 'register' && 'Создайте аккаунт для использования всех возможностей'}
              {authMode === 'forgot' && 'Укажите email для восстановления доступа'}
            </p>
          </div>
          
          <form onSubmit={handleAuthSubmit}>
            {authMode === 'register' && (
              <Input
                label="Имя"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ваше имя"
                icon={<FiUser size={16} />}
                error={formErrors.name}
                required
              />
            )}
            
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ваш email"
              icon={<FiMail size={16} />}
              error={formErrors.email}
              required
            />
            
            {authMode !== 'forgot' && (
              <Input
                label="Пароль"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={authMode === 'login' ? 'Ваш пароль' : 'Придумайте пароль'}
                icon={<FiLock size={16} />}
                error={formErrors.password}
                required
              />
            )}
            
            {authMode === 'register' && (
              <>
                <Input
                  label="Подтверждение пароля"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  icon={<FiLock size={16} />}
                  error={formErrors.confirmPassword}
                  required
                />
                
                <div className="mb-4">
                  <label 
                    htmlFor="captcha" 
                    className="block mb-1.5 text-sm font-medium text-text-secondary"
                  >
                    Капча<span className="text-error ml-1">*</span>
                  </label>
                  <div className="mb-2">
                    <img 
                      src={captchaImage} 
                      alt="Капча" 
                      className="rounded-md border border-divider mb-2"
                    />
                    <button
                      type="button"
                      className="text-xs text-primary hover:text-primary-light"
                      onClick={generateCaptcha}
                    >
                      Обновить код
                    </button>
                  </div>
                  <Input
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleChange}
                    placeholder="Введите код с картинки"
                    error={formErrors.captcha}
                    required
                  />
                </div>
              </>
            )}
            
            <Button 
              type="submit"
              variant="primary"
              fullWidth
              className="mb-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Подождите...' : (
                authMode === 'login' 
                  ? 'Войти' 
                  : authMode === 'register' 
                    ? 'Зарегистрироваться' 
                    : 'Восстановить пароль'
              )}
            </Button>
            
            <div className="mb-4">
              <div className="divider-text mb-4">
                <span>или</span>
              </div>
              
              <Button 
                type="button"
                variant="secondary"
                fullWidth
                onClick={handleTelegramAuth}
              >
                <FiMessageSquare size={16} className="mr-2" />
                Войти через Telegram
              </Button>
            </div>
            
            <div className="text-center text-sm">
              {authMode === 'login' && (
                <>
                  <button 
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-primary hover:text-primary-light mb-2 block mx-auto"
                  >
                    Забыли пароль?
                  </button>
                  <div className="text-text-secondary">
                    Нет аккаунта?{' '}
                    <button 
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-primary hover:text-primary-light"
                    >
                      Регистрация
                    </button>
                  </div>
                </>
              )}
              
              {authMode === 'register' && (
                <div className="text-text-secondary">
                  Уже есть аккаунт?{' '}
                  <button 
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-primary hover:text-primary-light"
                  >
                    Войти
                  </button>
                </div>
              )}
              
              {authMode === 'forgot' && (
                <button 
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-primary hover:text-primary-light"
                >
                  Вернуться к входу
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Главный баннер */}
      <div className="relative bg-primary h-48 overflow-hidden">
        {/* Фоновое изображение с оверлеем */}
        <img 
          src="https://images.pexels.com/photos/954585/pexels-photo-954585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="О компании" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        {/* Градиентный оверлей */}
        <div className="absolute inset-0 bg-primary opacity-70"></div>
        
        {/* Текст баннера */}
        <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
          <h1 className="text-3xl font-bold text-white mb-2">О компании</h1>
          <p className="text-white text-opacity-90 text-sm">
            Инновации и качество в области пептидных технологий
          </p>
          
          {/* Кнопка авторизации, если пользователь не авторизован */}
          {!currentUser && (
            <Button 
              variant="secondary" 
              className="border-white text-white mt-4 w-auto self-start"
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
            >
              <FiUser size={16} className="mr-2" />
              Вход / Регистрация
            </Button>
          )}
          
          {/* Приветствие, если пользователь авторизован */}
          {currentUser && (
            <div className="mt-4 bg-white/20 p-3 rounded-lg max-w-md">
              <div className="text-white font-medium mb-1">
                Добро пожаловать, {currentUser.user_metadata?.name || currentUser.email}!
              </div>
              <Button 
                variant="text" 
                className="text-white/80 hover:text-white p-0 underline"
                onClick={handleLogout}
              >
                Выйти из аккаунта
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Основная информация */}
      <Section variant="default" className="py-8">
        <div className="grid grid-cols-1 gap-8">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white p-6 rounded-lg shadow-card"
          >
            <h2 className="text-2xl font-bold mb-6 border-b border-primary-light pb-4 text-primary-dark">
              Уважаемый Посетитель
            </h2>
            
            <p className="text-lg mb-4 font-medium">Добро пожаловать на страницу «О нашей компании»</p>
            
            <div className="space-y-4 text-text-secondary">
              <p>
                <strong className="text-primary-dark">Рашн Пептаид</strong> — это коммерческая, основанная на инновационных технологиях организация, предоставляющая полный спектр услуг для фармацевтической, биотехнологической и косметической отрасли.
              </p>
              <p>
                Компания специализируется на разработке технологии и производстве пептидов и сложных органических молекул в качестве биологически активных ингредиентов и их интермедиатов, биохимических веществ для исследовательский целей in vitro, стандартных образцов для калибровки аналитического оборудования, а также реагентов для пептидного синтеза.
              </p>
              <p>
                В арсенале компании имеются оригинальные know-how технологии в химии пептидов и тонкого органического синтеза.
              </p>
              <p>
                Отлаженные технологические процессы позволяют нарабатывать пептидные субстанции от небольших количеств, для проведения испытаний, до промышленных объемов.
              </p>
              <p>
                Наши клиенты могут заказать синтез пептида, разработку нового пептидного препарата, провести исследование, запустить контрактное производство, получить услуги по регистрации БАД, лекарственного средства и косметики.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-primary-bg p-6 rounded-lg shadow-card"
          >
            <h2 className="text-2xl font-bold mb-6 text-primary-dark flex items-center">
              <FiTarget size={24} className="mr-3 text-primary" />
              Основная цель компании
            </h2>
            
            <p className="mb-6 text-text-secondary">
              Продвижение науки, исследований и разработок, развитие технологий, расширение объема инновационных продуктов для здоровья, повышения качества жизни, безопасности и охраны окружающей среды. Наши усилия направлены на развитие наукоемких отраслей и стимулирование импортозамещения, прежде всего, на территории Российской Федерации в своей области специализации.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 text-primary-dark flex items-center">
                  <FiHeart size={20} className="mr-2 text-primary" />
                  Наши ценности
                </h3>
                <ul className="space-y-3 text-text-secondary flex-grow">
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Высококачественные услуги и продукция по конкурентоспособным ценам</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Надежные и долгосрочные партнерские отношения</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Инновационный подход к разработке новых продуктов</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Открытое общение для укрепления доверия клиентов</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 text-primary-dark flex items-center">
                  <FiStar size={20} className="mr-2 text-primary" />
                  Наши стремления
                </h3>
                <ul className="space-y-3 text-text-secondary flex-grow">
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Лидерство на рынке пептидных технологий</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Высококлассное сочетание продуктов и технических услуг</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Создание инновационных решений для здравоохранения</span>
                  </li>
                  <li className="flex items-start">
                    <FiCheckCircle size={18} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span>Развитие отечественного производства пептидов</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-primary to-primary-light p-6 rounded-lg shadow-card text-white">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FiLayers size={24} className="mr-3 text-white/80" />
                Пептидные вещества в современном мире
              </h2>
              
              <p className="mb-4">
                Пептидные вещества внедряются в нашу жизнь очень активно. С ними связаны основные достижения в медицине, фармакологии, нанотехнологии, косметологии, стоматологии, ветеринарии, сельском хозяйстве, пищевой и других отраслях.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Преимущества пептидов</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      <span>Возможность моделирования структуры</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      <span>Высокая биологическая активность</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      <span>Минимальные токсичные и побочные эффекты</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      <span>Направленное и системное воздействие</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      <span>Высокая биодоступность и биоразлагаемость</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white/10 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Наш подход</h3>
                  <p className="text-sm mb-4">
                    В связи с этим, очень важно иметь эффективные методы быстрого синтеза пептидов с высокой степенью очистки.
                  </p>
                  <p className="text-sm">
                    Современные тенденции по росту выявления новых потенциальных препаратов подталкивают на создание высокотехнологичных исследовательских лабораторий и площадок по производству пептидов в России.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-white/20 p-4 rounded-lg">
                <p className="font-medium">
                  Производство пептидов в Russian Peptide — это сложный комплекс валидированных технологических и аналитических процедур, разработка которых требует глубоких профессиональных знаний в области химии, физики, фармацевтики, тонкого органического синтеза, аналитики и менеджмента качества.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Преимущества */}
      <Section 
        title="Наши преимущества"
        variant="primary"
        centered
        className="py-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiCheck size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Высокое качество</h3>
            <p className="text-text-secondary text-sm">
              Все наши продукты проходят строгий контроль качества с использованием 
              современных аналитических методов.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiAward size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Экспертиза</h3>
            <p className="text-text-secondary text-sm">
              Наша команда состоит из опытных специалистов с глубокими знаниями 
              в области пептидной химии и биотехнологий.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiUsers size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Клиентоориентированность</h3>
            <p className="text-text-secondary text-sm">
              Мы предлагаем индивидуальный подход к каждому клиенту и стремимся 
              к долгосрочному сотрудничеству.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiShield size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Надежность</h3>
            <p className="text-text-secondary text-sm">
              Мы гарантируем выполнение всех договорных обязательств и соблюдение сроков 
              поставки продукции.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiGlobe size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Сотрудничество</h3>
            <p className="text-text-secondary text-sm">
              Мы активно сотрудничаем с научными институтами и исследовательскими 
              центрами для разработки новых технологий.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-5 rounded-lg shadow-card"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiZap size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Инновации</h3>
            <p className="text-text-secondary text-sm">
              Мы постоянно совершенствуем технологии производства и расширяем 
              ассортимент предлагаемой продукции.
            </p>
          </motion.div>
        </div>
      </Section>
      
      {/* Кто мы */}
      <Section variant="default" className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold mb-4">Кто мы</h2>
            <p className="text-text-secondary text-sm mb-4">
              Компания «Рашн Пептаид» является лидером в области разработки, производства и поставки 
              пептидов и пептидных технологий в России. Мы специализируемся на синтезе пептидов 
              высокой чистоты для научных исследований, фармацевтической промышленности и 
              биотехнологического сектора.
            </p>
            <p className="text-text-secondary text-sm">
              Основанная группой профессионалов с многолетним опытом в области пептидной химии, 
              наша компания стремится предоставлять продукцию и услуги высочайшего качества, 
              соответствующие международным стандартам.
            </p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-xl font-bold mb-4">Наша миссия</h2>
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center text-primary mr-3">
                <FiTarget size={20} />
              </div>
              <div>
                <p className="text-text-secondary text-sm">
                  Способствовать развитию отечественной биотехнологии и фармацевтики через 
                  предоставление высококачественных пептидных технологий и создание инновационных решений.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-bg flex items-center justify-center text-primary mr-3">
                <FiTrendingUp size={20} />
              </div>
              <div>
                <p className="text-text-secondary text-sm">
                  Стать предпочтительным партнером для компаний и исследовательских институтов, 
                  работающих в сфере пептидных технологий, предлагая комплексные решения и 
                  индивидуальный подход к каждому клиенту.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
      
      {/* Инфографика - Наши услуги */}
      <Section
        title="Что мы предлагаем"
        variant="dark"
        centered
        className="py-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-card flex flex-col items-center text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiBriefcase size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary-dark">Разработка</h3>
            <p className="text-text-secondary text-sm mb-4">
              Разработка пептидных препаратов и технологий для фармацевтической и косметической промышленности
            </p>
            <ul className="text-sm text-text-secondary text-left w-full space-y-2">
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Разработка состава</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Подбор стабилизаторов</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Оптимизация свойств</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-card flex flex-col items-center text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiBriefcase size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary-dark">Производство</h3>
            <p className="text-text-secondary text-sm mb-4">
              Производство пептидных субстанций от лабораторных количеств до промышленных объемов
            </p>
            <ul className="text-sm text-text-secondary text-left w-full space-y-2">
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Синтез пептидов</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Очистка и анализ</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Масштабирование</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-card flex flex-col items-center text-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-full bg-primary-bg flex items-center justify-center text-primary mb-4">
              <FiTool size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-primary-dark">Регистрация</h3>
            <p className="text-text-secondary text-sm mb-4">
              Помощь в регистрации продуктов в соответствии с российским законодательством
            </p>
            <ul className="text-sm text-text-secondary text-left w-full space-y-2">
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Регистрация БАД</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Регистрация лекарств</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                <span>Регистрация косметики</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="text-center">
          <Link to="/services">
            <Button 
              variant="primary"
              icon={<FiArrowRight className="ml-2" />}
              iconPosition="right"
            >
              Подробнее об услугах
            </Button>
          </Link>
        </div>
      </Section>
      
      {/* Контактная информация */}
      <Section 
        title="Контактная информация"
        variant="default"
        className="py-10"
      >
        <div className="bg-white p-6 rounded-lg shadow-card">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Юридический и фактический адрес</h3>
              <p className="text-text-secondary text-sm mb-4">
                216450, Смоленская область, г. Починок, ул. Советская, д. 6А, оф. 1
              </p>
              
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-text-secondary">Телефон:</span><br />
                  <a href="tel:+74993507780" className="text-primary font-medium">+7 (499) 350-77-80</a> (основной)<br />
                  <a href="tel:+78005509370" className="text-text">+7 (800) 550-93-70</a>
                </div>
                <div>
                  <span className="text-text-secondary">Email:</span><br />
                  <a href="mailto:zakaz@russianpeptide.com" className="text-primary font-medium">zakaz@russianpeptide.com</a>
                </div>
                <div>
                  <span className="text-text-secondary">Telegram:</span><br />
                  <a href="https://t.me/russianpeptide" className="text-primary font-medium">@russianpeptide</a>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Реквизиты</h3>
              <div className="text-xs space-y-1 text-text-secondary">
                <div><strong>Наименование:</strong> ООО "Рашн Пептаид"</div>
                <div><strong>ИНН/КПП:</strong> 6712011194/671201001</div>
                <div><strong>ОГРН:</strong> 1166733071284</div>
                <div><strong>Банк:</strong> Точка ПАО Банка "ФК Открытие" г. Москва</div>
                <div><strong>р/с:</strong> 407 028 104 085 000 004 28</div>
                <div><strong>к/с:</strong> 301 018 108 452 500 009 99</div>
                <div><strong>БИК:</strong> 044 525 999</div>
              </div>
              
              <div className="mt-6 p-4 bg-primary-bg rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <FiClock size={16} className="text-primary mr-2" />
                  Режим работы
                </h4>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Пн-Пт:</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Сб-Вс:</span>
                    <span>Выходной</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
      
      {/* История компании */}
      <Section 
        title="История компании"
        variant="default"
        className="py-10"
      >
        <div className="space-y-8">
          <motion.div 
            className="flex flex-col md:flex-row"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="md:w-1/4 mb-3 md:mb-0">
              <div className="text-xl font-bold text-primary">2010</div>
            </div>
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold mb-2">Основание компании</h3>
              <p className="text-text-secondary text-sm">
                Компания «Рашн Пептаид» была основана группой ученых с опытом работы 
                в области пептидной химии. Начало деятельности по синтезу пептидов 
                для научных исследований.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="md:w-1/4 mb-3 md:mb-0">
              <div className="text-xl font-bold text-primary">2015</div>
            </div>
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold mb-2">Расширение производства</h3>
              <p className="text-text-secondary text-sm">
                Открытие новой лаборатории, оснащенной современным оборудованием. 
                Начало сотрудничества с фармацевтическими компаниями и расширение 
                спектра предоставляемых услуг.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="md:w-1/4 mb-3 md:mb-0">
              <div className="text-xl font-bold text-primary">2020</div>
            </div>
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold mb-2">Лидер рынка</h3>
              <p className="text-text-secondary text-sm">
                «Рашн Пептаид» становится ведущим российским производителем пептидов. 
                Запуск новых направлений деятельности и развитие международного сотрудничества.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col md:flex-row"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="md:w-1/4 mb-3 md:mb-0">
              <div className="text-xl font-bold text-primary">Сегодня</div>
            </div>
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold mb-2">Инновации и развитие</h3>
              <p className="text-text-secondary text-sm">
                Компания продолжает расширять свою деятельность, внедряя инновационные 
                технологии и развивая новые направления в области пептидной химии и биотехнологий.
              </p>
            </div>
          </motion.div>
        </div>
      </Section>
      
      {/* Расположение на карте */}
      <Section 
        title="Наше расположение"
        variant="primary"
        className="py-10"
        centered
      >
        <div className="bg-white p-4 rounded-lg shadow-card mb-4">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-center p-6 bg-primary-bg rounded-lg">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-primary mx-auto mb-3">
                  <FiMapPin size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-primary-dark">Смоленская область, г. Починок</h3>
                <p className="text-sm text-text-secondary mb-4">ул. Советская, д. 6А, оф. 1</p>
                <Button 
                  href="https://maps.google.com/maps?q=Починок,+улица+Советская,+6А"
                  target="_blank" 
                  variant="primary"
                >
                  Открыть на Google Maps
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Для получения более подробной информации о нашей компании и продукции, 
            пожалуйста, свяжитесь с нами по указанным контактным данным.
          </p>
        </div>
      </Section>
      
      {/* Модальное окно авторизации */}
      {renderAuthModal()}
    </motion.div>
  );
};

export default AboutPage;