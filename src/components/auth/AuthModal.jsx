import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiMessageSquare, FiCopy } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';
import WebApp from '@twa-dev/sdk';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { showNotification } from '../../utils/telegramUtils';
import { uploadImageFromUrl } from '../../utils/storageUtils';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // login, register, forgot
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
  
  // Состояние для отображения сгенерированного пароля
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null);

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
      const rotation = Math.random() * 0.4 - 0.2;
      
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
    
    setCaptchaImage(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    if (isOpen && authMode === 'register') {
      generateCaptcha();
    }
  }, [isOpen, authMode]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        captcha: ''
      });
      setFormErrors({});
      setAuthMode('login');
      setGeneratedPassword('');
      setGeneratedEmail('');
      setShowCredentials(false);
      setTelegramUser(null);
    }
  }, [isOpen]);

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
    
    if (authMode !== 'forgot' && !formData.password.trim()) {
      errors.password = 'Необходимо указать пароль';
    } else if (authMode !== 'forgot' && formData.password.length < 6) {
      errors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Функция для копирования текста в буфер обмена
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Скопировано в буфер обмена');
    }).catch(err => {
      console.error('Не удалось скопировать текст: ', err);
    });
  };

  // Загрузка аватара пользователя в storage
  const uploadAvatar = async (userId, avatarUrl) => {
    if (!avatarUrl) return null;
    
    try {
      // Используем утилиту загрузки из URL
      const publicUrl = await uploadImageFromUrl(avatarUrl, userId);
      return publicUrl || null;
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      return avatarUrl; // возвращаем исходную ссылку в случае ошибки
    }
  };

  // Авторизация через Telegram
  const handleTelegramAuth = async () => {
    try {
      // Получаем данные пользователя из Telegram
      const telegramUser = {
        id: WebApp.initDataUnsafe?.user?.id || `test_${Date.now()}`,
        username: WebApp.initDataUnsafe?.user?.username || 'test_user',
        first_name: WebApp.initDataUnsafe?.user?.first_name || 'Test',
        last_name: WebApp.initDataUnsafe?.user?.last_name || '',
        photo_url: WebApp.initDataUnsafe?.user?.photo_url || null
      };
      
      // Формируем полное имя без слова "User" в конце
      let fullName = telegramUser.first_name;
      if (telegramUser.last_name && telegramUser.last_name !== 'User') {
        fullName += ` ${telegramUser.last_name}`;
      }
      
      // Создаем email на базе Telegram ID
      const telegramEmail = `telegram_${telegramUser.id}@russianpeptide.com`;
      
      // Генерируем случайный пароль
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      
      // Сохраняем для показа пользователю
      setGeneratedEmail(telegramEmail);
      setGeneratedPassword(randomPassword);
      
      // Сохраняем данные пользователя Telegram
      setTelegramUser(telegramUser);
      
      // Проверяем, существует ли пользователь
      let { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: telegramEmail,
        password: randomPassword,
      });
      
      if (checkError && checkError.message.includes('Invalid')) {
        // Пользователь не существует, создаем новый аккаунт
        const { data, error } = await supabase.auth.signUp({
          email: telegramEmail,
          password: randomPassword,
          options: {
            data: {
              name: fullName,
              telegram_id: telegramUser.id.toString(),
              telegram_username: telegramUser.username
            }
          }
        });
        
        if (error) throw error;
        
        // Загружаем аватар в bucket, если доступен
        let avatarUrl = telegramUser.photo_url;
        if (avatarUrl && data.user) {
          const publicUrl = await uploadAvatar(data.user.id, avatarUrl);
          if (publicUrl) {
            avatarUrl = publicUrl;
          }
        }
        
        // После успешной регистрации добавляем запись в public.users
        if (data.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              { 
                id: data.user.id, 
                name: fullName,
                email: telegramEmail,
                role: 'user',
                telegram_id: telegramUser.id.toString(),
                avatar_url: avatarUrl
              }
            ]);
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }
        
        // Показываем пользователю данные для входа
        setShowCredentials(true);
        
      } else if (!checkError) {
        // Пользователь существует, авторизация успешна
        onAuthSuccess(existingUser.user);
        onClose();
        
        if (WebApp.showPopup) {
          WebApp.showPopup({
            title: "Успешная авторизация",
            message: `Добро пожаловать, ${telegramUser.first_name}!`,
            buttons: [{ id: "ok", text: "OK", type: "ok" }]
          });
        }
      } else {
        throw checkError;
      }
      
    } catch (error) {
      console.error('Ошибка авторизации через Telegram:', error.message);
      
      if (WebApp.showPopup) {
        WebApp.showPopup({
          title: "Ошибка",
          message: "Не удалось войти через Telegram. Попробуйте еще раз.",
          buttons: [{ id: "ok", text: "OK", type: "ok" }]
        });
      }
    }
  };

  // Выполняет вход с созданными учетными данными Telegram
  const completeTelegramAuth = async () => {
    if (!telegramUser || !generatedEmail || !generatedPassword) {
      console.error('Отсутствуют данные для входа через Telegram');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: generatedEmail,
        password: generatedPassword,
      });
      
      if (error) throw error;
      
      onAuthSuccess(data.user);
      onClose();
      
      if (WebApp.showPopup) {
        WebApp.showPopup({
          title: "Успешная авторизация",
          message: `Добро пожаловать, ${telegramUser.first_name}!`,
          buttons: [{ id: "ok", text: "OK", type: "ok" }]
        });
      }
    } catch (error) {
      console.error('Ошибка входа с учетными данными Telegram:', error);
      showNotification('Не удалось войти в систему. Пожалуйста, попробуйте еще раз.');
    }
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
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
        
        onAuthSuccess(data.user);
        onClose();
        
        if (WebApp.showPopup) {
          WebApp.showPopup({
            title: "Успешная авторизация",
            message: "Вы успешно вошли в систему",
            buttons: [{ id: "ok", text: "OK", type: "ok" }]
          });
        }
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
        
        onClose();
        
        if (WebApp.showPopup) {
          WebApp.showPopup({
            title: "Успешная регистрация",
            message: "Аккаунт создан успешно",
            buttons: [{ id: "ok", text: "OK", type: "ok" }]
          });
        }
      }
      else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          { redirectTo: window.location.origin + '/reset-password' }
        );
        
        if (error) throw error;
        
        onClose();
        
        if (WebApp.showPopup) {
          WebApp.showPopup({
            title: "Восстановление пароля",
            message: "На ваш email отправлена инструкция по восстановлению пароля",
            buttons: [{ id: "ok", text: "OK", type: "ok" }]
          });
        }
      }
    } catch (error) {
      console.error('Ошибка:', error.message);
      
      if (WebApp.showPopup) {
        WebApp.showPopup({
          title: "Ошибка",
          message: error.message,
          buttons: [{ id: "ok", text: "OK", type: "ok" }]
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  
  // Если показываем сгенерированные учетные данные
  if (showCredentials) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-screen overflow-y-auto">
          <button 
            className="absolute top-3 right-3 text-text-secondary hover:text-text transition-colors"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
          
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold mb-2">Учетные данные</h3>
            <p className="text-sm text-text-secondary mb-4">
              Сохраните эти данные, чтобы иметь возможность войти в свой аккаунт другими способами
            </p>
            
            <div className="bg-primary-bg p-4 rounded-lg mb-4">
              <div className="mb-3">
                <div className="text-sm font-medium text-text-secondary mb-1">Email:</div>
                <div className="flex items-center">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all text-text">
                    {generatedEmail}
                  </code>
                  <button 
                    className="ml-2 p-2 bg-gray-200 hover:bg-gray-300 rounded text-text-secondary"
                    onClick={() => copyToClipboard(generatedEmail)}
                    title="Скопировать"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-text-secondary mb-1">Пароль:</div>
                <div className="flex items-center">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all text-text">
                    {generatedPassword}
                  </code>
                  <button 
                    className="ml-2 p-2 bg-gray-200 hover:bg-gray-300 rounded text-text-secondary"
                    onClick={() => copyToClipboard(generatedPassword)}
                    title="Скопировать"
                  >
                    <FiCopy size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm mb-6">
              <p>⚠️ <strong>Внимание!</strong> Сохраните эти данные в надежном месте. 
              Мы не сможем восстановить пароль, если вы его забудете.</p>
            </div>
            
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => {
                setShowCredentials(false);
                completeTelegramAuth();
              }}
            >
              Я сохранил данные
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative max-h-screen overflow-y-auto">
        <button 
          className="absolute top-3 right-3 text-text-secondary hover:text-text transition-colors"
          onClick={onClose}
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
        
        <form onSubmit={handleSubmit}>
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

export default AuthModal;