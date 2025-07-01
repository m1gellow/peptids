import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Поиск товаров...", 
  suggestions = [], 
  onSuggestionSelect,
  onClear 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Обработка клавиш для навигации по предложениям
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  };

  // Обработка клика по предложению
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      onChange({ target: { value: suggestion } });
    }
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Обработка изменения значения
  const handleChange = (e) => {
    onChange(e);
    setActiveSuggestionIndex(-1);
    setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0);
  };

  // Обработка фокуса
  const handleFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Обработка потери фокуса
  const handleBlur = (e) => {
    // Небольшая задержка, чтобы клик по предложению успел обработаться
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    }, 100);
  };

  // Обработка очистки
  const handleClear = () => {
    onChange({ target: { value: '' } });
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  // Скрытие предложений при изменении списка предложений
  useEffect(() => {
    if (suggestions.length === 0) {
      setShowSuggestions(false);
    } else if (value.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions, value]);

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-text-secondary" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-3 
            border border-divider rounded-lg
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            bg-white text-text placeholder:text-text-secondary
            text-sm transition-all duration-200
          "
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Предложения */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-divider rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                w-full px-4 py-2 text-left text-sm
                hover:bg-primary-bg transition-colors
                ${index === activeSuggestionIndex ? 'bg-primary-bg' : ''}
                ${index === 0 ? 'rounded-t-lg' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
              `}
            >
              <div className="flex items-center">
                <FiSearch className="h-4 w-4 text-text-secondary mr-3" />
                <span className="text-text">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;