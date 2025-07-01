import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();
  
  // Автоматическое перенаправление на главную страницу после 3 секунд
  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      navigate('/');
    }, 3000);
    
    // Очистка таймера при размонтировании компонента
    return () => clearTimeout(redirectTimeout);
  }, [navigate]);

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

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      <Section variant="default" className="py-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Страница не найдена</h1>
          <p className="text-text-secondary mb-4">
            К сожалению, запрашиваемая вами страница не существует.
          </p>
          <p className="text-text-secondary text-sm mb-8">
            Автоматическое перенаправление на главную страницу через 3 секунды...
          </p>
          
          <Button 
            to="/" 
            variant="primary"
            icon={<FiArrowLeft size={16} />}
          >
            Вернуться на главную
          </Button>
        </div>
      </Section>
    </motion.div>
  );
};

export default NotFoundPage;