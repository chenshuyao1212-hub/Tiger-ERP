import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LayoutGrid } from 'lucide-react';

interface CombinedSearchInputProps {
  searchType: string;
  onSearchTypeChange: (type: string) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  className?: string;
}

const SEARCH_TYPES = [
  '订单号', '卖家订单号', 'ASIN', '父ASIN', 'MSKU', 'SKU', 
  '品名', '标题', '买家邮箱', '备注', '促销编码', '物流商', '运单号'
];

export const CombinedSearchInput: React.FC<CombinedSearchInputProps> = ({
  searchType,
  onSearchTypeChange,
  searchValue,
  onSearchValueChange,
  onSearch,
  placeholder = "双击批量搜索内容",
  className = ""
}) => {
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const [isBatchSearchOpen, setIsBatchSearchOpen] = useState(false);
  
  const searchTypeRef = useRef<HTMLDivElement>(null);
  const batchSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchTypeRef.current && !searchTypeRef.current.contains(event.target as Node)) {
        setIsSearchTypeOpen(false);
      }
      if (batchSearchRef.current && !batchSearchRef.current.contains(event.target as Node)) {
        setIsBatchSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      setIsBatchSearchOpen(false);
    }
  };

  return (
    <div className={`flex items-center border border-gray-200 rounded hover:border-blue-400 transition-colors h-7 bg-white relative ${className}`}>
      <div className="relative border-r border-gray-200 h-full" ref={searchTypeRef}>
        <button 
          onClick={() => setIsSearchTypeOpen(!isSearchTypeOpen)}
          className={`h-full px-2 flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-50 min-w-[80px] justify-between ${isSearchTypeOpen ? 'bg-blue-50 text-blue-600' : ''}`}
        >
          <span className="truncate">{searchType}</span>
          <ChevronDown size={12} className={`transition-transform flex-shrink-0 ${isSearchTypeOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
        </button>
        {isSearchTypeOpen && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-gray-200 shadow-xl rounded z-50 py-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {SEARCH_TYPES.map(t => (
              <button 
                key={t}
                onClick={() => { onSearchTypeChange(t); setIsSearchTypeOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 hover:text-blue-600 transition-colors ${searchType === t ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <input 
        type="text" 
        className="w-40 text-xs px-2 py-1 outline-none text-gray-700 placeholder:text-gray-300 h-full" 
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchValueChange(e.target.value)}
        onDoubleClick={() => { setIsBatchSearchOpen(true); setIsSearchTypeOpen(false); }}
        onKeyDown={handleKeyDown}
      />
      
      <button 
        onClick={() => { onSearch(); setIsBatchSearchOpen(false); }}
        className="px-3 h-full bg-blue-600 hover:bg-blue-700 border-l border-blue-600 text-white flex items-center justify-center transition-colors" 
        title="搜索"
      >
        <Search size={14} />
      </button>

      {isBatchSearchOpen && (
        <div ref={batchSearchRef} className="absolute -top-[1px] -left-[1px] w-[320px] bg-white border border-gray-200 shadow-xl rounded-md z-[70] flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="relative p-3 pb-0">
            <div className="absolute top-3 left-3 text-gray-400 pointer-events-none"><LayoutGrid size={14} /></div>
            <div className="absolute top-3 right-3 text-gray-400 pointer-events-none"><Search size={14} /></div>
            <textarea 
              className="w-full h-64 pl-6 pr-6 text-xs text-gray-700 placeholder:text-gray-400 outline-none resize-none leading-relaxed border-none scrollbar-thin scrollbar-thumb-gray-200"
              placeholder="回车换行，最多支持200&#10;(支持excel复制粘贴)"
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 mt-2 bg-gray-50/50 rounded-b-md">
            <button 
              onClick={() => onSearchValueChange('')}
              className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50 shadow-sm"
            >
              清空
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsBatchSearchOpen(false)}
                className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50 shadow-sm"
              >
                关闭
              </button>
              <button 
                onClick={() => { onSearch(); setIsBatchSearchOpen(false); }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 shadow-sm"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
