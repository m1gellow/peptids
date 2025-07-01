# Russian Peptide Database Architecture

Это документация архитектуры базы данных проекта "Russian Peptide". Документация содержит описание всех таблиц, полей, индексов, политик доступа, триггеров и функций.

## Схема базы данных

База данных использует схему `public` PostgreSQL, развернутую в Supabase.

## Перечисляемые типы (Enums)

### `order_status`
Статусы заказа:
- `pending` - Ожидает оплаты
- `paid` - Оплачен
- `processing` - В обработке
- `shipped` - Отправлен
- `delivered` - Доставлен
- `cancelled` - Отменен
- `pending_approval` - Ожидает подтверждения
- `approved` - Подтвержден

### `payment_status`
Статусы платежа:
- `pending` - В ожидании
- `confirming` - Подтверждается
- `confirmed` - Подтвержден
- `failed` - Не удалось
- `cancelled` - Отменен
- `waiting_confirmation` - Ожидает подтверждения
- `manual_verification` - Проверка вручную

### `payment_type`
Типы платежей:
- `btc` - Bitcoin
- `eth` - Ethereum
- `usdt_trc20` - USDT TRC20
- `usdt_erc20` - USDT ERC20
- `manual` - Ручная оплата

## Таблицы

### Таблица `users`
Хранит информацию о пользователях.

**Поля:**
- `id` (uuid, PK) - Идентификатор пользователя (соответствует ID в auth.users)
- `name` (text, NOT NULL) - Имя пользователя
- `email` (text, NOT NULL) - Email пользователя
- `role` (text, NOT NULL, DEFAULT 'user') - Роль пользователя ('user' или 'admin')
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления
- `avatar_url` (text) - URL аватара пользователя
- `telegram_id` (text) - ID пользователя в Telegram
- `status` (text, NOT NULL, DEFAULT 'active') - Статус пользователя
- `ban_reason` (text) - Причина бана
- `banned_until` (timestamptz) - Дата окончания бана
- `level` (integer, NOT NULL, DEFAULT 1) - Уровень пользователя
- `last_login` (timestamptz) - Дата последнего входа
- `notes` (text) - Заметки администратора
- `account_locked` (boolean, NOT NULL, DEFAULT false) - Заблокирован ли аккаунт
- `failed_login_attempts` (integer, NOT NULL, DEFAULT 0) - Количество неудачных попыток входа
- `phone` (text) - Телефон пользователя

**Индексы:**
- `idx_users_email` - По email
- `idx_users_id` - По ID
- `idx_users_id_role` - По ID и роли
- `idx_users_last_login` - По дате последнего входа
- `idx_users_level` - По уровню пользователя
- `idx_users_role` - По роли
- `idx_users_role_id` - По роли и ID
- `idx_users_status` - По статусу

**Ограничения:**
- `users_level_check` - Уровень должен быть от 0 до 10
- `users_role_check` - Роль должна быть 'user' или 'admin'
- `users_status_check` - Статус должен быть из списка допустимых

**Политики доступа (RLS):**
- Пользователи могут создавать свой профиль
- Пользователи могут читать профили (свой или если они администраторы)
- Пользователи могут обновлять профили (свой или если они администраторы)

**Триггеры:**
- `trigger_check_user_bans` - Проверка бана пользователя
- `update_users_updated_at` - Обновление даты изменения

### Таблица `products`
Хранит информацию о товарах.

