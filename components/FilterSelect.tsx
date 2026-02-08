
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterSelectProps {
  label: string;
  className?: string;
  width?: string;
  noBorder?: boolean;
  options?: string[];
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ 
  label, 
  className, 
  width, 
  noBorder = false,
  options = []
}) => (
  <div className={`relative flex items-center bg-white ${noBorder ? '' : 'border border-gray-200 rounded'} hover:border-blue-400 transition-colors h-7 ${className}`} style={{ width }}>
    <select className="appearance-none bg-transparent w-full text-xs text-gray-600 px-2 py-1 pr-6 focus:outline-none cursor-pointer h-full">
      <option>{label}</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown size={12} className="absolute right-2 text-gray-400 pointer-events-none" />
  </div>
);
