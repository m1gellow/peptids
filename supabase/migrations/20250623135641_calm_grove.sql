/*
  # Добавление курса обмена к платежным адресам

  1. Новые поля
    - `exchange_rate` - курс обмена для конвертации рублей в криптовалюту
    - `name` - название метода оплаты для удобства администрирования

  2. Обновление
    - Установка базовых курсов обмена для существующих записей
    - Курсы BTC, ETH и USDT на основе примерных рыночных значений
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
    WHEN type = 'btc' THEN 'Bitcoin'
    WHEN type = 'eth' THEN 'Ethereum'
    WHEN type = 'usdt_trc20' THEN 'USDT (TRC20)'
    WHEN type = 'usdt_erc20' THEN 'USDT (ERC20)'
    WHEN type = 'manual' THEN 'Ручной платеж'
    ELSE 'Неизвестный метод'
  END
WHERE name IS NULL OR exchange_rate = 1.0;

-- Добавление индекса для ускорения поиска по типу платежа
CREATE INDEX IF NOT EXISTS idx_payment_addresses_type ON payment_addresses (type);