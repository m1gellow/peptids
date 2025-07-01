import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  FiMessageCircle 
} from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

import Section from '../components/ui/Section';
import Card from '../components/ui/Card';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Маппинг иконок
const iconMap = {
  FiEdit3: <FiEdit3 size={32} className="text-primary" />,
  FiSearch: <FiSearch size={32} className="text-primary" />,
  FiFilter: <FiFilter size={32} className="text-primary" />,
  FiDownload: <FiDownload size={32} className="text-primary" />,
  FiPackage: <FiPackage size={32} className="text-primary" />,
  FiSettings: <FiSettings size={32} className="text-primary" />,
  FiClipboard: <FiClipboard size={32} className="text-primary" />,
  FiTool: <FiTool size={32} className="text-primary" />,
  FiActivity: <FiActivity size={32} className="text-primary" />,
  FiMessageCircle: <FiMessageCircle size={32} className="text-primary" />
};

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Анимация элементов
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
      transition: { duration: 0.3 }
    }
  };

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
      short_description: 'Химический синтез пептидов высокой чистоты и различной сложности. Мы специализируемся на синтезе сложных пептидов, включая циклические, с модификациями и меченые.',
      icon: 'FiEdit3'
    },
    {
      id: 'analysis',
      title: 'Анализ',
      short_description: 'Полный спектр аналитических услуг для характеристики пептидных соединений, включая ВЭЖХ, масс-спектрометрию, аминокислотный анализ и проверку чистоты.',
      icon: 'FiSearch'
    },
    {
      id: 'purification',
      title: 'Очистка',
      short_description: 'Высокоэффективная очистка пептидов методами ВЭЖХ и твердофазной экстракции. Гарантия высокой чистоты продукта.',
      icon: 'FiFilter'
    },
    {
      id: 'import',
      title: 'Импорт',
      short_description: 'Услуги по импорту химических реагентов и пептидных соединений. Помощь с документацией и таможенным оформлением.',
      icon: 'FiDownload'
    },
    {
      id: 'packaging',
      title: 'Фасовка',
      short_description: 'Профессиональная фасовка пептидов и химических соединений в различные контейнеры и упаковку согласно требованиям клиента.',
      icon: 'FiPackage'
    },
    {
      id: 'technology',
      title: 'Технология',
      short_description: 'Разработка технологических процессов синтеза и производства пептидов, масштабирование лабораторных методик до промышленных объемов.',
      icon: 'FiSettings'
    },
    {
      id: 'registration',
      title: 'Регистрация',
      short_description: 'Помощь в регистрации и сертификации пептидных препаратов и фармацевтических субстанций в соответствии с российскими нормативами.',
      icon: 'FiClipboard'
    },
    {
      id: 'development',
      title: 'Разработка',
      short_description: 'Разработка методов синтеза и анализа пептидов, оптимизация существующих процессов, разработка новых пептидных соединений.',
      icon: 'FiTool'
    },
    {
      id: 'manufacturing',
      title: 'Производство',
      short_description: 'Производство пептидов и пептидных субстанций в соответствии с требованиями GMP на собственном оборудовании.',
      icon: 'FiActivity'
    },
    {
      id: 'consulting',
      title: 'Консультация',
      short_description: 'Консультационные услуги по вопросам пептидной химии, применения пептидов в фармацевтике и биотехнологии.',
      icon: 'FiMessageCircle'
    }
  ];

  if (loading) {
    return (
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fade-in"
      >
        <Section 
          title="Наши услуги"
          subtitle="Загрузка..."
          variant="primary"
          centered
          className="py-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white p-5 rounded-lg shadow-card animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </Section>
      </motion.div>
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
        title="Наши услуги"
        subtitle="Полный цикл работы с пептидами и биоактивными соединениями"
        variant="primary"
        centered
        className="py-8"
      >
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
                className="h-full"
              >
                <div className="flex justify-center mb-4">
                  {iconMap[service.icon] || iconMap['FiSettings']}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
      
      {/* Дополнительная информация */}
      <Section 
        variant="default"
        className="py-8"
      >
        <div className="bg-white rounded-lg shadow-card p-6">
          <h2 className="text-xl font-bold mb-4">Индивидуальный подход к каждому проекту</h2>
          
          <p className="text-text-secondary text-sm mb-4">
            Наша компания предоставляет полный спектр услуг в области пептидных технологий. Мы гарантируем высокое качество 
            и индивидуальный подход к каждому проекту. Наши специалисты обладают многолетним опытом работы в области 
            пептидной химии и биотехнологий.
          </p>
          
          <p className="text-text-secondary text-sm">
            Свяжитесь с нами для обсуждения вашего проекта. Мы поможем выбрать оптимальное решение 
            с учетом ваших задач и бюджета.
          </p>
        </div>
      </Section>
    </motion.div>
  );
};

export default ServicesPage;