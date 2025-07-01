import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import supabase from '../lib/supabase';



const ArticlePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState(null);

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

  // Загрузка статьи
  useEffect(() => {
    const loadArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        
        setArticle(data);
        
        // Если у статьи есть автор, загружаем информацию о нем
        if (data.author_id) {
          await loadAuthor(data.author_id);
        }
      } catch (error) {
        console.error('Ошибка загрузки статьи:', error);
        navigate('/not-found', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadArticle();
    }
  }, [slug, navigate]);

  // Загрузка информации об авторе
  const loadAuthor = async (authorId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, avatar_url')
        .eq('id', authorId)
        .single();

      if (error) throw error;
      setAuthor(data);
    } catch (error) {
      console.error('Ошибка загрузки автора:', error);
    }
  };

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

  if (loading) {
    return (
      <Section variant="default" className="py-8">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Section>
    );
  }

  if (!article) {
    return (
      <Section variant="default" className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Статья не найдена</h1>
          <p className="text-text-secondary mb-6">
            Запрашиваемая статья не существует или была удалена
          </p>
          <Button variant="primary" to="/">
            На главную
          </Button>
        </div>
      </Section>
    );
  }

  const readingTime = calculateReadingTime(article.content);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Заголовок статьи */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-8">
        <div className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'url(https://russianpeptide.com/wp-content/uploads/2016/04/fon_pep3.jpg)',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto'
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            icon={<FiArrowLeft size={16} />}
            className="text-white hover:text-white/80 mb-4"
          >
            Назад
          </Button>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-white/80 gap-4 text-sm">
            <div className="flex items-center">
              <FiCalendar className="mr-1" size={14} />
              <span>{formatDate(article.published_at)}</span>
            </div>
            
            <div className="flex items-center">
              <FiClock className="mr-1" size={14} />
              <span>{readingTime} мин чтения</span>
            </div>
            
            {author && (
              <div className="flex items-center">
                <FiUser className="mr-1" size={14} />
                <span>{author.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Section variant="default" className="py-8">
        <div className="max-w-3xl mx-auto">
          {/* Изображение статьи */}
          {article.image_url && (
            <div className="mb-6">
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-auto rounded-lg shadow-md object-cover max-h-96"
              />
            </div>
          )}
          
          {/* Основной контент статьи */}
          <div className="bg-white p-6 rounded-lg shadow-card mb-8">
            <div className="prose max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </div>
          
          {/* Навигация по статьям */}
          <div className="flex justify-between mt-8">
            <Button 
              variant="outlined" 
              icon={<FiArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Назад к статьям
            </Button>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default ArticlePage;