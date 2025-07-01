import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  disabled,
  className = '',
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth,
  ...props
}) => {
  // Классы стилей
  const baseClasses = 'font-medium rounded-md transition-all duration-200 flex items-center justify-center whitespace-nowrap';
  
  // Варианты стилей
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-light hover:text-white active:bg-primary-dark',
    secondary: 'bg-transparent text-primary border border-primary hover:bg-primary-bg',
    text: 'bg-transparent text-primary hover:bg-primary-bg/30 px-2',
    outlined: 'bg-transparent border border-gray-300 text-text-secondary hover:border-primary hover:text-primary',
  };
  
  // Размеры
  const sizeClasses = {
    sm: 'text-xs py-2 px-3',
    md: 'text-sm py-2.5 px-4',
    lg: 'text-base py-3 px-6',
  };
  
  // Состояние "отключено"
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';
  
  // Полная ширина
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Сборка классов
  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]} 
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;
  
  // Рендер содержимого кнопки
  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <span className="mr-2 flex items-center">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && (
        <span className="ml-2 flex items-center">{icon}</span>
      )}
    </>
  );

  // Если это ссылка внутри приложения
  if (to) {
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {renderContent()}
      </Link>
    );
  }
  
  // Если это внешняя ссылка
  if (href) {
    return (
      <a href={href} className={buttonClasses} target="_blank" rel="noopener noreferrer" {...props}>
        {renderContent()}
      </a>
    );
  }
  
  // По умолчанию - обычная кнопка
  return (
    <button 
      type={type} 
      className={buttonClasses} 
      onClick={onClick} 
      disabled={disabled} 
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;