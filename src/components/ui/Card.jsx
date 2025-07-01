import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Card = ({
  title,
  description,
  image,
  link,
  linkText = 'Подробнее',
  onClick,
  className = '',
  children,
}) => {
  // Варианты анимации
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { y: -5, boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)' },
  };

  // Варианты анимации для изображения
  const imageVariants = {
    initial: { scale: 1, filter: 'brightness(1)' },
    hover: { scale: 1.05, filter: 'brightness(1.05)' }
  };

  // Компонент с содержимым карточки
  const CardContent = () => (
    <>
      {image && (
        <div className="w-full h-48 overflow-hidden">
          <motion.img 
            src={image} 
            alt={title} 
            className="w-full h-full object-contain bg-gray-50"
            initial="initial"
            whileHover="hover"
            variants={imageVariants}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}
      
      <div className="p-4">
        {title && (
          <h3 className="text-lg font-semibold mb-2 text-text">{title}</h3>
        )}
        
        {description && (
          <p className="text-text-secondary text-sm mb-4">{description}</p>
        )}
        
        {children}
        
        {link && !onClick && (
          <div className="mt-3">
            <span className="text-primary text-sm font-medium hover:text-primary-light transition-colors">
              {linkText}
            </span>
          </div>
        )}
      </div>
    </>
  );

  // Если передан обработчик клика
  if (onClick) {
    return (
      <motion.div 
        className={`card ${className}`}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        onClick={onClick}
      >
        <CardContent />
      </motion.div>
    );
  }

  // Если передана ссылка
  if (link) {
    return (
      <motion.div 
        className={`card ${className}`}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <Link to={link} className="block no-underline">
          <CardContent />
        </Link>
      </motion.div>
    );
  }

  // По умолчанию - просто карточка без ссылки и клика
  return (
    <motion.div 
      className={`card ${className}`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      <CardContent />
    </motion.div>
  );
};

export default Card;