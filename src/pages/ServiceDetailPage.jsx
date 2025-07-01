import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiCheck } from 'react-icons/fi';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import WebApp from '@twa-dev/sdk';
import supabase from '../lib/supabase';


const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Загрузка данных услуги из базы данных
  useEffect(() => {
    const loadService = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('id', id)
          .eq('is_active', true)
          .single();

        if (error) {
          console.error('Ошибка загрузки услуги:', error);
          
          // Fallback к моковым данным
          const fallbackService = fallbackServicesData[id];
          if (fallbackService) {
            setService(fallbackService);
          } else {
            setNotFound(true);
          }
        } else {
          setService(data);
        }
      } catch (error) {
        console.error('Ошибка соединения:', error);
        
        // Fallback к моковым данным
        const fallbackService = fallbackServicesData[id];
        if (fallbackService) {
          setService(fallbackService);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [id]);
  
  // Если услуга не найдена, перенаправляем на страницу услуг
  useEffect(() => {
    if (notFound) {
      navigate('/services');
    }
    
    // Кнопка "Назад" в навигации Telegram
    WebApp.BackButton.isVisible = true;
    WebApp.BackButton.onClick(() => navigate(-1));
    
    return () => {
      WebApp.BackButton.isVisible = false;
      WebApp.BackButton.offClick();
    };
  }, [notFound, navigate]);

  // Fallback данные для услуг
  const fallbackServicesData = {
    'synthesis': {
      id: 'synthesis',
      title: 'Синтез пептидов',
      description: `
        Компания «Рашн Пептаид» предлагает услуги по химическому синтезу пептидов любой сложности. 
        Мы используем современные методы твердофазного синтеза, что позволяет получать пептиды высокой 
        чистоты и с различными модификациями.
      `,
      features: [
        'Синтез линейных и циклических пептидов',
        'Введение различных модификаций (ацетилирование, амидирование, биотинилирование и др.)',
        'Синтез с использованием нестандартных аминокислот',
        'Синтез пептидов с изотопными метками',
        'Масштабирование синтеза от миллиграммов до граммов'
      ],
      image_url: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      additional_info: `
        Все пептиды подвергаются строгому контролю качества с использованием современных аналитических 
        методов (ВЭЖХ, масс-спектрометрия). Мы предоставляем полную документацию на все производимые 
        пептиды, включая аналитические сертификаты.
      `
    },
    'analysis': {
      id: 'analysis',
      title: 'Аналитические услуги',
      description: `
        «Рашн Пептаид» предлагает широкий спектр аналитических услуг для характеристики пептидных соединений 
        и контроля их качества. Наша лаборатория оснащена современным оборудованием, которое позволяет 
        проводить комплексный анализ пептидов и других биологически активных соединений.
      `,
      features: [
        'Высокоэффективная жидкостная хроматография (ВЭЖХ)',
        'Масс-спектрометрия (MALDI-TOF, ESI-MS)',
        'Аминокислотный анализ',
        'Определение чистоты и подлинности пептидов',
        'Определение содержания примесей'
      ],
      image_url: 'https://images.pexels.com/photos/8325914/pexels-photo-8325914.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      additional_info: `
        По результатам анализа выдается подробный аналитический отчет. Мы гарантируем точность и 
        достоверность получаемых результатов. Также доступны услуги по разработке и валидации 
        аналитических методик для контроля качества пептидных препаратов.
      `
    }
  };
  
  // Если услуга не найдена
  if (notFound) {
    return null;
  }

  if (loading) {
    return (
      <Section variant="default" className="py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
          <div className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="w-full h-48 md:h-64 bg-gray-200"></div>
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
  
  // Обработчик для кнопки запроса
  const handleInquiry = () => {
    WebApp.openTelegramLink('https://t.me/russianpeptide');
  };

  // Парсим features из JSON если это строка
  let features = [];
  if (service.features) {
    try {
      features = typeof service.features === 'string' 
        ? JSON.parse(service.features) 
        : service.features;
    } catch (error) {
      console.error('Ошибка парсинга features:', error);
      features = Array.isArray(service.features) ? service.features : [];
    }
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
          Назад к услугам
        </Button>
        
        <div className="bg-white rounded-lg shadow-card overflow-hidden">
          {/* Изображение услуги */}
          {service.image_url && (
            <div className="w-full h-48 md:h-64 bg-primary-dark">
              <img 
                src={service.image_url} 
                alt={service.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Информация об услуге */}
          <div className="p-4">
            <h1 className="text-2xl font-bold text-text mb-4">{service.title}</h1>
            
            <div className="mb-6">
              <p className="text-sm text-text-secondary mb-4 whitespace-pre-line">
                {service.description}
              </p>
              
              {features && features.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-3">Что мы предлагаем:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-text-secondary">
                        <FiCheck size={16} className="text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {service.additional_info && (
                <div className="mt-4 p-4 bg-primary-bg rounded-md">
                  <p className="text-sm whitespace-pre-line">{service.additional_info}</p>
                </div>
              )}
            </div>
            
            {/* Контактный блок */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-lg font-semibold mb-2">Заинтересованы в данной услуге?</h3>
              <p className="text-sm text-text-secondary mb-4">
                Свяжитесь с нами для обсуждения деталей и получения индивидуального предложения.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="primary"
                  icon={<FiMail size={16} />}
                  onClick={handleInquiry}
                  fullWidth
                >
                  Отправить запрос
                </Button>
                
                <Button 
                  variant="secondary"
                  to="/contacts"
                  fullWidth
                >
                  Контакты
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default ServiceDetailPage;