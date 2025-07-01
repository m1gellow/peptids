import React, { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';

/**
 * Компонент для отображения аватара пользователя с обработкой ошибок
 * @param {Object} props - Свойства компонента
 * @param {string} props.src - URL изображения
 * @param {string} props.alt - Альтернативный текст
 * @param {string} props.size - Размер аватара (sm, md, lg)
 * @param {string} props.className - Дополнительные CSS классы
 */
const AvatarImage = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  // Обновляем источник изображения при изменении src
  useEffect(() => {
    if (src) {
      setImgSrc(addCacheBuster(src));
      setError(false);
    } else {
      setError(true);
    }
  }, [src]);

  // Размеры в зависимости от пропа size
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size] || 'w-12 h-12';

  // Размер иконки в зависимости от размера аватара
  const iconSize = {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  }[size] || 20;

  // Функция для добавления параметра к URL для предотвращения кеширования
  function addCacheBuster(url) {
    if (!url) return '';
    const cacheBuster = `t=${new Date().getTime()}`;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${cacheBuster}`;
  }

  // Обработка ошибки загрузки изображения
  const handleImageError = () => {
    setError(true);
  };

  return (
    <div className={`rounded-full overflow-hidden ${sizeClasses} ${className}`} {...props}>
      {!error && imgSrc ? (
        <img
          src={imgSrc}
          alt={alt}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
          <FiUser size={iconSize} />
        </div>
      )}
    </div>
  );
};

export default AvatarImage;