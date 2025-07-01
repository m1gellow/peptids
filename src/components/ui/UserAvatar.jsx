import React, { useState } from 'react';
import { FiUser, FiEdit, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { showNotification } from '../../utils/telegramUtils';
import supabase from '../../lib/supabase';
/**
 * Компонент для отображения и редактирования аватара пользователя
 * @param {Object} props - Свойства компонента
 * @param {string} props.userId - ID пользователя
 * @param {string} props.avatarUrl - URL аватара
 * @param {boolean} props.editable - Можно ли редактировать аватар
 * @param {function} props.onAvatarChange - Функция, вызываемая при изменении аватара
 * @param {string} props.size - Размер аватара (sm, md, lg)
 * @param {string} props.className - Дополнительные CSS классы
 */
const UserAvatar = ({ 
  userId,
  avatarUrl,
  editable = false,
  onAvatarChange,
  size = 'md',
  className = '',
  ...props
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Размеры в зависимости от пропа size
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size] || 'w-16 h-16';
  
  // Размер иконки в зависимости от размера аватара
  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
  }[size] || 24;

  // Функция для предотвращения кеширования изображения
  const getUncachedUrl = (url) => {
    if (!url) return null;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${new Date().getTime()}`;
  };

  // Загрузка нового аватара
  const handleAvatarUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Проверка размера файла (максимум 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Файл слишком большой (максимум 2MB)');
        return;
      }
      
      // Проверка типа файла
      if (!file.type.match(/image\/(jpeg|jpg|png|webp|gif)/)) {
        setError('Поддерживаются только изображения (JPEG, PNG, WEBP, GIF)');
        return;
      }
      
      setUploading(true);
      setError(null);
      
      // Путь для хранения (userId/avatar-timestamp.ext)
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Загрузка в storage
      const { data, error } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Получение публичного URL
      const { data: urlData } = supabase
        .storage
        .from('user-avatars')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData?.publicUrl;
      
      // Обновление профиля пользователя
      if (publicUrl) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);
        
        if (updateError) throw updateError;
        
        // Обновление аватара в метаданных
        const { error: metadataError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
        
        if (metadataError) console.warn("Не удалось обновить метаданные:", metadataError);
        
        // Вызываем callback, если он определен
        if (onAvatarChange) {
          onAvatarChange(publicUrl);
        }
        
        showNotification('Аватар успешно обновлен');
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
      setError('Ошибка загрузки аватара');
      showNotification('Ошибка загрузки аватара. Попробуйте еще раз.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden bg-gray-100 group ${sizeClasses} ${className}`}
      {...props}
    >
      {avatarUrl ? (
        // Если есть URL аватара
        <>
          <img 
            src={getUncachedUrl(avatarUrl)} 
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
              setError('Не удалось загрузить изображение');
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300">
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </>
      ) : (
        // Если нет URL аватара - показываем иконку
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
          <FiUser size={iconSize} />
        </div>
      )}
      
      {/* Кнопка редактирования */}
      {editable && (
        <label 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity cursor-pointer"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center w-full h-full"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <FiCamera size={iconSize/2} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.div>
          <input 
            type="file" 
            accept="image/*" 
            className="sr-only" 
            onChange={handleAvatarUpload}
            disabled={uploading}
          />
        </label>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 text-white text-xs p-1 text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;