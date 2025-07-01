import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare, FiSend, FiClock } from 'react-icons/fi';

import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { showNotification } from '../utils/telegramUtils';

const ContactPage = () => {
  // Состояние формы
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Проверка формы
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Пожалуйста, введите ваше имя';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Пожалуйста, введите ваш email';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Пожалуйста, введите корректный email';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Пожалуйста, введите ваше сообщение';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Отправка формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Имитация отправки
      setTimeout(() => {
        setIsSubmitting(false);
        
        // Очистка формы
        setFormData({
          name: '',
          email: '',
          message: ''
        });
        
        // Показываем уведомление об успешной отправке
        showNotification(
          'Спасибо за ваше обращение! Мы свяжемся с вами в ближайшее время.',
          'Сообщение отправлено'
        );
      }, 1000);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      <Section 
        title="Контакты"
        subtitle="Свяжитесь с нами для получения дополнительной информации и обсуждения сотрудничества"
        variant="primary"
        centered
        className="py-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Контактная информация */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold mb-6">Наши контакты</h3>
            
            <div className="space-y-5">
              <div className="flex items-start">
                <div className="icon-wrapper mr-4">
                  <FiPhone size={20} />
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Телефон:</div>
                  <div className="font-medium text-primary">
                    <a href="tel:+74993507780">+7 (499) 350-77-80</a> (основной)
                  </div>
                  <div className="font-medium text-text">
                    <a href="tel:+78005509370">+7 (800) 550-93-70</a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="icon-wrapper mr-4">
                  <FiMail size={20} />
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Email:</div>
                  <div className="font-medium text-primary">
                    <a href="mailto:zakaz@russianpeptide.com">zakaz@russianpeptide.com</a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="icon-wrapper mr-4">
                  <FiMapPin size={20} />
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Юридический и фактический адрес:</div>
                  <div className="font-medium text-text">
                    216450, Смоленская область,<br />
                    г. Починок, ул. Советская, д. 6А, оф. 1
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="icon-wrapper mr-4">
                  <FiMessageSquare size={20} />
                </div>
                <div>
                  <div className="text-xs text-text-secondary mb-1">Telegram:</div>
                  <Button 
                    variant="text"
                    href="https://t.me/russianpeptide"
                    className="p-0 text-primary hover:text-primary-light"
                  >
                    @russianpeptide
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary-bg rounded-lg">
              <div className="flex items-center mb-2">
                <FiClock size={16} className="text-primary mr-2" />
                <h4 className="font-medium">Режим работы:</h4>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Понедельник - Пятница:</span>
                  <span className="font-medium">9:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Суббота - Воскресенье:</span>
                  <span className="font-medium">Выходной</span>
                </div>
              </div>
            </div>

            {/* Реквизиты компании */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Реквизиты</h4>
              <div className="text-xs space-y-1 text-text-secondary">
                <div><strong>Наименование:</strong> ООО "Рашн Пептаид"</div>
                <div><strong>ИНН/КПП:</strong> 6712011194/671201001</div>
                <div><strong>ОГРН:</strong> 1166733071284</div>
                <div><strong>Банк:</strong> Точка ПАО Банка "ФК Открытие" г. Москва</div>
                <div><strong>р/с:</strong> 407 028 104 085 000 004 28</div>
                <div><strong>к/с:</strong> 301 018 108 452 500 009 99</div>
                <div><strong>БИК:</strong> 044 525 999</div>
              </div>
            </div>
          </div>
          
          {/* Форма обратной связи */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold mb-4">Напишите нам</h3>
            
            <form onSubmit={handleSubmit}>
              <Input 
                label="Ваше имя"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите ваше имя"
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
                error={formErrors.email}
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
                  placeholder="Введите ваше сообщение"
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
              
              <Button 
                type="submit"
                variant="primary"
                icon={<FiSend size={16} />}
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
              </Button>
            </form>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default ContactPage;