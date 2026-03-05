import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getLocalDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const safeValue = value || { start: new Date(), end: new Date() };

  // viewDate is the month shown in the LEFT calendar
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(safeValue.end);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return d;
  });

  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDatePreset = (preset: string) => {
    let newStart = getLocalDate();
    let newEnd = getLocalDate();

    const today = getLocalDate();
    
    switch (preset) {
      case '今天':
        newStart = today;
        newEnd = today;
        break;
      case '昨天':
        newStart = getLocalDate(-1);
        newEnd = getLocalDate(-1);
        break;
      case '最近7天':
        newStart = getLocalDate(-6);
        newEnd = today;
        break;
      case '最近14天':
        newStart = getLocalDate(-13);
        newEnd = today;
        break;
      case '最近30天':
        newStart = getLocalDate(-29);
        newEnd = today;
        break;
      case '本月':
        newStart = new Date(today.getFullYear(), today.getMonth(), 1);
        newEnd = today;
        break;
      case '上月':
        newStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case '最近3个月':
        newStart = getLocalDate(-90);
        newEnd = today;
        break;
    }

    onChange({ start: newStart, end: newEnd });
    setIsOpen(false);
  };

  const handleDateClick = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // If we have a range or no selection, start a new range
    if (safeValue.start.getTime() !== safeValue.end.getTime()) {
      onChange({ start: d, end: d });
    } else {
      // We have a start date, now set the end date
      let start = safeValue.start;
      let end = d;
      if (end < start) {
        [start, end] = [end, start];
      }
      onChange({ start, end });
      setIsOpen(false);
    }
  };

  const renderCalendar = (monthOffset: number) => {
    const calDate = new Date(viewDate);
    calDate.setMonth(calDate.getMonth() + monthOffset);
    
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    
    const days = [];
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ d: prevMonthLastDate - i, type: 'prev', date: new Date(year, month - 1, prevMonthLastDate - i) });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ d: i, type: 'curr', date: new Date(year, month, i) });
    }
    // Next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ d: i, type: 'next', date: new Date(year, month + 1, i) });
    }

    return (
      <div className="w-[280px] px-2">
        <div className="flex justify-between items-center mb-4 h-8">
          <div className="flex items-center gap-1">
            {monthOffset === 0 && (
              <>
                <button onClick={() => setViewDate(new Date(year - 1, month, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronsLeft size={14} /></button>
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft size={14} /></button>
              </>
            )}
          </div>
          <div className="text-sm font-bold text-gray-800">{year} 年 {month + 1} 月</div>
          <div className="flex items-center gap-1">
            {monthOffset === 1 && (
              <>
                <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronRight size={14} /></button>
                <button onClick={() => setViewDate(new Date(year + 1, month - 2, 1))} className="p-1 hover:bg-gray-100 rounded text-gray-400"><ChevronsRight size={14} /></button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="h-8 flex items-center justify-center">{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((item, i) => {
            const d = item.date;
            d.setHours(0, 0, 0, 0);
            const s = new Date(safeValue.start); s.setHours(0, 0, 0, 0);
            const e = new Date(safeValue.end); e.setHours(0, 0, 0, 0);
            
            const isStart = d.getTime() === s.getTime();
            const isEnd = d.getTime() === e.getTime();
            const isInRange = d.getTime() > s.getTime() && d.getTime() < e.getTime();
            
            // Hover effect for range selection
            let isHoverInRange = false;
            if (s.getTime() === e.getTime() && hoverDate) {
              const h = new Date(hoverDate); h.setHours(0, 0, 0, 0);
              const start = s.getTime() < h.getTime() ? s.getTime() : h.getTime();
              const end = s.getTime() < h.getTime() ? h.getTime() : s.getTime();
              if (d.getTime() > start && d.getTime() < end) isHoverInRange = true;
              if (d.getTime() === h.getTime() && d.getTime() !== s.getTime()) {
                // This would be the potential end
              }
            }

            const isSelected = isStart || isEnd;
            const isMuted = item.type !== 'curr';

            return (
              <div 
                key={i} 
                className={`h-8 relative flex items-center justify-center cursor-pointer group/day
                  ${(isInRange || isHoverInRange) ? 'bg-blue-50' : ''}
                  ${isStart && !isEnd && (e > s || (hoverDate && hoverDate > s)) ? 'bg-blue-50 rounded-l-full' : ''}
                  ${isEnd && !isStart && e > s ? 'bg-blue-50 rounded-r-full' : ''}
                  ${isStart && isEnd ? '' : ''}
                `}
                onClick={() => handleDateClick(d)}
                onMouseEnter={() => setHoverDate(d)}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs transition-colors
                  ${isSelected ? 'bg-blue-600 text-white font-bold z-10' : isMuted ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}
                `}>
                  {item.d}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className="flex items-center px-3 cursor-pointer hover:bg-gray-50 h-8 min-w-[200px] border border-gray-200 rounded hover:border-blue-400 transition-colors bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={14} className="text-gray-400 mr-2" />
        <span className="text-xs text-gray-600 font-medium">{formatDate(safeValue.start)} ~ {formatDate(safeValue.end)}</span>
        <ChevronDown size={14} className={`ml-auto text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-2xl rounded-md z-[100] flex animate-in fade-in zoom-in-95 duration-100 origin-top-left overflow-hidden">
          {/* Sidebar Presets */}
          <div className="w-28 py-2 border-r border-gray-100 flex flex-col bg-gray-50/30">
            {['今天', '昨天', '最近7天', '最近14天', '最近30天', '本月', '上月', '最近3个月'].map(p => (
              <button
                key={p}
                onClick={() => handleDatePreset(p)}
                className="text-left px-4 py-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Calendars */}
          <div className="p-4 flex bg-white divide-x divide-gray-100">
            {renderCalendar(0)}
            {renderCalendar(1)}
          </div>
        </div>
      )}
    </div>
  );
};
