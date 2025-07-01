import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiShield, FiEye, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';

const PrivacyPage = () => {
  const navigate = useNavigate();

  // Анимация страницы
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fade-in"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary to-primary-dark py-8">
        <div className="container mx-auto px-4">
          <Button
            variant="text"
            onClick={() => navigate(-1)}
            icon={<FiArrowLeft size={16} />}
            className="text-white hover:text-white/80 mb-4"
          >
            Назад
          </Button>
          
          <div className="flex items-center mb-4">
            <FiShield size={32} className="text-white mr-4" />
            <h1 className="text-3xl font-bold text-white">Политика конфиденциальности</h1>
          </div>
          
          <p className="text-white/90 text-sm">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>

      <Section variant="default" className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-card p-8 space-y-8">
            
            {/* Введение */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text flex items-center">
                <FiEye className="mr-3 text-primary" />
                Общие положения
              </h2>
              <p className="text-text-secondary leading-relaxed">
                Настоящая Политика конфиденциальности персональных данных (далее – Политика конфиденциальности) 
                действует в отношении всей информации, включая персональные данные в понимании применимого законодательства 
                (далее – Персональные данные), которую ООО «Рашн Пептаид» и/или его аффилированные лица, 
                включая все лица, входящие в одну группу с ООО «Рашн Пептаид» (далее – Рашн Пептаид), 
                могут получить о Пользователе во время использования им любого из сайтов, сервисов, 
                служб, программ для ЭВМ, продуктов или услуг Рашн Пептаид (далее – Сервисы) 
                и в ходе исполнения Рашн Пептаид любых соглашений и договоров, заключенных с Пользователем.
              </p>
            </div>

            {/* Какие данные мы собираем */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text flex items-center">
                <FiLock className="mr-3 text-primary" />
                Какую информацию мы собираем
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Персональные данные</h3>
                  <ul className="text-text-secondary text-sm space-y-1 list-disc list-inside">
                    <li>Имя, фамилия и отчество</li>
                    <li>Адрес электронной почты</li>
                    <li>Номер телефона</li>
                    <li>Почтовый адрес доставки</li>
                    <li>Данные документов для оформления заказов</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Технические данные</h3>
                  <ul className="text-text-secondary text-sm space-y-1 list-disc list-inside">
                    <li>IP-адрес устройства</li>
                    <li>Информация о браузере и операционной системе</li>
                    <li>Данные о посещенных страницах</li>
                    <li>Файлы cookie и аналогичные технологии</li>
                    <li>Данные Telegram (при использовании Telegram Mini App)</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Коммерческие данные</h3>
                  <ul className="text-text-secondary text-sm space-y-1 list-disc list-inside">
                    <li>История заказов и покупок</li>
                    <li>Предпочтения и интересы</li>
                    <li>Данные корзины и списка желаний</li>
                    <li>Отзывы и обратная связь</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Цели обработки */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Цели обработки персональных данных</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-primary-bg p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary-dark">Предоставление услуг</h3>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Обработка и выполнение заказов</li>
                    <li>• Доставка товаров</li>
                    <li>• Техническая поддержка</li>
                    <li>• Персонализация контента</li>
                  </ul>
                </div>

                <div className="bg-primary-bg p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary-dark">Коммуникации</h3>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Уведомления о заказах</li>
                    <li>• Информационные рассылки</li>
                    <li>• Ответы на обращения</li>
                    <li>• Маркетинговые предложения</li>
                  </ul>
                </div>

                <div className="bg-primary-bg p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary-dark">Анализ и улучшение</h3>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Анализ использования сайта</li>
                    <li>• Улучшение пользовательского опыта</li>
                    <li>• Статистические исследования</li>
                    <li>• Разработка новых функций</li>
                  </ul>
                </div>

                <div className="bg-primary-bg p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-primary-dark">Правовые обязательства</h3>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Соблюдение требований законодательства</li>
                    <li>• Предотвращение мошенничества</li>
                    <li>• Разрешение споров</li>
                    <li>• Защита прав компании</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Правовые основания */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Правовые основания обработки</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-text-secondary text-sm">
                    <strong>Согласие субъекта персональных данных</strong> на обработку его персональных данных
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-text-secondary text-sm">
                    <strong>Исполнение договора</strong>, стороной которого является субъект персональных данных
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-text-secondary text-sm">
                    <strong>Законные интересы</strong> оператора или третьих лиц
                  </p>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-text-secondary text-sm">
                    <strong>Исполнение правовой обязанности</strong>, возложенной на оператора
                  </p>
                </div>
              </div>
            </div>

            {/* Передача данных */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Передача персональных данных</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Мы можем передавать ваши персональные данные третьим лицам только в следующих случаях:
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2 text-yellow-800">Доверенные партнеры</h3>
                <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
                  <li>Службы доставки для выполнения заказов</li>
                  <li>Платежные системы для обработки платежей</li>
                  <li>IT-поставщики для технической поддержки</li>
                  <li>Аналитические сервисы (с анонимизацией данных)</li>
                </ul>
              </div>

              <p className="text-text-secondary text-sm">
                Все третьи лица обязуются обеспечивать конфиденциальность и безопасность персональных данных 
                в соответствии с применимым законодательством и нашими требованиями.
              </p>
            </div>

            {/* Защита данных */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Защита персональных данных</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3 text-text">Технические меры</h3>
                  <ul className="text-text-secondary text-sm space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      SSL-шифрование данных
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Защищенные серверы и базы данных
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Регулярное обновление систем безопасности
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Мониторинг несанкционированного доступа
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-text">Организационные меры</h3>
                  <ul className="text-text-secondary text-sm space-y-2">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Ограниченный доступ к данным
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Обучение сотрудников
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Политики информационной безопасности
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                      Аудит безопасности
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Права субъектов */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Ваши права</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                В соответствии с Федеральным законом №152-ФЗ «О персональных данных» вы имеете следующие права:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Право на доступ</h3>
                  <p className="text-text-secondary text-sm">
                    Получить информацию о том, какие персональные данные о вас обрабатываются
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Право на исправление</h3>
                  <p className="text-text-secondary text-sm">
                    Требовать исправления неточных или неполных персональных данных
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Право на удаление</h3>
                  <p className="text-text-secondary text-sm">
                    Требовать удаления персональных данных при определенных условиях
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-text">Право на отзыв согласия</h3>
                  <p className="text-text-secondary text-sm">
                    Отозвать согласие на обработку персональных данных в любое время
                  </p>
                </div>
              </div>
            </div>

            {/* Cookie */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Использование файлов cookie</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                Наш сайт использует файлы cookie для улучшения функциональности и анализа использования. 
                Cookie – это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-blue-800">Типы используемых cookie:</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li><strong>Необходимые:</strong> обеспечивают базовую функциональность сайта</li>
                  <li><strong>Функциональные:</strong> запоминают ваши предпочтения и настройки</li>
                  <li><strong>Аналитические:</strong> помогают понять, как используется сайт</li>
                  <li><strong>Маркетинговые:</strong> используются для показа релевантной рекламы</li>
                </ul>
              </div>
            </div>

            {/* Хранение данных */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Сроки хранения данных</h2>
              <div className="space-y-3">
                <p className="text-text-secondary text-sm">
                  <strong>Персональные данные клиентов:</strong> в течение 5 лет после последнего взаимодействия
                </p>
                <p className="text-text-secondary text-sm">
                  <strong>Данные заказов:</strong> в течение 5 лет для налогового и бухгалтерского учета
                </p>
                <p className="text-text-secondary text-sm">
                  <strong>Технические логи:</strong> в течение 1 года для обеспечения безопасности
                </p>
                <p className="text-text-secondary text-sm">
                  <strong>Маркетинговые данные:</strong> до отзыва согласия или 3 лет с момента последней активности
                </p>
              </div>
            </div>

            {/* Контакты */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Контактная информация</h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам:
              </p>

              <div className="bg-primary-bg p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-primary-dark">ООО «Рашн Пептаид»</h3>
                <div className="space-y-2 text-text-secondary text-sm">
                  <p><strong>Адрес:</strong> 216450, Смоленская область, г. Починок, ул. Советская, д. 6А, оф. 1</p>
                  <p><strong>Телефон:</strong> +7 (499) 350-77-80</p>
                  <p><strong>Email:</strong> zakaz@russianpeptide.com</p>
                  <p><strong>Ответственный за обработку ПД:</strong> Администратор информационной безопасности</p>
                </div>
              </div>
            </div>

            {/* Изменения */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-text">Изменения в политике</h2>
              <p className="text-text-secondary leading-relaxed">
                Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                О существенных изменениях мы будем уведомлять пользователей через сайт или по электронной почте. 
                Продолжение использования наших сервисов после внесения изменений означает ваше согласие с обновленной политикой.
              </p>
            </div>

          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default PrivacyPage;