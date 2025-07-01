import { createClient } from '@supabase/supabase-js';

// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlscHZkcHlnbHNjZGdveGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU3NjUsImV4cCI6MjA2NjE4MTc2NX0.pT1W_5ySCLQe9b-vI32GTK_UOodQ5X3sq1IT2KyKkbw
// VITE_SUPABASE_URL=https://yzpilpvdpyglscdgoxdp.supabase.co

// Получение переменных окружения
export const supabaseUrl = "https://yzpilpvdpyglscdgoxdp.supabase.co";
export const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlscHZkcHlnbHNjZGdveGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MDU3NjUsImV4cCI6MjA2NjE4MTc2NX0.pT1W_5ySCLQe9b-vI32GTK_UOodQ5X3sq1IT2KyKkbw";

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