**Поля:**
- `id` (text, PK) - Идентификатор товара
- `name` (text, NOT NULL) - Название товара
- `description` (text) - Описание товара
- `category_id` (text, FK) - Идентификатор категории
- `price` (text, NOT NULL) - Цена товара (текстовый формат)
- `base_price` (numeric(10,2)) - Базовая числовая цена для автоматических расчетов
- `image_url` (text) - URL изображения товара
- `sku` (text, NOT NULL, UNIQUE) - Артикул товара
- `specifications` (jsonb, DEFAULT '[]') - Спецификации товара в формате JSON
- `in_stock` (boolean, DEFAULT true) - Наличие товара
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления
- `currency` (text, DEFAULT 'RUB') - Валюта цены
- `cas_number` (text) - CAS номер (химический идентификатор)
- `quantity` (text) - Количество товара
- `peptide_content` (text) - Содержание пептида
- `purity` (text) - Чистота
- `form` (text) - Форма выпуска
- `auxiliary_substances` (text) - Вспомогательные вещества
- `storage` (text) - Условия хранения
- `sequence` (text) - Последовательность аминокислот
- `chemical_name` (text) - Химическое название
- `molecular_weight` (text) - Молекулярная масса
- `molecular_formula` (text) - Молекулярная формула
- `synonyms` (text) - Синонимы
- `research_area` (text) - Область исследования
- `dosage` (text) - Дозировка
- `structural_formula` (text) - URL изображения структурной формулы
- `additional_images` (jsonb, DEFAULT '[]') - Дополнительные изображения

**Индексы:**
- `idx_products_base_price` - По базовой цене
- `idx_products_cas_number` - По CAS номеру
- `idx_products_form` - По форме выпуска
- `idx_products_research_area` - По области исследования

**Ограничения:**
- `check_base_price_positive` - Базовая цена должна быть положительной
- `products_sku_key` - Уникальный артикул

**Политики доступа (RLS):**
- Администраторы могут управлять товарами
- Все пользователи могут просматривать товары

**Триггеры:**
- `update_products_updated_at` - Обновление даты изменения

### Таблица `product_categories`
Хранит информацию о категориях товаров.

**Поля:**
- `id` (text, PK) - Идентификатор категории
- `name` (text, NOT NULL) - Название категории
- `description` (text) - Описание категории
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Политики доступа (RLS):**
- Администраторы могут управлять категориями
- Все пользователи могут просматривать категории

### Таблица `product_tags`
Хранит метки (теги) для товаров.

**Поля:**
- `id` (uuid, PK) - Идентификатор метки
- `name` (text, NOT NULL) - Название метки
- `slug` (text, NOT NULL, UNIQUE) - Slug для URL
- `description` (text) - Описание метки
- `product_count` (integer, DEFAULT 0) - Количество товаров с меткой
- `is_active` (boolean, DEFAULT true) - Активна ли метка
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_product_tags_is_active` - По активности
- `idx_product_tags_product_count` - По количеству товаров (DESC)
- `idx_product_tags_slug` - По slug

**Политики доступа (RLS):**
- Администраторы могут управлять метками
- Все пользователи могут просматривать метки

**Триггеры:**
- `update_product_tags_updated_at` - Обновление даты изменения

### Таблица `product_tags_products`
Связывает теги с продуктами (many-to-many).

**Поля:**
- `id` (uuid, PK) - Идентификатор связи
- `product_id` (text, FK) - Идентификатор товара
- `tag_id` (uuid, FK) - Идентификатор метки
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_product_tags_products_product_id` - По ID товара
- `idx_product_tags_products_tag_id` - По ID метки
- `product_tags_products_product_id_tag_id_key` - Уникальный составной индекс

**Политики доступа (RLS):**
- Администраторы могут управлять связями
- Все пользователи могут просматривать связи

**Триггеры:**
- `product_tag_count_update` - Обновление счетчика товаров в метке

### Таблица `orders`
Хранит информацию о заказах.

**Поля:**
- `id` (uuid, PK) - Идентификатор заказа
- `user_id` (uuid, FK) - Идентификатор пользователя
- `order_number` (text, NOT NULL, UNIQUE) - Номер заказа
- `status` (order_status, DEFAULT 'pending') - Статус заказа
- `total_amount` (numeric(10,2)) - Общая сумма заказа
- `currency` (text, DEFAULT 'RUB') - Валюта заказа
- `customer_name` (text, NOT NULL) - Имя клиента
- `customer_email` (text, NOT NULL) - Email клиента
- `customer_phone` (text) - Телефон клиента
- `delivery_address` (text) - Адрес доставки
- `notes` (text) - Примечания к заказу
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления
- `manager_id` (uuid, FK) - ID менеджера, обрабатывающего заказ
- `approval_date` (timestamptz) - Дата подтверждения заказа
- `manager_notes` (text) - Примечания менеджера
- `delivery_cost` (numeric(10,2), DEFAULT 0) - Стоимость доставки

