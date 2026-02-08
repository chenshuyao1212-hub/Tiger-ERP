
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  hasDropdown?: boolean;
  primary?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  label, 
  icon, 
  hasDropdown = false,
  primary = false, 
  destructive = false,
  onClick
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors border h-7 whitespace-nowrap shadow-sm
    ${primary 
      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
      : destructive 
        ? 'bg-white text-red-600 border-gray-200 hover:border-red-400 hover:bg-red-50' 
        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
    }`}
  >
    {icon}
    {label}
    {hasDropdown && <ChevronDown size={12} className={`ml-0.5 opacity-70 ${primary ? 'text-white' : 'text-gray-400'}`} />}
  </button>
);
