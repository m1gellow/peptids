/*
  # Функции для работы с аналитикой

  1. Новые функции
     - `increment_page_views` - Увеличивает счетчик просмотров страниц для посетителя
     - `update_page_view_time` - Обновляет время, проведенное на странице
     - `update_visitor_stats` - Обновляет статистику посетителя
  
  2. Безопасность
     - Функции вызываются только авторизованными пользователями или анонимно
*/

-- Функция для увеличения счетчика просмотров страниц
CREATE OR REPLACE FUNCTION increment_page_views(p_visitor_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE visitor_analytics
  SET total_page_views = total_page_views + 1
  WHERE visitor_id = p_visitor_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для обновления времени, проведенного на странице
CREATE OR REPLACE FUNCTION update_page_view_time(
  p_visitor_id TEXT,
  p_session_id TEXT,
  p_page_url TEXT,
  p_time_on_page INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Найти последнюю запись просмотра страницы и обновить время на странице
  UPDATE page_views
  SET time_on_page = p_time_on_page
  WHERE visitor_id = p_visitor_id
    AND session_id = p_session_id
    AND page_url = p_page_url
    AND (time_on_page IS NULL OR created_at = (
      SELECT MAX(created_at)
      FROM page_views
      WHERE visitor_id = p_visitor_id
        AND session_id = p_session_id
        AND page_url = p_page_url
    ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция обновления статистики посетителя
CREATE OR REPLACE FUNCTION update_visitor_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Обновляем поле updated_at
  NEW.updated_at := NOW();
  
  -- Если это обновление последнего визита, увеличиваем счетчик сессий
  IF OLD.last_visit IS DISTINCT FROM NEW.last_visit THEN
    NEW.total_sessions := COALESCE(NEW.total_sessions, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Если триггер уже существует, удаляем его перед созданием
DROP TRIGGER IF EXISTS update_visitor_analytics_updated_at ON visitor_analytics;

-- Создаем триггер для автоматического обновления поля updated_at и счетчика сессий
CREATE TRIGGER update_visitor_analytics_updated_at
BEFORE UPDATE ON visitor_analytics
FOR EACH ROW
EXECUTE FUNCTION update_visitor_stats();