**Индексы:**
- `idx_orders_created_at` - По дате создания
- `idx_orders_status` - По статусу
- `idx_orders_user_id` - По ID пользователя
- `orders_order_number_key` - Уникальный номер заказа

**Ограничения:**
- `check_delivery_cost_positive` - Стоимость доставки должна быть неотрицательной

**Политики доступа (RLS):**
- Администраторы могут управлять всеми заказами
- Пользователи могут создавать заказы (только свои)
- Пользователи могут читать свои заказы

**Триггеры:**
- `set_order_number_trigger` - Автоматическая генерация номера заказа
- `trigger_order_status_notifications` - Отправка уведомлений при изменении статуса
- `trigger_track_order_status_changes` - Отслеживание изменений статуса заказа
- `update_orders_updated_at` - Обновление даты изменения

### Таблица `order_items`
Хранит элементы заказов.

**Поля:**
- `id` (uuid, PK) - Идентификатор элемента заказа
- `order_id` (uuid, FK) - Идентификатор заказа
- `product_id` (text, FK) - Идентификатор товара
- `product_name` (text, NOT NULL) - Название товара
- `product_sku` (text) - Артикул товара
- `quantity` (integer, DEFAULT 1, NOT NULL) - Количество
- `unit_price` (numeric(10,2)) - Цена за единицу
- `total_price` (numeric(10,2)) - Общая стоимость
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_order_items_order_id` - По ID заказа

**Политики доступа (RLS):**
- Администраторы могут управлять всеми элементами заказов
- Пользователи могут создавать элементы для своих заказов
- Пользователи могут просматривать элементы своих заказов

**Триггеры:**
- `trigger_update_order_item_prices` - Обновление цен элемента заказа
- `trigger_update_order_total` - Обновление общей суммы заказа

### Таблица `order_status_history`
Хранит историю изменений статуса заказа.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `order_id` (uuid, FK, NOT NULL) - Идентификатор заказа
- `old_status` (order_status) - Предыдущий статус
- `new_status` (order_status, NOT NULL) - Новый статус
- `changed_by` (uuid, FK) - Кто изменил статус
- `change_reason` (text) - Причина изменения
- `notes` (text) - Примечания
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_order_status_history_changed_by` - По ID изменившего
- `idx_order_status_history_created_at` - По дате создания
- `idx_order_status_history_order_id` - По ID заказа

**Политики доступа (RLS):**
- Администраторы могут управлять всей историей заказов
- Пользователи могут просматривать историю своих заказов

### Таблица `payment_transactions`
Хранит информацию о платежных транзакциях.

