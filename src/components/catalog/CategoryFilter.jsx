import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  showFilters = true 
}) => {
  if (!showFilters) return null;

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Мобильная версия - компактный вид */}
      <div className="block md:hidden">
        <h3 className="text-sm font-medium mb-3 text-text">Категории</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outlined'}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="text-xs"
            >
              <span className="text-text">{category.name}</span>
              <span className="ml-1 opacity-70">({category.count})</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Десктопная версия - горизонтальный список */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outlined'}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className="whitespace-nowrap"
            >
              <span className={selectedCategory === category.id ? 'text-white' : 'text-text'}>
                {category.name}
              </span>
              <span className={`ml-2 ${selectedCategory === category.id ? 'text-white/70' : 'text-text-secondary'}`}>
                ({category.count})
              </span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryFilter;