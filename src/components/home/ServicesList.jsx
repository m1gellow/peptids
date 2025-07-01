import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { 
  FiEdit3, 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiPackage, 
  FiSettings,
  FiClipboard,
  FiTool,
  FiActivity,
  FiMessageSquare
} from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Маппинг иконок
const iconMap = {
  FiEdit3: <FiEdit3 size={24} className="text-primary" />,
  FiSearch: <FiSearch size={24} className="text-primary" />,
  FiFilter: <FiFilter size={24} className="text-primary" />,
  FiDownload: <FiDownload size={24} className="text-primary" />,
  FiPackage: <FiPackage size={24} className="text-primary" />,
  FiSettings: <FiSettings size={24} className="text-primary" />,
  FiClipboard: <FiClipboard size={24} className="text-primary" />,
  FiTool: <FiTool size={24} className="text-primary" />,
  FiActivity: <FiActivity size={24} className="text-primary" />,
  FiMessageSquare: <FiMessageSquare size={24} className="text-primary" />
};

const ServicesList = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка услуг из базы данных
  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Ошибка загрузки услуг:', error);
          // Fallback к моковым данным при ошибке
          setServices(fallbackServices);
        } else {
          setServices(data || []);
        }
      } catch (error) {
        console.error('Ошибка соединения:', error);
        // Fallback к моковым данным при ошибке соединения
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Fallback данные на случай ошибок с базой данных
  const fallbackServices = [
    {
      id: 'synthesis',
      title: 'Синтез',
      short_description: 'Классический синтез пептидов в растворе и твердофазный пептидный синтез',
      icon: 'FiEdit3'
    },
    {
      id: 'analysis',
      title: 'Анализ',
      short_description: 'Подтверждение подлинности и чистоты пептидной продукции',
      icon: 'FiSearch'
    },
    {
      id: 'purification',
      title: 'Очистка',
      short_description: 'Препаративная очистка пептидов. Обращенная, нормально-фазовая и ионообменная хроматография',
      icon: 'FiFilter'
    },
    {
      id: 'packaging',
      title: 'Фасовка',
      short_description: 'Получение растворов пептидов и лиофилизата, упаковка во флаконы',
      icon: 'FiPackage'
    },
    {
      id: 'registration',
      title: 'Регистрация',
      short_description: 'Внесение в государственный реестр фарм. субстанции, БАД, косметического средства',
      icon: 'FiClipboard'
    },
    {
      id: 'manufacturing',
      title: 'Производство',
      short_description: 'Контрактное производство пептидов в России',
      icon: 'FiActivity'
    },
    {
      id: 'import',
      title: 'Импорт',
      short_description: 'Поставка продукции',
      icon: 'FiDownload'
    },
    {
      id: 'technology',
      title: 'Технология',
      short_description: 'Разработка и усовершенствование технологии производства пептидов',
      icon: 'FiSettings'
    },
    {
      id: 'development',
      title: 'Разработка',
      short_description: 'Разработка состава пептидного препарата',
      icon: 'FiTool'
    }
  ];

  // Варианты анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white p-5 rounded-lg shadow-card animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Баннер с услугами - темный фон с медицинским узором */}
      <div className="relative overflow-hidden rounded-lg mb-8 bg-primary-dark shadow-lg">
        {/* Медицинский векторный фон */}
        <div className="absolute inset-0 z-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medicalPattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(30)">
                <path d="M10,0 L10,10 L0,10 L0,20 L10,20 L10,30 L20,30 L20,20 L30,20 L30,10 L20,10 L20,0 Z" fill="#ffffff" fillOpacity="0.05"/>
                <circle cx="30" cy="30" r="3" fill="#ffffff" fillOpacity="0.05"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medicalPattern)" />
          </svg>
        </div>

        <div className="relative z-10 p-6 text-white">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
              <FiSettings size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">Наши услуги</h2>
          </div>
          <p className="text-white/80 ml-0 md:ml-14">
            Полный цикл работы с пептидами и биоактивными соединениями
          </p>
          
          {/* Декоративные элементы */}
          <div className="absolute bottom-2 right-2 opacity-20">
            <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M30,50 L70,50 M50,30 L50,70" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <span className="section-label">НАШИ УСЛУГИ</span>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={itemVariants}>
            <Card
              title={service.title}
              description={service.short_description}
              link={`/services/${service.id}`}
              linkText="Подробнее"
              className="h-full service-card hover:scale-105 transition-transform duration-200"
            >
              <div className="flex justify-center mb-4">
                <div className="icon-wrapper">
                  {iconMap[service.icon] || iconMap['FiSettings']}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
};

export default ServicesList;