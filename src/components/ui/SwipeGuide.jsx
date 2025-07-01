import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiArrowLeft, FiArrowRight, FiInfo } from 'react-icons/fi';
import '../../styles/swipeGuide.css';

const SwipeGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Проверяем, показывали ли мы уже руководство
    const hasSeenGuide = localStorage.getItem('hasSeenSwipeGuide');
    
    if (!hasSeenGuide) {
      // Показываем руководство с небольшой задержкой
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Закрыть руководство и сохранить, что пользователь его видел
  const handleDismiss = () => {
    setIsVisible(false);
    // Даем время для анимации, потом сохраняем в localStorage
    setTimeout(() => {
      localStorage.setItem('hasSeenSwipeGuide', 'true');
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="swipe-guide"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="swipe-guide__title">
            <FiInfo size={16} className="mr-2" />
            <span>Подсказка</span>
          </div>
          
          <p className="text-xs text-text-secondary">
            Свайпните карточку товара для быстрых действий:
          </p>
          
          <div className="swipe-guide__content">
            <div className="swipe-guide__action swipe-guide__action--left">
              <div className="swipe-guide__icon">
                <FiArrowLeft className="text-primary mr-1 swipe-guide__arrow-left" />
                <FiShoppingCart className="text-primary" />
              </div>
              <div className="swipe-guide__text">В корзину</div>
            </div>
            
            <div className="swipe-guide__action swipe-guide__action--right">
              <div className="swipe-guide__icon">
                <FiHeart className="text-red-500" />
                <FiArrowRight className="text-red-500 ml-1 swipe-guide__arrow-right" />
              </div>
              <div className="swipe-guide__text">В избранное</div>
            </div>
          </div>
          
          <button 
            className="swipe-guide__dismiss"
            onClick={handleDismiss}
          >
            Понятно
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SwipeGuide;