import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

import Section from '../components/ui/Section';
import Button from '../components/ui/Button';
import MainBanner from '../components/home/MainBanner';
import ServicesList from '../components/home/ServicesList';
import ProductSamples from '../components/home/ProductSamples';
import ArticlesList from '../components/home/ArticlesList';
import TopPeptideCarousel from '../components/home/TopPeptideCarousel';
import ProductTags from '../components/home/ProductTags';

const HomePage = () => {
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
      {/* Основной баннер */}
      <MainBanner />
      
      {/* Карусель с топ пептидами */}
      <Section 
        variant="default" 
        className="py-6"
      >
        <TopPeptideCarousel />
      </Section>
      
      {/* Метки пептидов */}
      <Section 
        variant="primary"
        className="py-8 bg-gradient-to-br from-primary-dark to-primary"
      >
        <ProductTags />
      </Section>
      
      {/* Раздел "Наши услуги" */}
      <Section 
        variant="default"
        centered
        className="py-10"
      >
        <ServicesList />
      </Section>
      
      {/* Email секция */}
      <Section 
        variant="dark"
        className="py-8 bg-gradient-to-r from-primary/10 to-secondary/10"
      >
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">
            Написать нам можно на эл. почту: zakaz@russianpeptide.com
          </h2>
        </div>
      </Section>

      {/* Образцы продукции */}
      <Section 
        title="Образцы" 
        variant="default"
        centered
        className="py-10"
      >
        <div className="mb-6">
          <span className="section-label">ОБРАЗЦЫ</span>
        </div>
        <ProductSamples />
        
        <div className="flex justify-center mt-8">
          <Button 
            to="/catalog"
            variant="primary"
            icon={<FiArrowRight />}
            iconPosition="right"
          >
            Весь каталог
          </Button>
        </div>
      </Section>

      {/* Раздел "О компании" */}
      <Section 
        title="О компании"
        variant="default"
        className="py-10"
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-sm text-text-secondary mb-6 space-y-4">
              <p>
                <strong className="text-primary-dark">Рашн Пептаид</strong> — это коммерческая, основанная на инновационных технологиях организация, предоставляющая полный спектр услуг для фармацевтической, биотехнологической и косметической отрасли.
              </p>
              <p>
                Компания специализируется на разработке технологии и производстве пептидов и сложных органических молекул в качестве биологически активных ингредиентов и их интермедиатов, биохимических веществ для исследовательский целей in vitro, стандартных образцов для калибровки аналитического оборудования, а также реагентов для пептидного синтеза.
              </p>
              <p>
                В арсенале компании имеются оригинальные know-how технологии в химии пептидов и тонкого органического синтеза.
              </p>
              <p>
                Отлаженные технологические процессы позволяют нарабатывать пептидные субстанции от небольших количеств, для проведения испытаний, до промышленных объемов.
              </p>
              <p>
                Наши клиенты могут заказать синтез пептида, разработку нового пептидного препарата, провести исследование, запустить контрактное производство, получить услуги по регистрации БАД, лекарственного средства и косметики.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-card">
            <h3 className="text-lg font-semibold mb-4">Почему выбирают нас</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-sm text-text">Высокое качество подтверждено сертификатами</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-sm text-text">Исследования и разработки проводим сами</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-sm text-text">Собственное производство</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-sm text-text">Образцы пептидов только для исследовательских целей</span>
              </li>
            </ul>

            {/* Блок "Работаем с ведущими производителями" */}
            <div className="mt-6 bg-primary-dark text-white p-4 rounded-lg">
              <h4 className="font-medium mb-2">Мировое сотрудничество</h4>
              <p className="text-sm text-white">
                Работаем с ведущими мировыми производителями и обеспечиваем быструю доставку качественной продукции.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            to="/about"
            variant="primary"
            icon={<FiArrowRight />}
            iconPosition="right"
          >
            Подробнее о компании
          </Button>
        </div>
      </Section>

      {/* Раздел "Статьи индустрии пептидов" */}
      <Section 
        variant="primary"
        centered
        className="py-10 bg-gradient-to-br from-primary-dark to-primary"
      >
        {/* Медицинский векторный фон для баннера */}
        <div className="relative overflow-hidden rounded-lg mb-8 bg-white/10 backdrop-blur-sm shadow-lg border border-white/10">
          <div className="absolute inset-0 opacity-20 z-0">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="medicalPatternArticles" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
                  <circle cx="20" cy="20" r="2" fill="#ffffff" fillOpacity="0.3"/>
                  <path d="M0,20 L40,20 M20,0 L20,40" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#medicalPatternArticles)" />
            </svg>
          </div>

          <div className="relative z-10 p-6 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Статьи индустрии пептидов</h2>
            <p className="text-white/90">
              Новости и исследования в области биотехнологий
            </p>
          </div>
        </div>

        <ArticlesList />
        
        <div className="flex justify-center mt-8">
          <Button 
            to="/articles"
            variant="secondary"
            icon={<FiArrowRight />}
            iconPosition="right"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            Все статьи
          </Button>
        </div>
      </Section>
      
      {/* Контактная информация */}
      <Section 
        variant="default" 
        className="py-10"
      >
        <div className="bg-white p-6 rounded-lg shadow-card">
          <h2 className="text-xl font-bold mb-6 text-center">Свяжитесь с нами</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-text-secondary mb-6">
                Мы готовы ответить на ваши вопросы и обсудить сотрудничество
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="icon-wrapper mr-4">
                    <FiPhone size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Телефон:</div>
                    <div className="font-medium">
                      <a href="tel:+74993507780" className="text-primary">+7 (499) 350-77-80</a>
                    </div>
                    <div className="text-xs text-text-secondary">
                      <a href="tel:+78005509370">+7 (800) 550-93-70</a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="icon-wrapper mr-4">
                    <FiMail size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Email:</div>
                    <div className="font-medium">
                      <a href="mailto:zakaz@russianpeptide.com" className="text-primary">
                        zakaz@russianpeptide.com
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="icon-wrapper mr-4">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary">Адрес:</div>
                    <div className="font-medium">
                      216450, Смоленская область,<br />
                      г. Починок, ул. Советская, д. 6А, оф. 1
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                to="/contacts" 
                variant="primary"
                fullWidth
              >
                Связаться с нами
              </Button>
              
              <Button 
                href="https://t.me/russianpeptide" 
                variant="secondary"
                fullWidth
              >
                Написать в Telegram
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </motion.div>
  );
};

export default HomePage;