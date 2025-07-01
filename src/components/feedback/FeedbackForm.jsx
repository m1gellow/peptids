import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiX, FiUser, FiMail, FiMessageSquare } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

import Button from '../ui/Button';
import Input from '../ui/Input';
import { showNotification } from '../../utils/telegramUtils';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FeedbackForm = ({ 
  isOpen, 
  onClose, 
  productId = null, 
  productName = null,
  currentUser = null 
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.user_metadata?.name || '',
    email: currentUser?.email || '',
    subject: productName ? `Вопрос о товаре: ${productName}` : '',
    message: '',
    type: productId ? 'product_inquiry' : 'general'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Типы запросов
  const feedbackTypes = [
    { value: 'general', label: 'Общий вопрос' },
    { value: 'product_inquiry', label: 'Вопрос о товаре' },
    { value: 'support', label: 'Техническая поддержка' },
    { value: 'complaint', label: 'Жалоба' },
    { value: 'suggestion', label: 'Предложение' }
  ];

  // Обработка изменений в форме
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Удаляем ошибку при вводе
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Валидация формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Укажите ваше имя';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Укажите ваш email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Некорректный формат email';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Укажите тему сообщения';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Напишите ваше сообщение';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Сообщение должно содержать минимум 10 символов';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const feedbackData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        type: formData.type,
        user_id: currentUser?.id || null,
        product_id: productId || null
      };
      
      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData]);
      
      if (error) throw error;
      
      // Сброс формы
      setFormData({
        name: currentUser?.user_metadata?.name || '',
        email: currentUser?.email || '',
        subject: '',
        message: '',
        type: 'general'
      });
      
      onClose();
      
      showNotification(
        'Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.',
        'Сообщение отправлено'
      );
      
    } catch (error) {
      console.error('Ошибка отправки обратной связи:', error);
      showNotification(
        'Произошла ошибка при отправке сообщения. Попробуйте еще раз.',
        'Ошибка'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Сброс формы при закрытии
  const handleClose = () => {
    setFormData({
      name: currentUser?.user_metadata?.name || '',
      email: currentUser?.email || '',
      subject: '',
      message: '',
      type: 'general'
    });
    setFormErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text">
              {productName ? 'Задать вопрос о товаре' : 'Обратная связь'}
            </h3>
            <button 
              className="text-text-secondary hover:text-text transition-colors"
              onClick={handleClose}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Информация о товаре */}
          {productName && (
            <div className="mb-4 p-3 bg-primary-bg rounded-lg">
              <p className="text-sm text-primary font-medium">
                Товар: {productName}
              </p>
            </div>
          )}

          {/* Форма */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ваше имя"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Введите ваше имя"
              icon={<FiUser size={16} />}
              error={formErrors.name}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
              icon={<FiMail size={16} />}
              error={formErrors.email}
              required
            />

            <div className="mb-4">
              <label 
                htmlFor="type" 
                className={`block mb-1.5 text-sm font-medium ${formErrors.type ? 'text-error' : 'text-text-secondary'}`}
              >
                Тип обращения
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="
                  w-full px-4 py-2.5 border border-divider rounded-md
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                  bg-white text-text text-sm transition-all duration-200
                "
              >
                {feedbackTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Тема сообщения"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Кратко опишите суть вопроса"
              icon={<FiMessageSquare size={16} />}
              error={formErrors.subject}
              required
            />

            <div className="mb-4">
              <label 
                htmlFor="message" 
                className={`block mb-1.5 text-sm font-medium ${formErrors.message ? 'text-error' : 'text-text-secondary'}`}
              >
                Сообщение<span className="text-error ml-1">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Подробно опишите ваш вопрос или проблему"
                rows="4"
                className={`
                  w-full rounded-md border border-divider 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                  transition-all duration-200
                  bg-white text-text placeholder:text-text-light text-sm
                  px-4 py-3
                  ${formErrors.message ? 'border-error focus:border-error focus:ring-error/50' : ''}
                `}
                required
              ></textarea>
              {formErrors.message && (
                <p className="mt-1 text-xs text-error">
                  {formErrors.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit"
                variant="primary"
                icon={<FiSend size={16} />}
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
              </Button>
              
              <Button 
                type="button"
                variant="outlined"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackForm;