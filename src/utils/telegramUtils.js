import WebApp from '@twa-dev/sdk';

/**
 * Проверка, поддерживает ли текущая версия WebApp определённую функциональность
 * @param {string} minVersion - Минимальная версия для поддержки
 */
const isVersionAtLeast = (minVersion) => {
  try {
    if (!WebApp || !WebApp.version) {
      return false;
    }
    
    const currentVersion = WebApp.version;
    const current = currentVersion.split('.').map(Number);
    const required = minVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(current.length, required.length); i++) {
      const curr = current[i] || 0;
      const req = required[i] || 0;
      
      if (curr > req) return true;
      if (curr < req) return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Ошибка проверки версии WebApp:', error);
    return false;
  }
};

/**
 * Безопасный вызов Telegram WebApp.showPopup с fallback
 * @param {Object} popupParams - Параметры для popup
 * @param {Function} callback - Функция обратного вызова
 */
export const showTelegramPopup = (popupParams, callback) => {
  try {
    // Проверяем, доступен ли метод showPopup и поддерживается ли версией
    if (WebApp && 
        typeof WebApp.showPopup === 'function' && 
        isVersionAtLeast('6.1')) {
      WebApp.showPopup(popupParams, callback);
    } else {
      // Fallback на стандартный alert браузера
      const message = popupParams.title 
        ? `${popupParams.title}\n\n${popupParams.message}`
        : popupParams.message;
      
      alert(message);
      
      // Если есть callback, вызываем его с 'ok'
      if (callback) {
        callback('ok');
      }
    }
  } catch (error) {
    console.warn('WebApp.showPopup не поддерживается:', error.message);
    
    // Fallback на стандартный alert браузера
    const message = popupParams.title 
      ? `${popupParams.title}\n\n${popupParams.message}`
      : popupParams.message;
    
    alert(message);
    
    // Если есть callback, вызываем его с 'ok'
    if (callback) {
      callback('ok');
    }
  }
};

/**
 * Безопасная проверка доступности Telegram WebApp
 */
export const isTelegramWebApp = () => {
  try {
    return WebApp && WebApp.initData;
  } catch (error) {
    return false;
  }
};

/**
 * Получение данных пользователя из Telegram
 */
export const getTelegramUser = () => {
  try {
    if (isTelegramWebApp()) {
      return WebApp.initDataUnsafe?.user || null;
    }
    return null;
  } catch (error) {
    console.warn('Ошибка получения данных пользователя Telegram:', error);
    return null;
  }
};

/**
 * Показать уведомление (с fallback на alert)
 */
export const showNotification = (message, title = 'Уведомление') => {
  showTelegramPopup({
    title,
    message,
    buttons: [
      {
        id: 'ok',
        type: 'ok',
        text: 'OK'
      }
    ]
  });
};

/**
 * Показать подтверждение (с fallback на confirm)
 */
export const showConfirmation = (message, title = 'Подтверждение', callback) => {
  try {
    if (WebApp && 
        typeof WebApp.showPopup === 'function' && 
        isVersionAtLeast('6.1')) {
      WebApp.showPopup({
        title,
        message,
        buttons: [
          {
            id: 'ok',
            type: 'ok',
            text: 'Да'
          },
          {
            id: 'cancel',
            type: 'cancel',
            text: 'Отмена'
          }
        ]
      }, callback);
    } else {
      // Fallback на стандартный confirm браузера
      const confirmMessage = title ? `${title}\n\n${message}` : message;
      const result = confirm(confirmMessage);
      if (callback) {
        callback(result ? 'ok' : 'cancel');
      }
    }
  } catch (error) {
    // Fallback на стандартный confirm браузера
    const confirmMessage = title ? `${title}\n\n${message}` : message;
    const result = confirm(confirmMessage);
    if (callback) {
      callback(result ? 'ok' : 'cancel');
    }
  }
};