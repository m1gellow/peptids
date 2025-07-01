/**
 * Утилиты для работы с Storage в Supabase
 */
import { createClient } from '@supabase/supabase-js';

// Создаем клиента Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Загружает изображение из URL в Supabase Storage
 * @param {string} imageUrl - URL изображения для загрузки
 * @param {string} bucket - Название bucket'а
 * @param {string} path - Путь для сохранения файла
 * @returns {Promise<string|null>} - URL загруженного изображения или null в случае ошибки
 */
export const uploadImageFromUrl = async (imageUrl, bucket = 'user-avatars', path = null) => {
  try {
    // Проверяем параметры
    if (!imageUrl) {
      console.error('Ошибка: не указан URL изображения');
      return null;
    }

    if (!bucket) {
      console.error('Ошибка: не указан bucket');
      return null;
    }

    // Получаем изображение
    const response = await fetch(imageUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Получаем тип контента и blob
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const blob = await response.blob();

    // Генерируем путь, если не указан
    if (!path) {
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = contentType.split('/')[1] || 'jpg';
      path = `${randomId}.${extension}`;
    }

    // Добавляем метку времени для предотвращения кеширования
    const timestamp = new Date().getTime();
    const finalPath = path.includes('?') ? `${path}&t=${timestamp}` : `${path}?t=${timestamp}`;

    // Загружаем в storage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(finalPath, blob, {
        contentType,
        cacheControl: 'max-age=3600',
        upsert: true // Перезаписать, если файл уже существует
      });

    if (error) {
      throw error;
    }

    // Получаем публичный URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(finalPath);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('Ошибка загрузки изображения в Storage:', error);
    return null;
  }
};

/**
 * Удаляет файл из Supabase Storage
 * @param {string} path - Путь к файлу
 * @param {string} bucket - Название bucket'а
 * @returns {Promise<boolean>} - true в случае успеха, false в случае ошибки
 */
export const deleteFile = async (path, bucket = 'user-avatars') => {
  try {
    const { error } = await supabase
      .storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Ошибка удаления файла из Storage:', error);
    return false;
  }
};

/**
 * Получает публичный URL файла с параметром для предотвращения кеширования
 * @param {string} path - Путь к файлу
 * @param {string} bucket - Название bucket'а
 * @returns {string|null} - Публичный URL или null
 */
export const getPublicUrl = (path, bucket = 'user-avatars') => {
  try {
    if (!path) return null;
    
    const { data } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(path);
    
    if (!data?.publicUrl) return null;
    
    // Добавляем параметр для предотвращения кеширования
    const timestamp = new Date().getTime();
    const url = data.publicUrl;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${timestamp}`;
  } catch (error) {
    console.error('Ошибка получения публичного URL:', error);
    return null;
  }
};

/**
 * Загружает файл Blob или File в Storage
 * @param {Blob|File} file - Файл для загрузки
 * @param {string} userId - ID пользователя
 * @param {string} bucket - Название bucket'а
 * @returns {Promise<string|null>} - URL загруженного файла или null
 */
export const uploadFile = async (file, userId, bucket = 'user-avatars') => {
  try {
    if (!file || !userId) {
      console.error('Не указаны обязательные параметры для загрузки файла');
      return null;
    }
    
    // Определяем тип файла и создаем путь
    const contentType = file.type || 'application/octet-stream';
    const fileExt = file.name?.split('.').pop() || contentType.split('/')[1] || 'bin';
    const fileName = `avatar-${new Date().getTime()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        contentType,
        cacheControl: 'max-age=3600',
        upsert: true
      });

    if (error) {
      console.error('Ошибка загрузки файла:', error);
      throw error;
    }

    // Получаем публичный URL
    const { data: publicUrlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (error) {
    console.error('Ошибка загрузки файла в Storage:', error);
    return null;
  }
};

/**
 * Проверяет доступность файла в Storage
 * @param {string} url - URL файла
 * @returns {Promise<boolean>} - true если файл доступен
 */
export const isFileAccessible = async (url) => {
  if (!url) return false;
  
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      cache: 'no-store'
    });
    return response.ok;
  } catch (error) {
    console.error('Ошибка проверки доступности файла:', error);
    return false;
  }
};