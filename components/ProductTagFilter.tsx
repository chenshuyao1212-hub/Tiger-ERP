
import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Check, 
  X,
  Tag,
  Loader2
} from 'lucide-react';

interface ProductTagFilterProps {
    onChange: (tags: string[]) => void;
    width?: string;
    className?: string;
}

// Mock Data for Tabs
const MOCK_TAGS: Record<string, string[]> = {
    'msku': ['爆款', '新品', '清仓', '滞销', '潜力', '季节性'],
    'asin': ['Best Seller', 'Amazon Choice', 'High Return', 'Low Rating'],
    'parent': ['Brand Flagship', 'Core Series', 'Limited Edition']
};

export const ProductTagFilter: React.FC<ProductTagFilterProps> = ({ 
    onChange, 
    width = '120px', 
    className = '' 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'msku' | 'asin' | 'parent'>('msku');
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [matchType, setMatchType] = useState<'any' | 'all'>('any');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTag = (tag: string) => {
        const newSet = new Set(selectedTags);
        if (newSet.has(tag)) newSet.delete(tag); else newSet.add(tag);
        setSelectedTags(newSet);
    };

    const handleClear = () => {
        setSelectedTags(new Set());
        onChange([]);
    };

    const handleConfirm = () => {
        onChange(Array.from(selectedTags));
        setIsOpen(false);
    };

    const currentTags = MOCK_TAGS[activeTab].filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={`relative ${className}`} style={{ width }} ref={containerRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full h-8 px-2 border rounded-sm transition-colors text-xs bg-white cursor-pointer select-none ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}
            >
                <span className="truncate">{selectedTags.size > 0 ? `已选 ${selectedTags.size} 个` : '产品标签'}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
            </div>

            {/* Popover Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-[400px] bg-white border border-gray-200 shadow-xl rounded z-[60] flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                    
                    {/* Header: Search & Match Type */}
                    <div className="p-3 border-b border-gray-100 space-y-2">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="搜索" 
                                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-300 bg-gray-50 focus:bg-white transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>符合选择的标签:</span>
                            <select 
                                value={matchType} 
                                onChange={(e) => setMatchType(e.target.value as any)}
                                className="border border-gray-200 rounded px-2 py-0.5 bg-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="any">任一 (OR)</option>
                                <option value="all">所有 (AND)</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        {[
                            { id: 'msku', label: 'MSKU标签' },
                            { id: 'asin', label: 'ASIN标签' },
                            { id: 'parent', label: '父ASIN标签' }
                        ].map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tag List Content */}
                    <div className="h-[200px] overflow-y-auto p-2">
                        {currentTags.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-1 text-xs">
                                <Tag size={24} className="opacity-20" />
                                <span>无匹配标签</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-1">
                                {currentTags.map(tag => (
                                    <div 
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${selectedTags.has(tag) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50 text-gray-700'}`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${selectedTags.has(tag) ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                            {selectedTags.has(tag) && <Check size={10} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="truncate">{tag}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b">
                        <div className="text-xs text-gray-500">
                            已选择 <span className="text-blue-600 font-bold">{selectedTags.size}</span> 个标签
                        </div>
                        <div className="flex items-center gap-2">
                            <span 
                                onClick={handleClear}
                                className="text-xs text-gray-400 hover:text-red-500 cursor-pointer mr-2 transition-colors"
                            >
                                清空筛选
                            </span>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                                取消
                            </button>
                            <button 
                                onClick={handleConfirm}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
