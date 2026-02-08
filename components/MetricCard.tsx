import React from 'react';
import { ArrowUp, ArrowDown, HelpCircle, RefreshCcw } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string; // e.g., Yesterday's value
  change?: string;
  isPositive?: boolean; // Determines color of change
  tooltip?: string;
  currency?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subValue, 
  change, 
  isPositive, 
  tooltip,
  currency 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 text-sm font-medium">{title}</span>
          {tooltip && <HelpCircle size={14} className="text-gray-300 cursor-help" />}
        </div>
      </div>
      
      <div className="flex items-baseline gap-1 mb-1">
        {currency && <span className="text-gray-500 text-sm">{currency}</span>}
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>

      <div className="flex items-center justify-between text-xs mt-3">
        {subValue && (
          <span className="text-gray-400">昨日: {subValue}</span>
        )}
        {change && (
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            <span className="font-medium ml-0.5">{change}</span>
          </div>
        )}
      </div>
    </div>
  );
};