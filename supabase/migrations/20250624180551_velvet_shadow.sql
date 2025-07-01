/*
  # Исправление триггеров для загрузки аватарки

  1. Изменения
    - Исправление функции `check_user_bans()` для предотвращения рекурсии
    - Исправление функции `update_users_timestamp()` для предотвращения рекурсии
    - Добавление проверок на изменение данных перед обновлением

  2. Безопасность
    - Сохранение всех существующих политик RLS
    - Функции обновляются с проверкой существования
*/

-- Исправляем функцию check_user_bans для предотвращения рекурсии
CREATE OR REPLACE FUNCTION check_user_bans()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем только если изменился статус или ban_reason
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = NEW.status AND 
       OLD.ban_reason IS NOT DISTINCT FROM NEW.ban_reason AND
       OLD.banned_until IS NOT DISTINCT FROM NEW.banned_until THEN
      RETURN NEW; -- Ничего не изменилось, выходим
    END IF;
  END IF;

  -- Проверяем автоматическое снятие бана если время истекло
  IF NEW.status = 'banned' AND 
     NEW.banned_until IS NOT NULL AND 
     NEW.banned_until <= NOW() THEN
    
    -- Только если статус действительно нужно изменить
    IF NEW.status != 'active' OR NEW.ban_reason IS NOT NULL THEN
      NEW.status := 'active';
      NEW.ban_reason := NULL;
      NEW.banned_until := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Исправляем функцию update_users_timestamp для предотвращения рекурсии
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Проверяем, изменилось ли что-то кроме updated_at
  IF TG_OP = 'UPDATE' THEN
    IF OLD.name IS NOT DISTINCT FROM NEW.name AND
       OLD.email IS NOT DISTINCT FROM NEW.email AND
       OLD.role IS NOT DISTINCT FROM NEW.role AND
       OLD.avatar_url IS NOT DISTINCT FROM NEW.avatar_url AND
       OLD.telegram_id IS NOT DISTINCT FROM NEW.telegram_id AND
       OLD.status IS NOT DISTINCT FROM NEW.status AND
       OLD.ban_reason IS NOT DISTINCT FROM NEW.ban_reason AND
       OLD.banned_until IS NOT DISTINCT FROM NEW.banned_until AND
       OLD.level IS NOT DISTINCT FROM NEW.level AND
       OLD.last_login IS NOT DISTINCT FROM NEW.last_login AND
       OLD.notes IS NOT DISTINCT FROM NEW.notes AND
       OLD.account_locked IS NOT DISTINCT FROM NEW.account_locked AND
       OLD.failed_login_attempts IS NOT DISTINCT FROM NEW.failed_login_attempts AND
       OLD.phone IS NOT DISTINCT FROM NEW.phone THEN
      RETURN NEW; -- Ничего не изменилось кроме updated_at, выходим
    END IF;
  END IF;

  -- Обновляем updated_at только если он действительно изменился
  IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at OR NEW.updated_at IS NULL THEN
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Пересоздаем триггеры для обеспечения правильного порядка выполнения
DROP TRIGGER IF EXISTS trigger_check_user_bans ON users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Создаем триггер проверки банов (выполняется первым)
CREATE TRIGGER trigger_check_user_bans
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION check_user_bans();

-- Создаем триггер обновления времени (выполняется вторым)
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users  
  FOR EACH ROW
  EXECUTE FUNCTION update_users_timestamp();