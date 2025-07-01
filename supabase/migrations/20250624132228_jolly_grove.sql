/*
  # Добавление детальных характеристик пептидов
  
  1. Новые поля
    - Добавлены поля для хранения подробных характеристик пептидных продуктов
    - CAS номер, количество, чистота, форма, формулы и другие научные параметры
    
  2. Индексы
    - Созданы индексы для оптимизации поиска по добавленным полям
*/

-- Добавление детальных полей в таблицу products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cas_number text,
  ADD COLUMN IF NOT EXISTS quantity text,
  ADD COLUMN IF NOT EXISTS peptide_content text,
  ADD COLUMN IF NOT EXISTS purity text,
  ADD COLUMN IF NOT EXISTS form text,
  ADD COLUMN IF NOT EXISTS auxiliary_substances text,
  ADD COLUMN IF NOT EXISTS storage text,
  ADD COLUMN IF NOT EXISTS sequence text,
  ADD COLUMN IF NOT EXISTS chemical_name text,
  ADD COLUMN IF NOT EXISTS molecular_weight text,
  ADD COLUMN IF NOT EXISTS molecular_formula text,
  ADD COLUMN IF NOT EXISTS synonyms text,
  ADD COLUMN IF NOT EXISTS research_area text,
  ADD COLUMN IF NOT EXISTS dosage text,
  ADD COLUMN IF NOT EXISTS structural_formula text,
  ADD COLUMN IF NOT EXISTS additional_images jsonb DEFAULT '[]'::jsonb;

-- Обновление примера продукта с подробными характеристиками (Semax)
UPDATE products
SET 
  cas_number = '80714-61-0',
  quantity = '10 мл',
  peptide_content = '0,1% (10 мг)',
  purity = 'более 97%',
  form = 'раствор в дозаторе',
  auxiliary_substances = 'вода очищенная, натрия хлорид, метилпарабен',
  storage = 'не более +5 °С',
  sequence = 'Met-Glu-His-Phe-Pro-Gly-Pro',
  chemical_name = 'метионил-глутамил-гистидил-фенилаланил-пролил-глицил-пролина ацетат',
  molecular_weight = '813,922',
  molecular_formula = 'C41H53N9O10S',
  synonyms = 'MEHFPGP, ACTH (4-7) Pro-Gly-Pro-',
  research_area = 'нейропротекторная и ноотропная активность',
  dosage = '1 нажатие — 125 мкг'
WHERE id IN (
  SELECT id FROM products 
  WHERE name ILIKE '%Semax%' OR name ILIKE '%семакс%' 
  ORDER BY created_at DESC 
  LIMIT 5
);

-- Обновление другого примера - BPC-157
UPDATE products
SET 
  cas_number = '137525-51-0',
  quantity = '5 мг',
  peptide_content = '99%',
  purity = '>98%',
  form = 'Лиофилизированный порошок',
  auxiliary_substances = 'Отсутствуют',
  storage = 'В сухом, защищенном от света месте при температуре -20°C',
  sequence = 'GEPPPGKPADDAGLV',
  chemical_name = 'Пентадекапептид-3, фрагмент протеина тела желудка',
  molecular_weight = '1419.53 Da',
  molecular_formula = 'C62H89N15O19',
  synonyms = 'Body Protection Compound-157, PL-10, Pentadecapeptide BPC 157',
  research_area = 'Регенерация тканей, гастропротекторная активность, заживление ран',
  dosage = '1-10 мкг/кг массы тела'
WHERE id IN (
  SELECT id FROM products 
  WHERE name ILIKE '%BPC-157%' OR name ILIKE '%BPC 157%' 
  ORDER BY created_at DESC 
  LIMIT 5
);

-- Индексы для улучшения производительности поиска
CREATE INDEX IF NOT EXISTS idx_products_cas_number ON products(cas_number);
CREATE INDEX IF NOT EXISTS idx_products_form ON products(form);
CREATE INDEX IF NOT EXISTS idx_products_research_area ON products(research_area);