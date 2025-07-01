/*
  # Добавление полей курса обмена для криптовалют

  1. New Fields
    - `exchange_rate` (numeric) - Курс обмена для конвертации рублей в криптовалюту
    - `name` (text) - Человекочитаемое имя метода оплаты
  2. Updates
    - Заполнение значениями по умолчанию для существующих записей
  3. Indexes
    - Добавление индекса для быстрого поиска
*/

-- Добавление полей курса обмена и имени к таблице payment_addresses
ALTER TABLE payment_addresses 
ADD COLUMN IF NOT EXISTS exchange_rate numeric(20, 8) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS name text;

-- Обновление существующих записей с базовыми курсами
UPDATE payment_addresses SET 
  exchange_rate = CASE 
    WHEN type = 'btc' THEN 0.0000021 -- примерно 2,600,000 руб за 1 BTC
    WHEN type = 'eth' THEN 0.000033 -- примерно 166,000 руб за 1 ETH
    WHEN type = 'usdt_trc20' THEN 0.011 -- примерно 90 руб за 1 USDT
    WHEN type = 'usdt_erc20' THEN 0.011 -- примерно 90 руб за 1 USDT
    WHEN type = 'manual' THEN 1.0
    ELSE 1.0
  END,
  name = CASE
    WHEN type = 'btc' THEN 'Bitcoin (BTC)'
    WHEN type = 'eth' THEN 'Ethereum (ETH)'
    WHEN type = 'usdt_trc20' THEN 'USDT (TRC20)'
    WHEN type = 'usdt_erc20' THEN 'USDT (ERC20)'
    WHEN type = 'manual' THEN 'Ручной платеж'
    ELSE 'Неизвестный метод'
  END
WHERE name IS NULL OR exchange_rate = 1.0;

-- Добавление индекса для ускорения поиска по типу платежа
CREATE INDEX IF NOT EXISTS idx_payment_addresses_type ON payment_addresses (type);

-- Добавление уникального ограничения на тип, если его ещё нет
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_addresses_type_unique'
  ) THEN
    ALTER TABLE payment_addresses ADD CONSTRAINT payment_addresses_type_unique UNIQUE (type);
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ничего не делаем, если ограничение уже есть или возникла ошибка
END$$;