**Поля:**
- `id` (uuid, PK) - Идентификатор транзакции
- `order_id` (uuid, FK) - Идентификатор заказа
- `payment_type` (payment_type, NOT NULL) - Тип платежа
- `status` (payment_status, DEFAULT 'pending') - Статус платежа
- `amount` (numeric(10,2), NOT NULL) - Сумма платежа
- `currency` (text, NOT NULL) - Валюта платежа
- `crypto_address` (text) - Адрес криптовалюты
- `transaction_hash` (text) - Хеш транзакции
- `confirmation_count` (integer, DEFAULT 0) - Количество подтверждений
- `required_confirmations` (integer, DEFAULT 1) - Требуемое количество подтверждений
- `network` (text) - Сеть (для криптовалют)
- `explorer_url` (text) - URL для просмотра транзакции
- `expires_at` (timestamptz) - Дата истечения срока транзакции
- `confirmed_at` (timestamptz) - Дата подтверждения
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_payment_transactions_order_id` - По ID заказа
- `idx_payment_transactions_status` - По статусу
- `idx_payment_transactions_transaction_hash` - По хешу транзакции

**Политики доступа (RLS):**
- Администраторы могут управлять всеми транзакциями
- Пользователи могут создавать транзакции для своих заказов
- Пользователи могут просматривать транзакции своих заказов

**Триггеры:**
- `update_payment_transactions_updated_at` - Обновление даты изменения

### Таблица `payment_addresses`
Хранит адреса для приема платежей.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `type` (payment_type, NOT NULL) - Тип платежа
- `address` (text, NOT NULL) - Адрес для оплаты
- `network` (text, NOT NULL) - Сеть (для криптовалют)
- `confirmations` (integer, DEFAULT 1) - Количество необходимых подтверждений
- `description` (text) - Описание адреса
- `is_active` (boolean, DEFAULT true) - Активен ли адрес
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления
- `exchange_rate` (numeric(20,8), DEFAULT 1.0) - Курс обмена
- `name` (text) - Название метода оплаты

**Индексы:**
- `idx_payment_addresses_active` - По активности
- `idx_payment_addresses_type` - По типу платежа
- `idx_payment_addresses_type_active` - По типу и активности
- `payment_addresses_type_unique` - Уникальный тип платежа

**Политики доступа (RLS):**
- Администраторы могут управлять адресами
- Авторизованные пользователи могут просматривать активные адреса

**Триггеры:**
- `update_payment_addresses_updated_at` - Обновление даты изменения

### Таблица `cart_items`
Хранит товары в корзине пользователя.

**Поля:**
- `id` (uuid, PK) - Идентификатор элемента корзины
- `user_id` (uuid, FK) - Идентификатор пользователя
- `product_id` (text, FK) - Идентификатор товара
- `quantity` (integer, DEFAULT 1) - Количество товара
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `cart_items_user_id_product_id_key` - Уникальная комбинация пользователь-товар

**Ограничения:**
- `cart_items_quantity_check` - Количество должно быть больше 0

**Политики доступа (RLS):**
- Пользователи могут добавлять товары в корзину (только свои)
- Пользователи могут удалять товары из корзины (только свои)
- Пользователи могут обновлять свою корзину (только свои)
- Пользователи могут просматривать свою корзину (только свои)

**Триггеры:**
- `update_cart_items_updated_at` - Обновление даты изменения

### Таблица `favorites`
Хранит избранные товары пользователя.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи избранного
- `user_id` (uuid, FK) - Идентификатор пользователя
- `product_id` (text, FK) - Идентификатор товара
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `favorites_user_id_product_id_key` - Уникальная комбинация пользователь-товар

**Политики доступа (RLS):**
- Пользователи могут добавлять в избранное (только свои)
- Пользователи могут удалять из избранного (только свои)
- Пользователи могут просматривать свои избранные товары (только свои)

### Таблица `feedback`
Хранит обратную связь от пользователей.

**Поля:**
- `id` (uuid, PK) - Идентификатор обратной связи
- `user_id` (uuid, FK) - Идентификатор пользователя
- `name` (text, NOT NULL) - Имя отправителя
- `email` (text, NOT NULL) - Email отправителя
- `subject` (text, NOT NULL) - Тема сообщения
- `message` (text, NOT NULL) - Текст сообщения
- `type` (text, DEFAULT 'general', NOT NULL) - Тип обратной связи
- `product_id` (text, FK) - Идентификатор товара (если обратная связь о товаре)
- `status` (text, DEFAULT 'new', NOT NULL) - Статус обратной связи
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления
- `response` (text) - Ответ на обратную связь
- `responded_at` (timestamptz) - Дата ответа
- `responded_by` (uuid, FK) - Кто ответил

**Индексы:**
- `idx_feedback_created_at` - По дате создания
- `idx_feedback_product_id` - По ID товара
- `idx_feedback_responded_at` - По дате ответа
- `idx_feedback_responded_by` - По ID ответившего
- `idx_feedback_status` - По статусу
- `idx_feedback_type` - По типу
- `idx_feedback_user_id` - По ID пользователя

**Ограничения:**
- `feedback_status_check` - Статус должен быть из списка допустимых
- `feedback_type_check` - Тип должен быть из списка допустимых

**Политики доступа (RLS):**
- Администраторы могут читать всю обратную связь
- Администраторы могут обновлять обратную связь
- Любой пользователь может создать обратную связь
- Пользователи могут читать свою обратную связь (только свои)

**Триггеры:**
- `update_feedback_updated_at` - Обновление даты изменения

### Таблица `services`
Хранит информацию об услугах.

**Поля:**
- `id` (text, PK) - Идентификатор услуги
- `title` (text, NOT NULL) - Название услуги
- `description` (text, NOT NULL) - Описание услуги
- `short_description` (text) - Краткое описание
- `icon` (text) - Иконка услуги
- `image_url` (text) - URL изображения
- `features` (jsonb, DEFAULT '[]') - Особенности услуги
- `additional_info` (text) - Дополнительная информация
- `is_active` (boolean, DEFAULT true) - Активна ли услуга
- `sort_order` (integer, DEFAULT 0) - Порядок сортировки
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_services_sort_order` - По порядку сортировки

