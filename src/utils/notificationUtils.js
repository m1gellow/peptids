/**
 * Утилиты для работы с пуш-уведомлениями
 */

import React from 'react';
import WebApp from '@twa-dev/sdk';
import supabase from '../lib/supabase';


/**
 * Класс для управления уведомлениями
 */
export class NotificationManager {
  constructor() {
    this.listeners = new Map();
    this.isInitialized = false;
    this.subscription = null;
  }

  /**
   * Инициализация системы уведомлений
   */
  async initialize(userId) {
    if (this.isInitialized) return;

    try {
      // Подписываемся на real-time уведомления
      this.subscription = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'push_notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleNewNotification(payload.new);
          }
        )
        .subscribe();

      this.isInitialized = true;
      console.log('Система уведомлений инициализирована');
    } catch (error) {
      console.error('Ошибка инициализации уведомлений:', error);
    }
  }

  /**
   * Обработка нового уведомления
   */
  handleNewNotification(notification) {
    console.log('Новое уведомление:', notification);

    // Показываем уведомление в Telegram
    this.showTelegramNotification(notification);

    // Вызываем слушатели
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Ошибка в слушателе уведомлений:', error);
      }
    });
  }

  /**
   * Показ уведомления в Telegram
   */
  showTelegramNotification(notification) {
    try {
      if (WebApp && WebApp.showPopup) {
        WebApp.showPopup({
          title: notification.title,
          message: notification.body,
          buttons: [
            {
              id: 'view',
              type: 'default',
              text: 'Посмотреть'
            },
            {
              id: 'close',
              type: 'cancel',
              text: 'Закрыть'
            }
          ]
        }, (buttonId) => {
          if (buttonId === 'view' && notification.data?.action) {
            this.handleNotificationAction(notification);
          }
        });
      } else {
        // Fallback для браузера
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Ошибка показа уведомления:', error);
    }
  }

  /**
   * Обработка действий уведомления
   */
  handleNotificationAction(notification) {
    const action = notification.data?.action;
    
    switch (action) {
      case 'open_payment':
        // Открываем страницу оплаты заказа
        if (notification.order_id) {
          window.location.href = `/payment/${notification.order_id}`;
        }
        break;
      case 'open_order':
        // Открываем детали заказа
        if (notification.order_id) {
          window.location.href = `/profile?tab=orders&order=${notification.order_id}`;
        }
        break;
      default:
        // По умолчанию открываем профиль
        window.location.href = '/profile?tab=notifications';
    }
  }

  /**
   * Добавление слушателя уведомлений
   */
  addListener(id, callback) {
    this.listeners.set(id, callback);
  }

  /**
   * Удаление слушателя уведомлений
   */
  removeListener(id) {
    this.listeners.delete(id);
  }

  /**
   * Получение непрочитанных уведомлений
   */
  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase.rpc('get_unread_notifications', {
        p_user_id: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Ошибка получения уведомлений:', error);
      return [];
    }
  }

  /**
   * Отметка уведомления как прочитанного
   */
  async markAsRead(notificationId, userId) {
    try {
      const { data, error } = await supabase.rpc('mark_notification_as_read', {
        p_notification_id: notificationId,
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка отметки уведомления как прочитанного:', error);
      return false;
    }
  }

  /**
   * Отметка всех уведомлений как прочитанных
   */
  async markAllAsRead(userId) {
    try {
      const { data, error } = await supabase.rpc('mark_all_notifications_as_read', {
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений как прочитанных:', error);
      return 0;
    }
  }

  /**
   * Отписка от уведомлений
   */
  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }

  /**
   * Запрос разрешения на уведомления (для браузера)
   */
  async requestPermission() {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Ошибка запроса разрешения на уведомления:', error);
      return false;
    }
  }
}

// Создаем глобальный экземпляр
export const notificationManager = new NotificationManager();

/**
 * Хук для использования уведомлений в React компонентах
 */
export const useNotifications = (userId) => {
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  // Инициализация
  React.useEffect(() => {
    if (userId) {
      notificationManager.initialize(userId);
      loadNotifications();
    }

    return () => {
      notificationManager.removeListener('react-hook');
    };
  }, [userId]);

  // Слушатель новых уведомлений
  React.useEffect(() => {
    const handleNewNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    notificationManager.addListener('react-hook', handleNewNotification);

    return () => {
      notificationManager.removeListener('react-hook');
    };
  }, []);

  // Загрузка уведомлений
  const loadNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await notificationManager.getUnreadNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.length);
    } catch (error) {
      console.error('Ошибка загрузки уведомлений:', error);
    } finally {
      setLoading(false);
    }
  };

  // Отметка как прочитанного
  const markAsRead = async (notificationId) => {
    try {
      await notificationManager.markAsRead(notificationId, userId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Ошибка отметки уведомления:', error);
    }
  };

  // Отметка всех как прочитанных
  const markAllAsRead = async () => {
    try {
      const count = await notificationManager.markAllAsRead(userId);
      setNotifications([]);
      setUnreadCount(0);
      return count;
    } catch (error) {
      console.error('Ошибка отметки всех уведомлений:', error);
      return 0;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    reload: loadNotifications
  };
};