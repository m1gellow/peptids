import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FiTag, FiInfo } from 'react-icons/fi';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ProductTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    loadTags();
  }, []);

  // Загрузка меток из базы данных
  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('product_tags')
        .select('*')
        .eq('is_active', true)
        .order('product_count', { ascending: false });

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Ошибка загрузки меток:', error);
      // В случае ошибки используем моковые данные
      setTags(getFallbackTags());
    } finally {
      setLoading(false);
    }
  };

  // Моковые данные на случай проблем с базой
  const getFallbackTags = () => {
    return [
      { id: 1, name: 'Анти-эйдж', slug: 'anti-age', product_count: 32 },
      { id: 2, name: 'Ноотроп', slug: 'nootropic', product_count: 28 },
      { id: 3, name: 'Иммунитет', slug: 'immunity', product_count: 25 },
      { id: 4, name: 'Гормон роста', slug: 'growth-hormone', product_count: 24 },
      { id: 5, name: 'Мозг', slug: 'brain', product_count: 22 },
      { id: 6, name: 'Мышцы', slug: 'muscles', product_count: 19 },
      { id: 7, name: 'Кожа', slug: 'skin', product_count: 18 },
      { id: 8, name: 'Epithalon', slug: 'epithalon', product_count: 17 },
      { id: 9, name: 'Регенерация', slug: 'regeneration', product_count: 15 },
      { id: 10, name: 'Либидо', slug: 'libido', product_count: 14 },
      { id: 11, name: 'GLP-1', slug: 'glp-1', product_count: 13 },
      { id: 12, name: 'Ожирение', slug: 'obesity', product_count: 12 },
      { id: 13, name: 'Сон', slug: 'sleep', product_count: 11 },
      { id: 14, name: 'Semax', slug: 'semax', product_count: 10 },
      { id: 15, name: 'BDNF', slug: 'bdnf', product_count: 9 },
      { id: 16, name: 'Диабет', slug: 'diabetes', product_count: 8 },
      { id: 17, name: 'Нейропептид', slug: 'neuropeptide', product_count: 7 },
      { id: 18, name: 'Антидепрессант', slug: 'antidepressant', product_count: 6 },
      { id: 19, name: 'Биорегулятор', slug: 'bioregulator', product_count: 5 },
      { id: 20, name: 'Нейропротектор', slug: 'neuroprotector', product_count: 4 },
    ];
  };

  // Варианты анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <div className="my-6">
        <h3 className="text-lg font-semibold mb-4 text-center flex items-center justify-center text-white">
          <FiTag className="mr-2" />
          Загрузка меток пептидов...
        </h3>
        <div className="bg-primary-dark/90 backdrop-blur-sm rounded-lg p-6 shadow-lg flex flex-wrap justify-center gap-4 animate-pulse border border-white/10">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="h-6 bg-white/20 rounded w-24"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <FiTag className="mr-2" /> 
          Метки пептидов
        </h3>
        <div className="text-sm text-white/90 flex items-center">
          <FiInfo size={14} className="mr-1" />
          <span>Популярные категории</span>
        </div>
      </div>
      
      <motion.div
        ref={containerRef}
        className="bg-primary-dark/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Фоновые декоративные элементы - молекулярная сетка */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="moleculePattern" patternUnits="userSpaceOnUse" width="60" height="60" patternTransform="rotate(30)">
                <circle cx="30" cy="30" r="2" fill="white" />
                <path d="M30,30 L50,50" stroke="white" strokeWidth="1" />
                <path d="M30,30 L10,50" stroke="white" strokeWidth="1" />
                <path d="M30,30 L30,10" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#moleculePattern)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center gap-3 sm:gap-4">
          {tags.map((tag) => (
            <motion.div
              key={tag.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="transform transition-transform duration-200"
            >
              <Link
                to={`/catalog?tag=${tag.slug}`}
                className="inline-block px-3 py-1 rounded-md bg-primary-dark/30 hover:bg-white/30 transition-colors border border-transparent hover:border-white/30 text-white hover:text-white text-sm font-medium"
              >
                {tag.name}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductTags;