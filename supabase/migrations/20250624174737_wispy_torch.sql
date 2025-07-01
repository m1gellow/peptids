/*
  # Добавление уникального ограничения и индекса для visitor_analytics
  
  1. Изменения
     - Добавление уникального ограничения на поле visitor_id в таблице visitor_analytics
     - Создание уникального индекса для повышения производительности
     
  2. Цель
     - Исправление ошибок "no unique constraint" при операциях upsert
     - Предотвращение deadlock'ов при одновременных операциях с одним и тем же visitor_id
*/

-- Добавление уникального ограничения на поле visitor_id
DO $$
BEGIN
  -- Проверяем, существует ли уже ограничение
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'visitor_analytics_visitor_id_key' 
    AND conrelid = 'visitor_analytics'::regclass
  ) THEN
    -- Если ограничения нет, добавляем его
    ALTER TABLE visitor_analytics 
    ADD CONSTRAINT visitor_analytics_visitor_id_key UNIQUE (visitor_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Обрабатываем ошибки (например, если таблица не существует)
  RAISE NOTICE 'Ошибка добавления ограничения: %', SQLERRM;
END
$$;

-- Создание уникального индекса, если его еще нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_visitor_analytics_visitor_id_unique' 
    AND tablename = 'visitor_analytics'
  ) THEN
    CREATE UNIQUE INDEX idx_visitor_analytics_visitor_id_unique 
    ON visitor_analytics(visitor_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Ошибка создания индекса: %', SQLERRM;
END
$$;

-- Добавляем функцию increment_sessions_count, если её нет
CREATE OR REPLACE FUNCTION increment_sessions_count(visitor_id TEXT) 
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  -- Получаем текущее значение
  SELECT total_sessions INTO current_count
  FROM visitor_analytics
  WHERE visitor_analytics.visitor_id = increment_sessions_count.visitor_id;
  
  -- Возвращаем увеличенное значение
  RETURN COALESCE(current_count, 0) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;