**Политики доступа (RLS):**
- Администраторы могут управлять услугами
- Все пользователи могут просматривать активные услуги

**Триггеры:**
- `update_services_updated_at_trigger` - Обновление даты изменения

### Таблица `articles`
Хранит статьи.

**Поля:**
- `id` (uuid, PK) - Идентификатор статьи
- `title` (text, NOT NULL) - Заголовок статьи
- `slug` (text, NOT NULL, UNIQUE) - Slug для URL
- `content` (text, NOT NULL) - Содержание статьи
- `short_description` (text) - Краткое описание
- `image_url` (text) - URL изображения
- `published` (boolean, DEFAULT false) - Опубликована ли статья
- `published_at` (timestamptz, DEFAULT now()) - Дата публикации
- `author_id` (uuid, FK) - Автор статьи
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `articles_slug_key` - Уникальный slug
- `idx_articles_author_id` - По автору
- `idx_articles_published` - По статусу публикации
- `idx_articles_published_at` - По дате публикации
- `idx_articles_slug` - По slug

**Политики доступа (RLS):**
- Администраторы могут управлять статьями
- Все пользователи могут просматривать опубликованные статьи

**Триггеры:**
- `update_articles_updated_at` - Обновление даты изменения

### Таблица `exchange_rates`
Хранит курсы обмена валют.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `symbol` (text, NOT NULL, UNIQUE) - Символ валюты
- `price` (numeric(20,8), NOT NULL) - Цена
- `price_rub` (numeric(15,2)) - Цена в рублях
- `change_24h` (numeric(10,4), DEFAULT 0) - Изменение за 24 часа
- `last_updated` (timestamptz, DEFAULT now()) - Дата последнего обновления
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `exchange_rates_symbol_key` - Уникальный символ
- `idx_exchange_rates_last_updated` - По дате обновления
- `idx_exchange_rates_symbol` - По символу

**Политики доступа (RLS):**
- Администраторы могут управлять курсами
- Все пользователи могут просматривать курсы

### Таблица `exchange_rate_history`
Хранит историю изменения курсов валют.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `symbol` (text, NOT NULL) - Символ валюты
- `price` (numeric(20,8), NOT NULL) - Цена
- `price_rub` (numeric(15,2)) - Цена в рублях
- `change_24h` (numeric(10,4), DEFAULT 0) - Изменение за 24 часа
- `recorded_at` (timestamptz, DEFAULT now()) - Дата записи

**Индексы:**
- `idx_exchange_rate_history_recorded_at` - По дате записи
- `idx_exchange_rate_history_symbol` - По символу

**Политики доступа (RLS):**
- Администраторы могут управлять историей курсов
- Все пользователи могут просматривать историю курсов

### Таблица `push_notifications`
Хранит push-уведомления.

