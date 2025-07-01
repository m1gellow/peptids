import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const SortFilter = ({ value, onChange, options }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none bg-white border border-divider rounded-lg
          px-4 py-2 pr-8 text-sm text-text
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
          transition-all duration-200 font-medium
        "
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <FiChevronDown className="h-4 w-4 text-text-secondary" />
      </div>
    </div>
  );
};

export default SortFilter;