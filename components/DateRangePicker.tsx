
import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onApply 
}: { 
  startDate: Date, 
  endDate: Date, 
  onApply: (start: Date, end: Date) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    onApply(start, end);
    setIsOpen(false);
  };

  const handleMonthPreset = (offset: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() + offset);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      onApply(start, end);
      setIsOpen(false);
  }

  const renderCalendar = (year: number, month: number, title: string) => {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = [];
      for(let i=0; i<firstDay; i++) days.push(null);
      for(let i=1; i<=daysInMonth; i++) days.push(i);

      return (
          <div className="w-64">
              <div className="flex justify-between items-center mb-2 px-2">
                  {title === 'left' && <ChevronLeft size={16} className="text-gray-400 cursor-pointer"/>}
                  {title === 'right' && <div></div>}
                  <div className="font-bold text-sm text-gray-700">{year}年 {month + 1}月</div>
                  {title === 'right' && <ChevronRight size={16} className="text-gray-400 cursor-pointer"/>}
                  {title === 'left' && <div></div>}
              </div>
              <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                  {['日','一','二','三','四','五','六'].map(d => <div key={d} className="h-6 leading-6">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 text-center text-xs gap-y-1">
                  {days.map((d, i) => {
                      if (!d) return <div key={i}></div>;
                      const currentDate = new Date(year, month, d);
                      const isSelected = currentDate >= startDate && currentDate <= endDate;
                      const isStart = currentDate.toDateString() === startDate.toDateString();
                      const isEnd = currentDate.toDateString() === endDate.toDateString();
                      const isRange = isSelected && !isStart && !isEnd;
                      
                      let bgClass = '';
                      let textClass = 'text-gray-700 hover:bg-gray-100 cursor-pointer rounded-full';
                      
                      if (isStart || isEnd) {
                          bgClass = 'bg-blue-600 text-white rounded-full hover:bg-blue-700';
                          textClass = ''; 
                      } else if (isRange) {
                          bgClass = 'bg-blue-50 text-blue-600 rounded-none';
                          textClass = '';
                      }

                      return (
                          <div key={i} className={`h-8 w-full flex items-center justify-center ${bgClass}`}>
                              <span className={`w-8 h-8 flex items-center justify-center ${textClass}`}>
                                  {d}
                              </span>
                          </div>
                      );
                  })}
              </div>
          </div>
      )
  };

  return (
    <div className="relative" ref={containerRef}>
        <div 
            className="flex items-center border border-gray-200 rounded hover:border-blue-400 transition-colors h-7 bg-white cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
             <div className="px-2 h-full flex items-center border-r border-gray-200 bg-gray-50/50">
               <span className="text-gray-400"><CalendarIcon size={12} /></span>
             </div>
             <div className="w-48 text-xs px-2 text-gray-600 truncate">
                 {formatDate(startDate)} ~ {formatDate(endDate)}
             </div>
        </div>

        {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md z-[60] flex animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                <div className="w-28 border-r border-gray-100 p-2 flex flex-col gap-1 bg-gray-50/30">
                    <button onClick={() => handlePreset(1)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">今天</button>
                    <button onClick={() => handlePreset(2)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">昨天</button>
                    <button onClick={() => handlePreset(7)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600 font-medium bg-blue-50 text-blue-600">最近7天</button>
                    <button onClick={() => handlePreset(14)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">最近14天</button>
                    <button onClick={() => handlePreset(30)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">最近30天</button>
                    <div className="h-px bg-gray-200 my-1"></div>
                    <button onClick={() => handleMonthPreset(0)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">本月</button>
                    <button onClick={() => handleMonthPreset(-1)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">上月</button>
                    <button onClick={() => handlePreset(90)} className="text-left text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-600">最近3个月</button>
                </div>

                <div className="p-4 flex gap-6">
                    {renderCalendar(2026, 0, 'left')}
                    {renderCalendar(2026, 1, 'right')}
                </div>
            </div>
        )}
    </div>
  );
};
