import { createClient } from '@supabase/supabase-js';

// Получение переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Проверка наличия переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Отсутствуют обязательные переменные окружения для Supabase:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
}

// Создание клиента Supabase с улучшенными параметрами
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Добавляем настройки для повторных попыток и таймаутов
  realtime: {
    timeout: 30000, // Увеличиваем таймаут для realtime соединений
  },
});

// Проверка соединения
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Ошибка проверки соединения с Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Критическая ошибка соединения с Supabase:', error);
    return false;
  }
};

// Экспортируем функцию для получения клиента (для совместимости)
export const getSupabaseClient = () => supabase;

// Экспорт по умолчанию
export default supabase;
