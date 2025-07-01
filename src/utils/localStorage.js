/**
 * Утилиты для работы с localStorage
 */

// Префикс для всех ключей localStorage
const STORAGE_PREFIX = 'russianpeptide_';

/**
 * Безопасное получение данных из localStorage
 * @param {string} key - Ключ для получения данных
 * @param {any} defaultValue - Значение по умолчанию
 * @returns {any} - Значение из localStorage или значение по умолчанию
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Ошибка при чтении из localStorage (${key}):`, error);
    return defaultValue;
  }
};

/**
 * Безопасное сохранение данных в localStorage
 * @param {string} key - Ключ для сохранения данных
 * @param {any} value - Значение для сохранения
 * @returns {boolean} - true если сохранение прошло успешно
 */
export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Ошибка при записи в localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Удаление данных из localStorage
 * @param {string} key - Ключ для удаления
 * @returns {boolean} - true если удаление прошло успешно
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch (error) {
    console.warn(`Ошибка при удалении из localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Очистка всех данных приложения из localStorage
 */
export const clearAppStorage = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.warn('Ошибка при очистке localStorage:', error);
    return false;
  }
};

/**
 * Проверка доступности localStorage
 * @returns {boolean} - true если localStorage доступен
 */
export const isStorageAvailable = () => {
  try {
    const testKey = `${STORAGE_PREFIX}test`;
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Получение всех ключей приложения из localStorage
 * @returns {Array<string>} - Массив ключей
 */
export const getAppStorageKeys = () => {
  try {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .map(key => key.replace(STORAGE_PREFIX, ''));
  } catch (error) {
    console.warn('Ошибка при получении ключей localStorage:', error);
    return [];
  }
};

/**
 * Константы для ключей localStorage
 */
export const STORAGE_KEYS = {
  USER_CONSENT: 'user_consent',
  CONSENT_TIMESTAMP: 'consent_timestamp',
  USER_PREFERENCES: 'user_preferences',
  CART_DATA: 'cart_data',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites',
  THEME_SETTINGS: 'theme_settings',
  LANGUAGE: 'language',
  VISITED_PAGES: 'visited_pages',
  LAST_ACTIVITY: 'last_activity'
};

/**
 * Проверка истечения срока данных
 * @param {number} timestamp - Временная метка
 * @param {number} expirationDays - Количество дней до истечения
 * @returns {boolean} - true если данные истекли
 */
export const isExpired = (timestamp, expirationDays = 30) => {
  if (!timestamp) return true;
  
  const now = Date.now();
  const expirationTime = expirationDays * 24 * 60 * 60 * 1000; // дни в миллисекундах
  
  return (now - timestamp) > expirationTime;
};

/**
 * Сохранение пользовательских настроек
 * @param {Object} preferences - Объект с настройками
 */
export const saveUserPreferences = (preferences) => {
  const currentPrefs = getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {});
  const updatedPrefs = {
    ...currentPrefs,
    ...preferences,
    lastUpdated: Date.now()
  };
  
  return setToStorage(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
};

/**
 * Получение пользовательских настроек
 * @returns {Object} - Объект с настройками
 */
export const getUserPreferences = () => {
  return getFromStorage(STORAGE_KEYS.USER_PREFERENCES, {
    theme: 'light',
    language: 'ru',
    notifications: true,
    analyticsConsent: false
  });
};

/**
 * Сохранение согласия пользователя
 * @param {Object} consent - Объект с согласиями
 */
export const saveUserConsent = (consent) => {
  const consentData = {
    ...consent,
    timestamp: Date.now(),
    version: '1.0'
  };
  
  setToStorage(STORAGE_KEYS.USER_CONSENT, consentData);
  setToStorage(STORAGE_KEYS.CONSENT_TIMESTAMP, Date.now());
  
  return consentData;
};

/**
 * Получение согласия пользователя
 * @returns {Object|null} - Объект с согласиями или null
 */
export const getUserConsent = () => {
  const consent = getFromStorage(STORAGE_KEYS.USER_CONSENT);
  const timestamp = getFromStorage(STORAGE_KEYS.CONSENT_TIMESTAMP);
  
  if (!consent || !timestamp) {
    return null;
  }
  
  // Проверяем, не истекло ли согласие (30 дней)
  if (isExpired(timestamp, 30)) {
    removeFromStorage(STORAGE_KEYS.USER_CONSENT);
    removeFromStorage(STORAGE_KEYS.CONSENT_TIMESTAMP);
    return null;
  }
  
  return consent;
};

/**
 * Сохранение последних поисковых запросов
 * @param {string} query - Поисковый запрос
 * @param {number} maxQueries - Максимальное количество сохраняемых запросов
 */
export const saveRecentSearch = (query, maxQueries = 10) => {
  if (!query || query.trim().length < 2) return;
  
  const recentSearches = getFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
  const normalizedQuery = query.trim().toLowerCase();
  
  // Удаляем дубликаты
  const filteredSearches = recentSearches.filter(
    search => search.toLowerCase() !== normalizedQuery
  );
  
  // Добавляем новый запрос в начало
  const updatedSearches = [query.trim(), ...filteredSearches].slice(0, maxQueries);
  
  setToStorage(STORAGE_KEYS.RECENT_SEARCHES, updatedSearches);
};

/**
 * Получение последних поисковых запросов
 * @returns {Array<string>} - Массив поисковых запросов
 */
export const getRecentSearches = () => {
  return getFromStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
};

/**
 * Очистка последних поисковых запросов
 */
export const clearRecentSearches = () => {
  return removeFromStorage(STORAGE_KEYS.RECENT_SEARCHES);
};