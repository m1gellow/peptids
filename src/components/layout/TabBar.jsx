import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiUser, FiHome } from 'react-icons/fi';
import WebApp from '@twa-dev/sdk';

const TabBar = () => {
  const location = useLocation();
  
  // Основные вкладки (оставляем только 3 самые важные)
  const mainTabs = [
    { path: '/', icon: <FiHome size={20} />, label: 'Главная' },
    { path: '/catalog', icon: <FiGrid size={20} />, label: 'Каталог' },
    { path: '/profile', icon: <FiUser size={20} />, label: 'Профиль' }
  ];

  // Функция для обработки тактильной обратной связи и прокрутки вверх
  const handleTabClick = () => {
    // Тактильная обратная связь
    if (WebApp.HapticFeedback) {
      WebApp.HapticFeedback.impactOccurred('medium');
    }
    
    // Прокрутка страницы вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="tab-bar safe-area-padding-bottom">
      {mainTabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          onClick={handleTabClick}
          className={({ isActive }) => 
            `tab-item ${isActive ? 'active' : ''} transition-all duration-200 hover:scale-105 flex-1`
          }
        >
          <div className="icon transition-transform duration-200">{tab.icon}</div>
          <span className="text-xs mt-1">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default TabBar;