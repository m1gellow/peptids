import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiMessageSquare, FiCopy, FiChevronDown, FiChevronUp, FiInfo, FiBook, FiFileText } from 'react-icons/fi';
import { showNotification } from '../../utils/telegramUtils';

const Footer = () => {
  // Состояние для раскрытия/скрытия разделов на мобильных устройствах
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Функция для копирования текста в буфер обмена
  const copyToClipboard = (text, message = 'Скопировано в буфер обмена') => {
    navigator.clipboard.writeText(text)
      .then(() => showNotification(message))
      .catch(err => console.error('Ошибка при копировании:', err));
  };
  
  // Функция для сокращения длинных email-адресов
  const formatEmail = (email) => {
    // Для мобильных устройств сокращаем email если он длинный
    const isMobile = window.innerWidth < 640;
    if (isMobile && email.length > 18) {
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        const username = email.substring(0, Math.min(8, atIndex));
        const domain = email.substring(atIndex);
        return `${username}...${domain}`;
      }
    }
    return email;
  };
  
  // Переключение раздела
  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  return (
    <footer className="bg-primary-dark text-white pb-20 md:pb-8">
      {/* Компактный футер для мобильных */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-4">
          {/* Логотип и слоган */}
          <div className="text-center mb-4">
            <img 
              src="https://russianpeptide.com/wp-content/uploads/2017/05/russian_peptide_logo_bel2.png" 
              alt="Russian Peptide" 
              className="h-10 mx-auto mb-2"
            />
            <p className="text-white/80 text-xs">СДЕЛАНО В РОССИИ</p>
          </div>
          
          {/* Аккордеоны с информацией */}
          <div className="space-y-1">
            {/* Контакты */}
            <div className="border-t border-white/10">
              <button 
                className="w-full py-2 px-1 flex justify-between items-center text-left" 
                onClick={() => toggleSection('contacts')}
              >
                <div className="flex items-center">
                  <FiPhone className="mr-2 text-secondary" size={14} />
                  <span className="font-medium text-sm">Контакты</span>
                </div>
                {expandedSection === 'contacts' ? 
                  <FiChevronUp size={16} className="text-white/60" /> : 
                  <FiChevronDown size={16} className="text-white/60" />
                }
              </button>
              
              {expandedSection === 'contacts' && (
                <div className="py-2 pl-6 space-y-2 text-sm">
                  <div>
                    <div className="text-xs text-white/60">Телефон:</div>
                    <div>
                      <a href="tel:+74993507780" className="text-white hover:text-secondary transition-colors">
                        +7 (499) 350-77-80
                      </a>
                    </div>
                    <div>
                      <a href="tel:+78005509370" className="text-white hover:text-secondary transition-colors">
                        +7 (800) 550-93-70
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="text-xs text-white/60 mr-1">Email:</div>
                    <div className="flex items-center">
                      <a 
                        href="mailto:zakaz@russianpeptide.com" 
                        className="text-white hover:text-secondary transition-colors truncate"
                        title="zakaz@russianpeptide.com"
                      >
                        zakaz@russianpeptide.com
                      </a>
                      <button
                        onClick={() => copyToClipboard("zakaz@russianpeptide.com", "Email скопирован")}
                        className="ml-1 text-white/50 hover:text-white transition-colors p-1"
                      >
                        <FiCopy size={12} />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-white/60">Telegram:</div>
                    <a href="https://t.me/russianpeptide" className="text-white hover:text-secondary transition-colors">
                      @russianpeptide
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* Адрес */}
            <div className="border-t border-white/10">
              <button 
                className="w-full py-2 px-1 flex justify-between items-center text-left" 
                onClick={() => toggleSection('address')}
              >
                <div className="flex items-center">
                  <FiMapPin className="mr-2 text-secondary" size={14} />
                  <span className="font-medium text-sm">Адрес</span>
                </div>
                {expandedSection === 'address' ? 
                  <FiChevronUp size={16} className="text-white/60" /> : 
                  <FiChevronDown size={16} className="text-white/60" />
                }
              </button>
              
              {expandedSection === 'address' && (
                <div className="py-2 pl-6 space-y-2">
                  <div className="text-xs text-white/60">Юр. и факт. адрес:</div>
                  <p className="text-white/80 text-xs">
                    216450, Смоленская область,<br />
                    г. Починок, ул. Советская, д. 6А, оф. 1
                  </p>
                </div>
              )}
            </div>
            
            {/* Реквизиты */}
            <div className="border-t border-white/10">
              <button 
                className="w-full py-2 px-1 flex justify-between items-center text-left" 
                onClick={() => toggleSection('details')}
              >
                <div className="flex items-center">
                  <FiFileText className="mr-2 text-secondary" size={14} />
                  <span className="font-medium text-sm">Реквизиты</span>
                </div>
                {expandedSection === 'details' ? 
                  <FiChevronUp size={16} className="text-white/60" /> : 
                  <FiChevronDown size={16} className="text-white/60" />
                }
              </button>
              
              {expandedSection === 'details' && (
                <div className="py-2 pl-6">
                  <ul className="text-xs space-y-1 text-white/70">
                    <li><strong>Наименование:</strong> ООО "Рашн Пептаид"</li>
                    <li><strong>ИНН/КПП:</strong> 6712011194/671201001</li>
                    <li><strong>ОГРН:</strong> 1166733071284</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* О компании */}
            <div className="border-t border-white/10">
              <button 
                className="w-full py-2 px-1 flex justify-between items-center text-left" 
                onClick={() => toggleSection('about')}
              >
                <div className="flex items-center">
                  <FiInfo className="mr-2 text-secondary" size={14} />
                  <span className="font-medium text-sm">О компании</span>
                </div>
                {expandedSection === 'about' ? 
                  <FiChevronUp size={16} className="text-white/60" /> : 
                  <FiChevronDown size={16} className="text-white/60" />
                }
              </button>
              
              {expandedSection === 'about' && (
                <div className="py-2 pl-6">
                  <ul className="text-xs space-y-1 text-white/80">
                    <li>✓ Высокое качество подтверждено сертификатами</li>
                    <li>✓ Исследования и разработки проводим сами</li>
                    <li>✓ Собственное производство</li>
                    <li className="text-secondary text-xs">Образцы только для исследовательских целей</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Копирайт */}
          <div className="mt-4 pt-2 border-t border-white/10 text-center text-xs text-white/60">
            <p>© 2016-{new Date().getFullYear()} | ООО «Рашн Пептаид»</p>
          </div>
        </div>
      </div>

      {/* Полный футер для десктопа */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Колонка 1: Логотип и информация */}
            <div>
              {/* Адаптивный логотип в футере */}
              <picture>
                <img 
                  src="https://russianpeptide.com/wp-content/uploads/2017/05/russian_peptide_logo_bel2.png" 
                  alt="Russian Peptide" 
                  className="h-12 mb-4 object-contain max-w-[180px]"
                />
              </picture>
              <p className="text-white/80 text-sm mb-4">СДЕЛАНО В РОССИИ</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>✓ Высокое качество подтверждено сертификатами</li>
                <li>✓ Исследования и разработки проводим сами</li>
                <li>✓ Собственное производство</li>
                <li className="text-secondary">Образцы пептидов, представленные на нашем сайте, только для исследовательских целей</li>
              </ul>
            </div>
            
            {/* Колонка 2: Контактная информация */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
              <p className="text-white/80 text-sm mb-4">
                Оставить заявку, заказать услугу или купить нашу продукцию
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiPhone className="text-secondary mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-white/60">Телефон:</div>
                    <div>
                      <a href="tel:+74993507780" className="text-white hover:text-secondary transition-colors">
                        +7 (499) 350-77-80
                      </a> 
                      <span className="text-xs text-white/70 ml-1">(основной)</span>
                    </div>
                    <div>
                      <a href="tel:+78005509370" className="text-white hover:text-secondary transition-colors">
                        +7 (800) 550-93-70
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMail className="text-secondary mt-1 mr-2" />
                  <div className="flex-grow overflow-hidden">
                    <div className="text-xs text-white/60">Email:</div>
                    <div className="flex items-center">
                      <a 
                        href="mailto:zakaz@russianpeptide.com" 
                        className="text-white hover:text-secondary transition-colors truncate"
                        title="zakaz@russianpeptide.com"
                      >
                        {formatEmail("zakaz@russianpeptide.com")}
                      </a>
                      <button
                        onClick={() => copyToClipboard("zakaz@russianpeptide.com", "Email скопирован")}
                        className="ml-1 text-white/50 hover:text-white transition-colors p-1"
                        title="Скопировать email"
                      >
                        <FiCopy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiMessageSquare className="text-secondary mt-1 mr-2" />
                  <div>
                    <div className="text-xs text-white/60">Telegram:</div>
                    <a href="https://t.me/russianpeptide" className="text-white hover:text-secondary transition-colors">
                      @russianpeptide
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Колонка 3: Адрес и реквизиты */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Адрес</h3>
              <div className="flex items-start mb-4">
                <FiMapPin className="text-secondary mt-1 mr-2" />
                <div>
                  <div className="text-xs text-white/60">Юр. и факт. адрес:</div>
                  <p className="text-white/80 text-sm">
                    216450, Смоленская область,<br />
                    г. Починок, ул. Советская, д. 6А, оф. 1
                  </p>
                </div>
              </div>
              
              <h4 className="text-base font-medium mb-2 mt-4">Реквизиты</h4>
              <ul className="text-xs space-y-1 text-white/70">
                <li><strong>Наименование:</strong> ООО "Рашн Пептаид"</li>
                <li><strong>ИНН/КПП:</strong> 6712011194/671201001</li>
                <li><strong>ОГРН:</strong> 1166733071284</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20 text-center text-xs text-white/60">
            <p>© 2016-{new Date().getFullYear()} | ООО «Рашн Пептаид»</p>
            <p>Производство химических продуктов, научные исследования и разработки в области биотехнологии</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;