**Поля:**
- `id` (uuid, PK) - Идентификатор уведомления
- `user_id` (uuid, FK) - Идентификатор пользователя
- `title` (text, NOT NULL) - Заголовок уведомления
- `body` (text, NOT NULL) - Текст уведомления
- `type` (text, DEFAULT 'general', NOT NULL) - Тип уведомления
- `data` (jsonb, DEFAULT '{}') - Дополнительные данные
- `order_id` (uuid, FK) - Идентификатор заказа
- `status` (text, DEFAULT 'pending', NOT NULL) - Статус уведомления
- `sent_at` (timestamptz) - Дата отправки
- `delivered_at` (timestamptz) - Дата доставки
- `device_token` (text) - Токен устройства
- `platform` (text) - Платформа
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_push_notifications_created_at` - По дате создания
- `idx_push_notifications_order_id` - По ID заказа
- `idx_push_notifications_status` - По статусу
- `idx_push_notifications_type` - По типу
- `idx_push_notifications_user_id` - По ID пользователя

**Политики доступа (RLS):**
- Администраторы могут управлять всеми уведомлениями
- Пользователи могут читать свои уведомления

**Триггеры:**
- `update_push_notifications_updated_at` - Обновление даты изменения

### Таблица `visitor_analytics`
Хранит аналитику посетителей.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `visitor_id` (text, NOT NULL) - Идентификатор посетителя
- `session_id` (text) - Идентификатор сессии
- `ip_address` (inet) - IP-адрес
- `user_agent` (text) - User Agent браузера
- `referrer` (text) - Источник перехода
- `landing_page` (text) - Посадочная страница
- `country` (text) - Страна
- `city` (text) - Город
- `device_type` (text) - Тип устройства
- `browser` (text) - Браузер
- `os` (text) - Операционная система
- `first_visit` (timestamptz, DEFAULT now()) - Дата первого посещения
- `last_visit` (timestamptz, DEFAULT now()) - Дата последнего посещения
- `total_sessions` (integer, DEFAULT 1) - Общее количество сессий
- `total_page_views` (integer, DEFAULT 1) - Общее количество просмотров страниц
- `is_registered` (boolean, DEFAULT false) - Зарегистрированный пользователь?
- `user_id` (uuid, FK) - Идентификатор пользователя
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_visitor_analytics_created_at` - По дате создания
- `idx_visitor_analytics_user_id` - По ID пользователя
- `idx_visitor_analytics_visitor_id` - По ID посетителя

**Политики доступа (RLS):**
- Администраторы могут управлять аналитикой
- Все пользователи могут добавлять аналитику
- Все пользователи могут обновлять аналитику

**Триггеры:**
- `update_visitor_analytics_updated_at` - Обновление даты изменения

### Таблица `page_views`
Хранит просмотры страниц.

**Поля:**
- `id` (uuid, PK) - Идентификатор просмотра
- `visitor_id` (text, NOT NULL) - Идентификатор посетителя
- `session_id` (text) - Идентификатор сессии
- `page_url` (text, NOT NULL) - URL страницы
- `page_title` (text) - Заголовок страницы
- `referrer` (text) - Источник перехода
- `time_on_page` (integer) - Время на странице
- `is_bounce` (boolean, DEFAULT false) - Отказ?
- `user_id` (uuid, FK) - Идентификатор пользователя
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_page_views_created_at` - По дате создания
- `idx_page_views_page_url` - По URL страницы
- `idx_page_views_visitor_id` - По ID посетителя

**Политики доступа (RLS):**
- Администраторы могут управлять просмотрами
- Все пользователи могут добавлять просмотры

### Таблица `system_settings`
Хранит системные настройки.

**Поля:**
- `id` (uuid, PK) - Идентификатор настройки
- `key` (text, NOT NULL, UNIQUE) - Ключ настройки
- `value` (jsonb, DEFAULT '{}', NOT NULL) - Значение настройки
- `category` (text, DEFAULT 'general', NOT NULL) - Категория настройки
- `type` (text, DEFAULT 'string', NOT NULL) - Тип настройки
- `title` (text, NOT NULL) - Заголовок настройки
- `description` (text) - Описание настройки
- `is_public` (boolean, DEFAULT false) - Публичная настройка?
- `is_readonly` (boolean, DEFAULT false) - Только для чтения?
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_system_settings_category` - По категории
- `idx_system_settings_key` - По ключу
- `system_settings_key_key` - Уникальный ключ

**Политики доступа (RLS):**
- Администраторы могут управлять настройками
- Все пользователи могут просматривать публичные настройки

**Триггеры:**
- `update_system_settings_updated_at` - Обновление даты изменения

### Таблица `user_preferences`
Хранит пользовательские настройки.

