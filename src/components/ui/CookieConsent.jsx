import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShield, FiUser, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import { MdCookie } from 'react-icons/md';
import Button from './Button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [agreements, setAgreements] = useState({
    cookies: false,
    personalData: false,
    ageConfirmation: false
  });

  // Ключи для localStorage
  const STORAGE_KEYS = {
    consent: 'russianpeptide_user_consent',
    timestamp: 'russianpeptide_consent_timestamp'
  };

  // Проверяем при загрузке компонента
  useEffect(() => {
    const checkConsent = () => {
      const savedConsent = localStorage.getItem(STORAGE_KEYS.consent);
      const consentTimestamp = localStorage.getItem(STORAGE_KEYS.timestamp);
      
      if (!savedConsent || !consentTimestamp) {
        // Если согласие не найдено - показываем модалку
        setTimeout(() => setIsVisible(true), 1000); // Небольшая задержка
        return;
      }

      try {
        const consent = JSON.parse(savedConsent);
        const timestamp = parseInt(consentTimestamp);
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000; // 30 дней в миллисекундах

        // Проверяем, не истекло ли согласие (30 дней)
        if (now - timestamp > thirtyDays) {
          localStorage.removeItem(STORAGE_KEYS.consent);
          localStorage.removeItem(STORAGE_KEYS.timestamp);
          setTimeout(() => setIsVisible(true), 1000);
          return;
        }

        // Проверяем полноту согласия
        if (!consent.cookies || !consent.personalData || !consent.ageConfirmation) {
          setTimeout(() => setIsVisible(true), 1000);
        }
      } catch (error) {
        console.error('Ошибка при проверке согласия:', error);
        localStorage.removeItem(STORAGE_KEYS.consent);
        localStorage.removeItem(STORAGE_KEYS.timestamp);
        setTimeout(() => setIsVisible(true), 1000);
      }
    };

    checkConsent();
  }, []);

  // Обработка изменения чекбоксов
  const handleAgreementChange = (type) => {
    setAgreements(prev => {
      const newAgreements = {
        ...prev,
        [type]: !prev[type]
      };
      console.log(`Изменение согласия ${type}:`, newAgreements[type]);
      console.log('Все согласия:', newAgreements);
      return newAgreements;
    });
  };

  // Сохранение согласия
  const saveConsent = () => {
    const consentData = {
      ...agreements,
      timestamp: Date.now(),
      version: '1.0'
    };

    localStorage.setItem(STORAGE_KEYS.consent, JSON.stringify(consentData));
    localStorage.setItem(STORAGE_KEYS.timestamp, Date.now().toString());
    
    console.log('Согласие сохранено:', consentData);
    setIsVisible(false);
  };

  // Отклонение согласия (перенаправление на другой сайт или показ предупреждения)
  const handleDecline = () => {
    alert('Для использования сайта необходимо принять условия обработки данных.');
  };

  // Переход между шагами
  const nextStep = () => {
    console.log('Переход на следующий шаг. Текущий:', currentStep, 'Согласия:', agreements);
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3) {
      // На последнем шаге - сохраняем согласие
      saveConsent();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Проверка возможности продолжения для каждого шага
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return agreements.cookies;
      case 2:
        return agreements.personalData;
      case 3:
        return agreements.ageConfirmation;
      default:
        return false;
    }
  };

  // Проверка возможности завершения (все согласия)
  const canComplete = () => {
    return agreements.cookies && agreements.personalData && agreements.ageConfirmation;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-2 sm:p-4">
        <motion.div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-4 sm:p-6 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                {currentStep === 1 && <MdCookie size={20} className="mr-2 sm:mr-3 flex-shrink-0" />}
                {currentStep === 2 && <FiShield size={20} className="mr-2 sm:mr-3 flex-shrink-0" />}
                {currentStep === 3 && <FiUser size={20} className="mr-2 sm:mr-3 flex-shrink-0" />}
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {currentStep === 1 && 'Cookie'}
                  {currentStep === 2 && 'Данные'}
                  {currentStep === 3 && 'Возраст'}
                </h2>
              </div>
              <div className="text-sm opacity-75 flex-shrink-0 ml-2">
                {currentStep}/3
              </div>
            </div>
            
            {/* Прогресс бар */}
            <div className="mt-3 sm:mt-4 bg-white/20 rounded-full h-2">
              <motion.div 
                className="bg-white rounded-full h-2"
                initial={{ width: '33%' }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Content - с прокруткой */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                {/* Шаг 1: Cookie */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-bg rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <MdCookie size={24} className="sm:text-3xl text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-text">
                        Мы используем cookie
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Наш сайт использует файлы cookie для улучшения пользовательского опыта, 
                        аналитики и функциональности.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="font-medium mb-2 text-text text-sm">Типы cookie:</h4>
                      <ul className="text-xs sm:text-sm text-text-secondary space-y-1">
                        <li>• <strong>Необходимые:</strong> для работы сайта</li>
                        <li>• <strong>Функциональные:</strong> для настроек</li>
                        <li>• <strong>Аналитические:</strong> для улучшения</li>
                      </ul>
                    </div>

                    <label className="flex items-start cursor-pointer p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-primary/20">
                      <input
                        type="checkbox"
                        checked={agreements.cookies}
                        onChange={() => handleAgreementChange('cookies')}
                        className="mt-1 mr-3 w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 flex-shrink-0"
                      />
                      <span className="text-sm text-text">
                        Я согласен на использование cookie-файлов
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* Шаг 2: Персональные данные */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-bg rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiShield size={24} className="sm:text-3xl text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-text">
                        Обработка данных
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Для предоставления услуг нам необходимо обрабатывать ваши персональные данные 
                        в соответствии с законодательством РФ.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="font-medium mb-2 text-text text-sm">Данные:</h4>
                      <ul className="text-xs sm:text-sm text-text-secondary space-y-1">
                        <li>• Имя и контакты</li>
                        <li>• Данные заказов</li>
                        <li>• Информация об использовании</li>
                      </ul>
                    </div>

                    <label className="flex items-start cursor-pointer p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-primary/20">
                      <input
                        type="checkbox"
                        checked={agreements.personalData}
                        onChange={() => handleAgreementChange('personalData')}
                        className="mt-1 mr-3 w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 flex-shrink-0"
                      />
                      <span className="text-sm text-text">
                        Согласие на обработку данных согласно 
                        <a href="/privacy" className="text-primary hover:text-primary-light ml-1" target="_blank">
                          Политике
                        </a>
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* Шаг 3: Возраст */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-bg rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <FiUser size={24} className="sm:text-3xl text-primary" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 text-text">
                        Подтверждение возраста
                      </h3>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        Продукты предназначены для исследований и лиц старше 18 лет.
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-sm text-yellow-800 font-medium mb-2">
                        ⚠️ Важно
                      </p>
                      <p className="text-xs sm:text-sm text-yellow-700">
                        Пептиды только для научных исследований, не для употребления.
                      </p>
                    </div>

                    {/* Полный текст подтверждения из изображения */}
                    <div className="bg-primary-bg border border-primary/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <p className="text-xs sm:text-sm text-primary-dark leading-relaxed">
                        Мне уже есть полных 18 лет. Я квалифицированный специалист. Я согласен с тем, что материал, представленный на этом сайте, для профессионального использования. Я согласен с тем, что Образцы, приобретенные на этом сайте, для исследовательских целей, и не будут использоваться для человека или животного.
                      </p>
                    </div>

                    <label className="flex items-start cursor-pointer p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-primary/20">
                      <input
                        type="checkbox"
                        checked={agreements.ageConfirmation}
                        onChange={() => handleAgreementChange('ageConfirmation')}
                        className="mt-1 mr-3 w-4 h-4 sm:w-5 sm:h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2 flex-shrink-0"
                      />
                      <span className="text-sm text-text">
                        Мне 18+ лет, я квалифицированный специалист, понимаю назначение продукции
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer - кнопки навигации */}
          <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex justify-between items-center gap-2">
              <div className="flex space-x-2">
                {currentStep > 1 && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={prevStep}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    Назад
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="text"
                  size="sm"
                  onClick={handleDecline}
                  className="text-text-secondary hover:text-error text-xs sm:text-sm px-2 sm:px-3"
                >
                  Отклонить
                </Button>

                {currentStep < 3 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    icon={<FiArrowRight size={14} />}
                    iconPosition="right"
                    className={`${canProceed() ? 'animate-pulse' : ''} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
                  >
                    Далее
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    icon={<FiCheck size={14} />}
                    className={`${canProceed() ? 'animate-pulse' : ''} text-xs sm:text-sm px-3 sm:px-4 whitespace-nowrap`}
                  >
                    Принять
                  </Button>
                )}
              </div>
            </div>

            {/* Отладочная информация - только в режиме разработки */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Шаг {currentStep}: {canProceed() ? '✅ Готов' : '❌ Требуется согласие'}
              </div>
            )}
          </div>

          {/* Индикаторы шагов */}
          <div className="flex justify-center space-x-2 pb-3 sm:pb-4">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieConsent;