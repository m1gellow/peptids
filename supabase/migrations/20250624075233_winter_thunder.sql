/*
  # Добавление меток пептидов и связей с товарами

  1. Новые таблицы
    - `product_tags` - хранит метки (тэги) пептидов
    - `product_tags_products` - связь между тегами и товарами (many-to-many)
    
  2. Структура
    - Метка имеет название, slug для URL, описание и количество продуктов
    - Связь многие-ко-многим для гибкого присвоения меток товарам
    
  3. Безопасность
    - Применены политики RLS для защиты данных
    - Администраторы могут управлять метками
    - Все пользователи могут просматривать метки
*/

-- Создание таблицы для хранения меток пептидов
CREATE TABLE IF NOT EXISTS product_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  product_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Индексы для таблицы меток
CREATE INDEX IF NOT EXISTS idx_product_tags_slug ON product_tags(slug);
CREATE INDEX IF NOT EXISTS idx_product_tags_is_active ON product_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_product_tags_product_count ON product_tags(product_count DESC);

-- Таблица связи между продуктами и метками (многие ко многим)
CREATE TABLE IF NOT EXISTS product_tags_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, tag_id)
);

-- Индексы для таблицы связей
CREATE INDEX IF NOT EXISTS idx_product_tags_products_product_id ON product_tags_products(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_products_tag_id ON product_tags_products(tag_id);

-- Включение RLS для таблиц
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags_products ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для меток
CREATE POLICY "Администраторы могут управлять метками"
ON product_tags
FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Метки видны всем пользователям"
ON product_tags
FOR SELECT
TO public
USING (true);

-- Политики безопасности для связей меток с продуктами
CREATE POLICY "Администраторы могут управлять связями меток"
ON product_tags_products
FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Связи меток видны всем пользователям"
ON product_tags_products
FOR SELECT
TO public
USING (true);

-- Триггер для обновления счетчика продуктов для метки
CREATE OR REPLACE FUNCTION update_product_tag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE product_tags
    SET product_count = product_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE product_tags
    SET product_count = product_count - 1
    WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_tag_count_update
AFTER INSERT OR DELETE ON product_tags_products
FOR EACH ROW
EXECUTE FUNCTION update_product_tag_count();

-- Триггер для обновления поля updated_at
CREATE TRIGGER update_product_tags_updated_at
BEFORE UPDATE ON product_tags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Добавление начальных данных (популярные метки)
INSERT INTO product_tags (name, slug, description, is_active) VALUES
('BDNF', 'bdnf', 'Нейротрофический фактор мозга - белок, поддерживающий выживание существующих нейронов', true),
('DSIP', 'dsip', 'Дельта-сон индуцирующий пептид - нейропептид, связанный с регуляцией сна', true),
('Epithalon', 'epithalon', 'Тетрапептид, регулирующий функцию эпифиза и продлевающий жизнь', true),
('GLP-1', 'glp-1', 'Глюкагоноподобный пептид-1 - инкретиновый гормон, регулирующий аппетит и уровень глюкозы', true),
('NAD+', 'nad-plus', 'Никотинамидадениндинуклеотид - кофермент, участвующий в метаболических процессах', true),
('Retatrutide', 'retatrutide', 'Пептид для лечения ожирения и диабета', true),
('Semax', 'semax', 'Ноотропный пептид с нейропротекторным действием', true),
('Tirzepatide', 'tirzepatide', 'Двойной агонист рецепторов GIP и GLP-1, применяемый при диабете', true),
('Анксиолитик', 'anksiolitik', 'Пептиды со свойствами снижения тревожности', true),
('Анти-эйдж', 'anti-age', 'Пептиды с антивозрастными свойствами', true),
('Антидепрессант', 'antidepressant', 'Пептиды с антидепрессивными свойствами', true),
('Антимикробный', 'antimicrobial', 'Пептиды с антимикробной активностью', true),
('Антиоксидант', 'antioxidant', 'Пептиды с антиоксидантными свойствами', true),
('Биорегулятор', 'bioregulator', 'Пептиды, регулирующие биологические процессы', true),
('Воспаление', 'inflammation', 'Пептиды, связанные с процессами воспаления', true),
('Геронтология', 'gerontology', 'Пептиды, применяемые в геронтологии', true),
('Гормон', 'hormone', 'Пептидные гормоны', true),
('Гормон роста', 'growth-hormone', 'Пептиды, стимулирующие выработку гормона роста', true),
('Диабет', 'diabetes', 'Пептиды для лечения диабета', true),
('Иммунитет', 'immunity', 'Пептиды, влияющие на иммунную систему', true),
('Кожа', 'skin', 'Пептиды для ухода за кожей', true),
('Косметика', 'cosmetics', 'Пептиды, используемые в косметологии', true),
('Либидо', 'libido', 'Пептиды, влияющие на либидо', true),
('Меланокортин', 'melanocortin', 'Пептиды меланокортинового ряда', true),
('Метаболизм', 'metabolism', 'Пептиды, влияющие на метаболизм', true),
('Митохондрии', 'mitochondria', 'Пептиды, влияющие на функцию митохондрий', true),
('Мозг', 'brain', 'Пептиды для мозга', true),
('Мышцы', 'muscles', 'Пептиды для роста и восстановления мышц', true),
('Нейропептид', 'neuropeptide', 'Нейропептиды различного действия', true),
('Нейропротектор', 'neuroprotector', 'Пептиды с нейропротекторными свойствами', true),
('Ноотроп', 'nootropic', 'Пептиды с ноотропными свойствами', true),
('Ожирение', 'obesity', 'Пептиды для снижения веса', true),
('Регенерация', 'regeneration', 'Пептиды, способствующие регенерации тканей', true),
('Сон', 'sleep', 'Пептиды, улучшающие качество сна', true),
('Фолликулы', 'follicles', 'Пептиды для роста волос', true),
('Цитопротектор', 'cytoprotector', 'Пептиды с защитными свойствами для клеток', true);

-- Добавим несколько начальных связей для демонстрации (в реальном проекте это нужно сделать отдельно)
-- Здесь предполагается, что в базе уже есть продукты с ID 'пептид-1', 'пептид-2', 'пептид-3'
-- Это просто демонстрация, в реальной базе нужно использовать настоящие ID
DO $$
DECLARE
  tag_id uuid;
  product_row record;
BEGIN
  -- Получаем ID для метки 'Анти-эйдж'
  SELECT id INTO tag_id FROM product_tags WHERE slug = 'anti-age' LIMIT 1;
  
  -- Для каждого продукта с "anti-age" в названии или описании добавляем связь
  FOR product_row IN
    SELECT id FROM products WHERE name ILIKE '%anti-age%' OR description ILIKE '%anti-age%' OR name ILIKE '%anti%age%' LIMIT 5
  LOOP
    BEGIN
      INSERT INTO product_tags_products (product_id, tag_id)
      VALUES (product_row.id, tag_id);
    EXCEPTION WHEN unique_violation THEN
      -- Игнорируем ошибки уникальности (если связь уже существует)
    END;
  END LOOP;
  
  -- Аналогично для метки 'Ноотроп'
  SELECT id INTO tag_id FROM product_tags WHERE slug = 'nootropic' LIMIT 1;
  FOR product_row IN
    SELECT id FROM products WHERE name ILIKE '%ноотроп%' OR description ILIKE '%ноотроп%' LIMIT 5
  LOOP
    BEGIN
      INSERT INTO product_tags_products (product_id, tag_id)
      VALUES (product_row.id, tag_id);
    EXCEPTION WHEN unique_violation THEN
      -- Игнорируем ошибки уникальности
    END;
  END LOOP;
END;
$$;