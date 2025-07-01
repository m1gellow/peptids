import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import supabase from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Константы для хранения идентификаторов в localStorage
const STORAGE_KEYS = {
  VISITOR_ID: 'rp_visitor_id',
  SESSION_ID: 'rp_session_id',
  SESSION_START: 'rp_session_start',
  LAST_ACTIVITY: 'rp_last_activity',
};

// Время сессии в миллисекундах (30 минут)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Получает информацию о браузере и операционной системе
 */
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'Desktop';

  // Определение браузера
  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    browser = 'Safari';
  }

  // Определение ОС
  if (userAgent.indexOf('Windows') > -1) {
    os = 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    os = 'MacOS';
  } else if (userAgent.indexOf('Android') > -1) {
    os = 'Android';
  } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    os = 'iOS';
  }

  // Определение типа устройства
  if (userAgent.indexOf('Mobi') > -1) {
    deviceType = 'Mobile';
  } else if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) {
    deviceType = 'Tablet';
  }

  return { browser, os, deviceType };
};

/**
 * Получает или генерирует идентификатор посетителя
 */
const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
  
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, visitorId);
  }
  
  return visitorId;
};

/**
 * Получает или генерирует идентификатор сессии
 */
const getOrCreateSessionId = (): string => {
  let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
  const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
  
  // Проверяем, нужно ли создать новую сессию
  const needNewSession = !sessionId || !lastActivity || 
    (Date.now() - parseInt(lastActivity)) > SESSION_TIMEOUT;
  
  if (needNewSession) {
    sessionId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
  }
  
  // Обновляем время последней активности
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  
  return sessionId;
};

/**
 * Хук для отслеживания аналитики посетителей - упрощенная версия, убирающая проблемы с deadlock
 */
const useAnalyticsTracker = (currentUser: any = null) => {
  const location = useLocation();
  const [visitorId, setVisitorId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const pageStartTime = useRef<number>(Date.now());
  const previousPath = useRef<string>('');
  const analyticsDisabled = useRef<boolean>(false);

  // Инициализация трекера при загрузке
  useEffect(() => {
    // Отключаем аналитику, если возникли ошибки
    if (analyticsDisabled.current) return;

    const initTracker = async () => {
      if (isInitialized) return;

      try {
        const vid = getOrCreateVisitorId();
        const sid = getOrCreateSessionId();
        
        setVisitorId(vid);
        setSessionId(sid);
        setIsInitialized(true);
        
        // Запоминаем текущий путь
        previousPath.current = location.pathname;
      } catch (error) {
        console.error('Ошибка инициализации аналитики:', error);
        analyticsDisabled.current = true;
      }
    };

    initTracker();
  }, []);

  // Отслеживание изменения страницы - упрощенная версия
  useEffect(() => {
    if (isInitialized && location.pathname !== previousPath.current && !analyticsDisabled.current) {
      // Просто обновляем предыдущий путь, не отправляем данных в базу
      previousPath.current = location.pathname;
      
      // Сбрасываем таймер для новой страницы
      pageStartTime.current = Date.now();
    }
  }, [location, isInitialized]);

  return { visitorId, sessionId, isInitialized };
};

export default useAnalyticsTracker;