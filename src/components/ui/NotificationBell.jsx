import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiX, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useNotifications } from '../../utils/notificationUtils';
import Button from './Button';

const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications(userId);

  // Иконка типа уведомления
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_approved':
      case 'order_status_changed':
        return <FiShoppingBag size={16} className="text-primary" />;
      default:
        return <FiBell size={16} className="text-primary" />;
    }
  };

  // Форматирование времени
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes}м назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}ч назад`;
    return date.toLocaleDateString('ru-RU');
  };

  // Обработка клика по уведомлению
  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    setIsOpen(false);
    
    // Выполняем действие уведомления
    if (notification.data?.action === 'open_payment' && notification.order_id) {
      window.location.href = `/payment/${notification.order_id}`;
    } else if (notification.order_id) {
      window.location.href = `/profile?tab=orders&order=${notification.order_id}`;
    }
  };

  // Отметить все как прочитанные
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsOpen(false); // Закрываем панель после отметки всех уведомлений
  };

  // Закрытие меню
  const closeMenu = () => {
    setIsOpen(false);
  };

  if (!userId) return null;

  return (
    <div className="relative">
      {/* Кнопка уведомлений */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:text-primary transition-colors hover:bg-primary-bg/30"
      >
        <FiBell size={20} />
        
        {/* Счетчик непрочитанных */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Уведомления */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Оверлей для закрытия */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 md:bg-transparent"
              onClick={closeMenu}
            />
            
            {/* Панель уведомлений */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-2 sm:inset-4 md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 bg-white rounded-lg shadow-xl border border-divider z-50 flex flex-col max-h-[95vh] md:max-h-96"
            >
              {/* Header */}
              <div className="p-4 border-b border-divider bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between">
                  {/* Кнопка назад на мобильных */}
                  <div className="flex items-center">
                    <button
                      onClick={closeMenu}
                      className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:text-text hover:bg-gray-200 transition-colors mr-2"
                    >
                      <FiArrowLeft size={16} />
                    </button>
                    
                    <h3 className="font-semibold text-text text-base sm:text-lg">
                      Уведомления {unreadCount > 0 && `(${unreadCount})`}
                    </h3>
                  </div>
                  
                  {/* Кнопка "отметить все" */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs sm:text-sm text-primary hover:text-primary-light font-medium"
                    >
                      Отметить все
                    </button>
                  )}

                  {/* Кнопка закрытия на десктопе */}
                  <button
                    onClick={closeMenu}
                    className="hidden md:flex w-6 h-6 rounded-full items-center justify-center text-text-secondary hover:text-text hover:bg-gray-200 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>

              {/* Список уведомлений */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-divider">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-primary-bg flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base text-text mb-1 line-clamp-1">
                              {notification.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-text-secondary mb-2 line-clamp-2 leading-relaxed">
                              {notification.body}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs text-text-secondary">
                                {formatTime(notification.created_at)}
                              </span>
                              {notification.data?.order_number && (
                                <span className="text-xs bg-primary-bg text-primary px-2 py-1 rounded-full font-medium">
                                  {notification.data.order_number}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 hover:text-text transition-colors"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <FiBell size={24} className="text-text-secondary" />
                    </div>
                    <h4 className="font-medium text-text mb-1">Нет уведомлений</h4>
                    <p className="text-text-secondary text-sm">
                      Здесь появятся важные уведомления
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 sm:p-4 border-t border-divider bg-gray-50 flex-shrink-0">
                  <Button
                    variant="text"
                    size="sm"
                    fullWidth
                    to="/profile?tab=notifications"
                    onClick={closeMenu}
                    className="text-center"
                  >
                    Все уведомления
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;