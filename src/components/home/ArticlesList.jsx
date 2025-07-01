import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import Card from '../ui/Card';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка статей из базы данных
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('id, title, short_description, image_url, published_at, slug')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setArticles(data || []);
      } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        // Fallback к моковым данным при ошибке
        setArticles(fallbackArticles);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Fallback данные на случай ошибки
  const fallbackArticles = [
    {
      id: 1,
      title: 'Инновации в синтезе пептидов',
      short_description: 'Новые методы и технологии химического синтеза пептидов, повышающие эффективность и снижающие затраты.',
      image_url: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=600',
      published_at: '2025-04-15T10:00:00Z',
      slug: 'innovacii-v-sinteze-peptidov'
    },
    {
      id: 2,
      title: 'Пептиды в современной медицине',
      short_description: 'Обзор применения пептидов в современных фармацевтических препаратах и их роль в лечении различных заболеваний.',
      image_url: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=600',
      published_at: '2025-04-03T15:30:00Z',
      slug: 'peptidy-v-sovremennoy-medicine'
    },
    {
      id: 3,
      title: 'Регуляторные аспекты производства пептидов',
      short_description: 'Обзор нормативных требований и регуляторных аспектов при производстве пептидных препаратов.',
      image_url: 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=600',
      published_at: '2025-03-25T09:15:00Z',
      slug: 'regulyatornye-aspekty-proizvodstva-peptidov'
    }
  ];

  // Форматирование даты публикации
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
  };

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
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-card animate-pulse">
            <div className="h-40 bg-gray-200 mb-4 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {articles.map((article) => (
        <motion.div key={article.id} variants={itemVariants}>
          <Card
            title={article.title}
            description={article.short_description}
            image={article.image_url}
            link={`/articles/${article.slug}`}
            linkText="Подробнее"
            className="h-full"
          >
            <div className="mt-2 mb-2 text-xs text-text-secondary">
              {formatDate(article.published_at)}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ArticlesList;