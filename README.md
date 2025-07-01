# Russian Peptide Mini App - Telegram Web App

Это мини-приложение Telegram для компании "Рашн Пептаид", специализирующейся на разработке и производстве пептидов и биоактивных соединений.

## Технологии

- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **API**: Supabase API, Telegram Web App API
- **Deployment**: Netlify

## Структура проекта

```
/
├── public/             # Статические файлы
├── src/                # Исходный код приложения
│   ├── components/     # React компоненты
│   │   ├── auth/       # Компоненты авторизации
│   │   ├── catalog/    # Компоненты каталога товаров
│   │   ├── feedback/   # Компоненты обратной связи
│   │   ├── home/       # Компоненты главной страницы
│   │   ├── layout/     # Компоненты верстки (header, footer, etc.)
│   │   ├── orders/     # Компоненты для заказов
│   │   └── ui/         # Переиспользуемые UI компоненты
│   ├── contexts/       # React контексты (корзина, авторизация)
│   ├── data/           # Статические данные
│   ├── hooks/          # Пользовательские React хуки
│   ├── pages/          # Компоненты страниц
│   ├── types/          # TypeScript типы
│   ├── utils/          # Вспомогательные функции
│   ├── App.jsx         # Главный компонент приложения
│   ├── index.css       # Глобальные стили
│   └── main.jsx        # Точка входа
├── supabase/           # Файлы для Supabase
│   ├── functions/      # Edge Functions
│   └── migrations/     # Миграции базы данных
├── .env                # Переменные окружения (игнорируются git)
├── .env.example        # Пример переменных окружения
├── index.html          # HTML шаблон
├── jsconfig.json       # Конфигурация JavaScript
├── package.json        # Зависимости и скрипты
├── postcss.config.js   # Конфигурация PostCSS
├── tailwind.config.js  # Конфигурация Tailwind CSS
└── vite.config.js      # Конфигурация Vite
```

## Основные зависимости

### Основные
- `react`: ^18.2.0 - Библиотека React
- `react-dom`: ^18.2.0 - DOM привязка для React
- `react-router-dom`: ^6.22.1 - Маршрутизация для React
- `@twa-dev/sdk`: ^6.9.2 - SDK для Telegram Web App
- `@supabase/supabase-js`: ^2.39.3 - Клиент Supabase для работы с бэкендом

### UI и Анимации
- `framer-motion`: ^11.0.5 - Библиотека для анимаций
- `react-icons`: ^5.0.1 - Иконки для React компонентов
- `react-markdown`: ^8.0.7 - Рендеринг Markdown
- `tailwindcss`: ^3.4.1 - Утилитарный CSS-фреймворк

### Утилиты
- `uuid`: ^9.0.1 - Генерация UUID

### Разработка
- `@vitejs/plugin-react`: ^4.2.1 - Плагин React для Vite
- `vite`: ^5.0.8 - Сборщик и сервер разработки
- `terser`: ^5.27.0 - Минификатор JavaScript
- `eslint`: ^8.55.0 - Линтер JavaScript

## Установка и запуск

1. Клонирование репозитория:
   ```bash
   git clone <репозиторий>
   cd russian-peptide-mini-app
   ```

2. Установка зависимостей:
   ```bash
   npm install
   ```

3. Настройка переменных окружения:
   ```bash
   cp .env.example .env
   # Заполните значения в .env
   ```

4. Запуск режима разработки:
   ```bash
   npm run dev
   ```

5. Сборка для продакшена:
   ```bash
   npm run build
   ```

6. Предпросмотр продакшен-сборки:
   ```bash
   npm run preview
   ```

## Деплой

Приложение настроено для деплоя на Netlify. Файл `netlify.toml` содержит необходимые настройки.

## Telegram Bot

Для работы с приложением необходимо создать бота в BotFather и настроить его:

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Включите возможность inline-режима для бота
3. Настройте меню команд
4. Получите токен бота и настройте Webhook

## Контакты

Для вопросов и предложений: 
- Email: zakaz@russianpeptide.com
- Telegram: [@russianpeptide](https://t.me/russianpeptide)