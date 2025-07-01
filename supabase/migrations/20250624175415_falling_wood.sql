/*
  # Исправление уникального ограничения для visitor_analytics

  1. Изменения
     - Добавляется уникальное ограничение на поле `visitor_id` в таблице `visitor_analytics`
     - Это исправляет ошибку upsert операций, которые требуют уникального ограничения для ON CONFLICT

  2. Безопасность
     - Сохраняются все существующие политики RLS
     - Удаляются возможные дубликаты перед добавлением ограничения
*/

-- Сначала удаляем возможные дубликаты, оставляя только самые новые записи
DELETE FROM visitor_analytics
WHERE id NOT IN (
  SELECT DISTINCT ON (visitor_id) id
  FROM visitor_analytics
  ORDER BY visitor_id, created_at DESC
);

-- Добавляем уникальное ограничение на visitor_id
ALTER TABLE visitor_analytics 
ADD CONSTRAINT visitor_analytics_visitor_id_unique UNIQUE (visitor_id);