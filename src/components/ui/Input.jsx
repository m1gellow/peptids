import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  error,
  helper,
  className = '',
  required = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  ...props
}, ref) => {
  const inputId = id || name;
  
  // Базовые классы для input
  const baseInputClasses = `
    rounded-md border border-divider 
    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
    transition-all duration-200
    bg-white text-text placeholder:text-text-light text-sm
    px-4 py-2.5
    disabled:bg-gray-100 disabled:text-text-secondary disabled:cursor-not-allowed
  `;
  
  // Классы в зависимости от состояния ошибки
  const errorClasses = error ? 'border-error focus:border-error focus:ring-error/50' : '';
  
  // Классы в зависимости от наличия иконки
  const iconClasses = icon 
    ? iconPosition === 'left' 
      ? 'pl-10' 
      : 'pr-10'
    : '';
  
  // Классы ширины
  const widthClasses = fullWidth ? 'w-full' : 'w-auto';
  
  // Собираем все классы
  const inputClasses = `
    ${baseInputClasses}
    ${errorClasses}
    ${iconClasses}
    ${widthClasses}
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} mb-4`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block mb-1.5 text-sm font-medium ${error ? 'text-error' : 'text-text-secondary'}`}
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </div>
        )}
      </div>
      
      {(error || helper) && (
        <p className={`mt-1 text-xs ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error || helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;