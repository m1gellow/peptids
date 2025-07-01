import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const MainBanner = () => {
  // Варианты анимации
  const bannerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className="relative bg-primary-dark h-[280px] sm:h-[320px] overflow-hidden"
      variants={bannerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Градиентный фон вместо изображения */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light opacity-80"></div>
      
      {/* Анимированные декоративные элементы */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Молекулярная анимированная сетка */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="moleculeGrid" patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="rotate(30)">
                <circle cx="40" cy="40" r="2" fill="white" />
                <path d="M40,40 L70,70 M40,40 L10,70 M40,40 L40,10" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#moleculeGrid)" />
          </svg>
        </motion.div>
        
        {/* Плавающие частицы - уменьшаем количество на мобильных */}
        {Array.from({ length: 8 }).map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              x: [
                Math.random() * 20 - 10,
                Math.random() * 40 - 20,
                Math.random() * 20 - 10,
              ],
              y: [
                Math.random() * 20 - 10,
                Math.random() * 40 - 20,
                Math.random() * 20 - 10,
              ],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 8 + Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      
      {/* Контент баннера */}
      <div className="container relative h-full mx-auto px-4 flex flex-col justify-center items-center">
        {/* Логотип */}
        <motion.div
          className="flex justify-center w-full mb-3 sm:mb-4"
          variants={itemVariants}
        >
          <motion.img 
            src="https://russianpeptide.com/wp-content/uploads/2017/06/russian_peptide_logo_bel_eb.png" 
            alt="Russian Peptide" 
            className="h-10 sm:h-12 md:h-16 mx-auto object-contain w-auto max-w-[180px] sm:max-w-[220px] md:max-w-[280px]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          />
        </motion.div>
        
        <motion.h1 
          className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 text-center font-display"
          variants={itemVariants}
        >
          SCIENCE LAB
        </motion.h1>
        
        <motion.p 
          className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5 text-center max-w-md mx-auto px-4"
          variants={itemVariants}
        >
          Инновационное производство пептидов и химических веществ.
          <br />Полный спектр услуг для фармацевтики и биотехнологий.
        </motion.p>
        
        <motion.div 
          className="flex flex-row gap-2 sm:gap-3 justify-center"
          variants={itemVariants}
        >
          <Button 
            to="/catalog" 
            variant="secondary"
            className="bg-white text-primary hover:bg-gray-50 hover:text-primary-dark transition-colors text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
          >
            Каталог продукции
          </Button>
          
          <Button 
            to="/services" 
            variant="secondary"
            className="border-white text-white hover:bg-white/20 hover:text-white transition-colors text-xs sm:text-sm py-2 px-3 sm:py-2.5 sm:px-4"
          >
            Наши услуги
          </Button>
        </motion.div>
        
        {/* Индикатор прокрутки - скрываем на маленьких экранах */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden sm:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-9 border-2 border-white/50 rounded-full flex justify-center">
            <motion.div 
              className="w-1 h-2 bg-white/70 rounded-full"
              animate={{ y: [2, 5, 2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MainBanner;