import React from 'react';
import { motion } from 'framer-motion';
import { statsData } from '../../data/products';

const StatsSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const CountUpNumber = ({ end, label }) => {
    const [count, setCount] = React.useState(0);
    
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const increment = end / 50;
        const updateCount = () => {
          setCount(prevCount => {
            const newCount = prevCount + increment;
            if (newCount >= end) {
              return end;
            }
            setTimeout(updateCount, 30);
            return newCount;
          });
        };
        updateCount();
      }, 500);
      
      return () => clearTimeout(timer);
    }, [end]);

    return (
      <span className="stats-number text-4xl sm:text-5xl">
        {Math.floor(count).toLocaleString()}
        {label && <span className="text-2xl ml-1">{label}</span>}
      </span>
    );
  };

  return (
    <div 
      className="py-12 bg-primary-dark relative overflow-hidden"
      style={{
        backgroundImage: `url(https://russianpeptide.com/wp-content/uploads/2016/04/bg-1.jpg)`,
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
      }}
    >
      {/* Оверлей */}
      <div className="absolute inset-0 bg-primary-dark opacity-80"></div>
      
      <div className="container relative mx-auto px-4">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {statsData.map((stat, index) => (
            <motion.div 
              key={index}
              className="quick-fact"
              variants={itemVariants}
            >
              <div className="mb-2">
                <CountUpNumber end={stat.number} label={stat.label} />
              </div>
              <div className="title text-white text-xs font-bold text-center uppercase leading-tight">
                {stat.title}
              </div>
              <div className="w-12 h-0.5 bg-white mx-auto mt-2 opacity-50"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default StatsSection;