**Поля:**
- `id` (uuid, PK) - Идентификатор настройки
- `user_id` (uuid, FK) - Идентификатор пользователя
- `key` (text, NOT NULL) - Ключ настройки
- `value` (jsonb, DEFAULT '{}', NOT NULL) - Значение настройки
- `category` (text, DEFAULT 'appearance', NOT NULL) - Категория настройки
- `created_at` (timestamptz, DEFAULT now()) - Дата создания
- `updated_at` (timestamptz, DEFAULT now()) - Дата обновления

**Индексы:**
- `idx_user_preferences_category` - По категории
- `idx_user_preferences_user_id` - По ID пользователя
- `idx_user_preferences_user_id_key` - По ID пользователя и ключу
- `user_preferences_user_id_key_key` - Уникальная комбинация пользователь-ключ

**Политики доступа (RLS):**
- Администраторы могут просматривать все настройки
- Пользователи могут управлять своими настройками (только свои)

**Триггеры:**
- `update_user_preferences_updated_at` - Обновление даты изменения

### Таблица `parsed_products`
Хранит результаты парсинга товаров.

**Поля:**
- `id` (uuid, PK) - Идентификатор записи
- `product_id` (text, FK) - Идентификатор товара
- `parsed_data` (jsonb, DEFAULT '{}') - Данные парсинга
- `status` (text, DEFAULT 'new') - Статус парсинга
- `needs_moderation` (boolean, DEFAULT true) - Требуется модерация?
- `changes` (jsonb, DEFAULT '{}') - Изменения
- `rejection_reason` (text) - Причина отклонения
- `parsed_at` (timestamptz, DEFAULT now()) - Дата парсинга
- `moderated_at` (timestamptz) - Дата модерации
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_parsed_products_needs_moderation` - По необходимости модерации
- `idx_parsed_products_parsed_at` - По дате парсинга
- `idx_parsed_products_product_id` - По ID товара
- `idx_parsed_products_status` - По статусу

**Политики доступа (RLS):**
- Администраторы могут управлять результатами парсинга

### Таблица `parser_logs`
Хранит логи парсера.

**Поля:**
- `id` (uuid, PK) - Идентификатор лога
- `status` (text, DEFAULT 'running') - Статус парсинга
- `total_products` (integer, DEFAULT 0) - Общее количество товаров
- `added_products` (integer, DEFAULT 0) - Добавлено товаров
- `updated_products` (integer, DEFAULT 0) - Обновлено товаров
- `failed_products` (integer, DEFAULT 0) - Не удалось обработать товаров
- `started_at` (timestamptz, DEFAULT now()) - Дата начала
- `completed_at` (timestamptz) - Дата завершения
- `created_at` (timestamptz, DEFAULT now()) - Дата создания

**Индексы:**
- `idx_parser_logs_started_at` - По дате начала
- `idx_parser_logs_status` - По статусу

**Политики доступа (RLS):**
- Администраторы могут управлять логами парсера

## Представления (Views)

### Представление `orders_with_details`
Предоставляет детальную информацию о заказах с связанными данными пользователя, менеджера и статистикой.

**Поля:**
- Все поля из таблицы `orders`
- `user_name` - Имя пользователя
- `user_email` - Email пользователя
- `manager_name` - Имя менеджера
- `items_count` - Количество товаров в заказе
- `notifications_count` - Количество уведомлений по заказу

### Представление `user_statistics`
Предоставляет статистику по пользователям в разрезе статусов.

**Поля:**
- `status` - Статус пользователя
- `user_count` - Количество пользователей с данным статусом
- `oldest_account` - Дата создания самого старого аккаунта
- `newest_account` - Дата создания самого нового аккаунта
- `last_activity` - Дата последней активности

### Представление `users_security_view`
Предоставляет информацию о безопасности пользовательских аккаунтов.

**Поля:**
- `id` - ID пользователя
- `name` - Имя пользователя
- `email` - Email пользователя
- `status` - Статус пользователя
- `role` - Роль пользователя
- `level` - Уровень пользователя
- `failed_login_attempts` - Количество неудачных попыток входа
- `account_locked` - Заблокирован ли аккаунт
- `last_login` - Время последнего входа
- `security_risk` - Есть ли риск безопасности

## Триггерные функции

### `update_updated_at_column`
Обновляет поле `updated_at` при изменении записи.

### `update_visitor_stats`
Обновляет статистику посетителя.

### `update_product_tag_count`
Обновляет счетчик товаров для тега.

### `update_order_item_prices`
Автоматически заполняет цены товаров в заказе.

### `check_user_bans`
Проверяет наличие активных банов для пользователей.

### `update_feedback_updated_at`
Обновляет дату изменения обратной связи.

### `update_services_updated_at`
Обновляет дату изменения услуг.

### `set_order_number`
Генерирует номер заказа.

### `notify_order_approved`
Отправляет уведомления при подтверждении заказа.

### `handle_new_user`
Обрабатывает регистрацию нового пользователя.

### `update_order_total`
Обновляет общую сумму заказа.

### `track_order_status_changes`
Отслеживает изменения статуса заказа.

## Функции SQL и RPC

### `is_admin()`
Проверяет, является ли текущий пользователь администратором.

### `uid()`
Возвращает UUID текущего пользователя.

### `get_user_order_stats(p_user_id UUID)`
Возвращает статистику по заказам пользователя.

### `get_user_order_growth(p_user_id UUID, p_months INT)`
Возвращает данные о росте заказов пользователя за указанный период.

### `get_unread_notifications(p_user_id UUID)`
Возвращает непрочитанные уведомления пользователя.

### `mark_notification_as_read(p_notification_id UUID, p_user_id UUID)`
Отмечает уведомление как прочитанное.

### `mark_all_notifications_as_read(p_user_id UUID)`
Отмечает все уведомления пользователя как прочитанные.

### `increment_page_views(p_visitor_id TEXT)`
Увеличивает счетчик просмотров страниц для посетителя.

### `update_page_view_time(p_visitor_id TEXT, p_session_id TEXT, p_page_url TEXT, p_time_on_page INTEGER)`
Обновляет время, проведенное на странице.

## Политики безопасности RLS

### Общие политики
- Все таблицы с персональными данными имеют включенную политику RLS
- Пользователи могут просматривать и изменять только свои данные
- Администраторы имеют полный доступ ко всем таблицам
- Публичные данные (товары, категории, статьи) доступны всем для чтения

### Политики для заказов
- Пользователи могут просматривать только свои заказы
- Пользователи могут создавать только свои заказы
- Администраторы могут просматривать и редактировать все заказы

### Политики для платежей
- Пользователи могут просматривать и создавать транзакции только для своих заказов
- Администраторы имеют полный доступ ко всем транзакциям

### Политики для корзины и избранного
- Пользователи могут управлять только своими данными в корзине
- Пользователи могут управлять только своими избранными товарами

## Индексы

Для оптимизации запросов созданы индексы:
- По внешним ключам (FKs)
- По полям фильтрации и сортировки (статусы, даты)
- По уникальным идентификаторам
- По полям поиска (slug, email, name)

## Масштабирование и производительность

- Вертикальное и горизонтальное масштабирование через настройки Supabase
- Денормализация данных для оптимизации чтения (примеры: копирование имени товара в элементы заказа)
- Использование материализованных представлений для агрегированных данных
- Правильно настроенные индексы для оптимизации запросов

## Хранилище файлов (Storage)

### Бакет `user-avatars`
Хранит аватары пользователей.

**Политики доступа:**
- Пользователи могут загружать аватары только в свою папку
- Пользователи могут обновлять только свои файлы
- Пользователи могут удалять только свои файлы
- Публичный доступ на чтение всех аватаров
- Администраторы имеют полный доступ ко всем аватарам

### Бакет `product-images`
Хранит изображения товаров.

**Политики доступа:**
- Публичный доступ на чтение всех изображений товаров
- Только администраторы могут загружать, обновлять и удалять изображения товаров

## Edge Functions

### Функция `calculate-delivery`
Расчет стоимости доставки CDEK.

**Endpoints:**
- `GET /regions` - Получение статистики по всем федеральным округам
- `GET /district` - Получение городов федерального округа
- `GET /city-search` - Поиск города с подсказками
- `GET /test` - Тестирование калькулятора
- `POST /` - Расчет доставки