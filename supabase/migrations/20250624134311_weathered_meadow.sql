/*
  # Установка политик доступа для хранилища аватаров

  1. Новые Политики
    - Создание политик доступа для хранилища аватаров
    - Разрешения на просмотр, загрузку, обновление и удаление аватаров
    
  2. Безопасность
    - Пользователи могут управлять только своими аватарами
    - Публичный доступ для просмотра аватаров всем пользователям
*/

-- Очистка существующих политик для избежания конфликтов
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for avatars" ON storage.objects;

-- Политика для загрузки аватаров (только свои файлы в своей папке)
CREATE POLICY "Users can upload their own avatars" 
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для обновления аватаров (только свои файлы)
CREATE POLICY "Users can update their own avatars" 
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для удаления аватаров (только свои файлы)
CREATE POLICY "Users can delete their own avatars" 
ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'user-avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Политика для просмотра аватаров (публичный доступ)
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Добавляем политику для администраторов, чтобы они могли управлять всеми аватарами
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

-- Проверяем, существует ли бакет user-avatars, и создаем его, если нет
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  SELECT 'user-avatars', 'User Avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'user-avatars'
  );
  
  -- Установка Cross-Origin Resource Sharing (CORS) для публичного доступа к бакету
  UPDATE storage.buckets
  SET cors_origins = ARRAY['*']
  WHERE id = 'user-avatars';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Не удалось создать или обновить бакет user-avatars: %', SQLERRM;
END;
$$;