-- Миграция для правильной настройки политик хранилища аватаров
-- Эта миграция очищает существующие политики и создает новые для корректной работы с аватарами

-- Очистка существующих политик для избежания конфликтов
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all avatars" ON storage.objects;

-- Создание корректных политик для работы с хранилищем аватаров
-- 1. Загрузка: пользователи могут загружать только в свою папку
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Обновление: пользователи могут обновлять только свои файлы
CREATE POLICY "Users can update their own avatars" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Удаление: пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Чтение: все файлы в бакете аватаров должны быть публично доступны
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- 5. Администраторы: полный доступ ко всем файлам
CREATE POLICY "Admins can manage all avatars" 
ON storage.objects
FOR ALL 
TO authenticated
USING (
  bucket_id = 'user-avatars' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Проверяем и обновляем настройки бакета для аватаров
DO $$
BEGIN
  -- Создаем бакет, если его не существует
  INSERT INTO storage.buckets (id, name, public)
  SELECT 
    'user-avatars', 
    'User Avatars', 
    true
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-avatars'
  );
  
  -- Обновляем публичный доступ
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'user-avatars';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось обновить бакет user-avatars: %', SQLERRM;
END;
$$;

-- Также настроим аналогичные политики для product-images бакета
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
CREATE POLICY "Public read access for product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Настраиваем публичный доступ для product-images
DO $$
BEGIN
  UPDATE storage.buckets
  SET public = true
  WHERE id = 'product-images';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось обновить бакет product-images: %', SQLERRM;
END;
$$;