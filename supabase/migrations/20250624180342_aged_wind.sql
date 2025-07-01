/*
  # Добавление поля updated_at в таблицу users
  
  1. Новые поля
     - `updated_at` - Время последнего обновления записи пользователя
     
  2. Безопасность
     - Временное отключение триггера check_user_bans для предотвращения рекурсии
     - Корректное обновление существующих записей
*/

-- Временно отключаем триггер для предотвращения рекурсии
ALTER TABLE public.users DISABLE TRIGGER trigger_check_user_bans;

-- Добавляем колонку updated_at если её ещё нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'updated_at' AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
    
    -- Обновляем существующие записи, устанавливая updated_at равным created_at
    UPDATE public.users 
    SET updated_at = created_at 
    WHERE updated_at IS NULL;
  END IF;
END $$;

-- Создаем функцию для обновления только поля updated_at
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Проверяем, существует ли уже триггер
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_users_updated_at'
    AND tgrelid = 'public.users'::regclass
  ) THEN
    -- Создаем триггер для автоматического обновления updated_at
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION update_users_timestamp();
  END IF;
END $$;

-- Включаем триггер обратно
ALTER TABLE public.users ENABLE TRIGGER trigger_check_user_bans;