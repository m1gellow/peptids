import React from 'react';
import { motion } from 'framer-motion';

const Section = ({
  title,
  subtitle,
  children,
  className = '',
  id,
  variant = 'default',
  centered = false,
}) => {
  // Варианты анимации
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1,
      }
    }
  };

  // Варианты фона
  const variantClasses = {
    default: 'bg-white',
    primary: 'bg-primary-bg',
    dark: 'bg-gray-50',
  };

  return (
    <motion.section
      id={id}
      className={`py-8 ${variantClasses[variant]} ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4">
        {(title || subtitle) && (
          <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
            {title && (
              <motion.h2 
                className="text-2xl sm:text-3xl font-bold text-text mb-2"
                variants={{
                  hidden: { opacity: 0, y: -10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                }}
              >
                {title}
              </motion.h2>
            )}
            
            {subtitle && (
              <motion.p 
                className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.1 } }
                }}
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.3, delay: 0.2 } }
          }}
        >
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Section;