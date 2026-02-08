
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface PageSizeSelectorProps {
  value: number;
  onChange: (val: number) => void;
}

export const PageSizeSelector: React.FC<PageSizeSelectorProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const options = [20, 50, 100, 200];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between border border-gray-200 rounded px-2 py-1 bg-gray-50 text-xs text-gray-600 hover:border-blue-400 transition-colors w-[90px] ${isOpen ? 'border-blue-400 ring-1 ring-blue-100' : ''}`}
      >
        <span>{value}条/页</span>
        <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 shadow-lg rounded z-[60] flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={`text-left px-3 py-2 text-xs hover:bg-gray-50 hover:text-blue-600 transition-colors ${value === opt ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-600'}`}
            >
              {opt}条/页
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
