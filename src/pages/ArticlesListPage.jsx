import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiCalendar, FiClock } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

import Section from '../components/ui/Section';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ArticlesListPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Загрузка статей из базы данных
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, short_description, image_url, published_at, slug, content')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Ошибка загрузки статей:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);
  
  // Расчет времени чтения (примерно 200 слов в минуту)
  const calculateReadingTime = (content) => {
    if (!content) return 0;
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Фильтрация статей по поисковому запросу
  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (article.short_description && article.short_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Элементы анимации
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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      <Section 
        title="Статьи индустрии пептидов"
        subtitle="Новости и исследования в области биотехнологий и пептидов"
        variant="primary"
        centered
        className="py-8"
      >
        {/* Поиск по статьям */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder="Поиск по статьям..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-divider focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>
        
        {loading ? (
          // Скелетон для загрузки
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-card animate-pulse">
                <div className="h-40 bg-gray-200 mb-4 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
              </div>
            ))}
          </div>
        ) : (
          filteredArticles.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredArticles.map((article) => (
                <motion.div key={article.id} variants={itemVariants}>
                  <Card
                    title={article.title}
                    description={article.short_description}
                    image={article.image_url}
                    link={`/articles/${article.slug}`}
                    linkText="Читать статью"
                    className="h-full"
                  >
                    <div className="flex flex-wrap gap-3 mt-3 mb-1 text-xs text-text-secondary">
                      <div className="flex items-center">
                        <FiCalendar size={12} className="mr-1" />
                        <span>{formatDate(article.published_at)}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock size={12} className="mr-1" />
                        <span>{calculateReadingTime(article.content)} мин чтения</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">Статьи не найдены</h3>
              <p className="text-text-secondary mb-6">
                По вашему запросу "{searchTerm}" не найдено ни одной статьи
              </p>
              <Button 
                variant="outlined" 
                onClick={() => setSearchTerm('')}
              >
                Сбросить поиск
              </Button>
            </div>
          )
        )}
      </Section>
      
      {/* Дополнительная информация */}
      <Section variant="default" className="py-8">
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h2 className="text-xl font-bold mb-4">О статьях</h2>
          <p className="text-text-secondary">
            В данном разделе публикуются научные и обзорные статьи, посвященные пептидам, их синтезу, 
            исследованиям и применению. Статьи предназначены для специалистов в области биотехнологии, 
            фармацевтики и медицины. Обратите внимание, что все статьи носят информационный характер 
            и не являются медицинскими рекомендациями.
          </p>
        </div>
      </Section>
    </motion.div>
  );
};

export default ArticlesListPage;