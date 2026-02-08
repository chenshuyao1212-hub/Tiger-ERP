
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  Search, 
  X,
  Check,
  ChevronRight,
  ChevronsLeft,
  ChevronLeft
} from 'lucide-react';
import { MARKETPLACE_MAP } from '../constants';
import { Salesperson, ShopItem, SiteItem, StatusItem } from '../types';

// Map Marketplace ID to Country Code and Name
const MARKETPLACE_ID_MAP: Record<string, { code: string, name: string }> = {
    'ATVPDKIKX0DER': { code: 'US', name: '美国' },
    'A2EUQ1WTGCTBG2': { code: 'CA', name: '加拿大' },
    'A1AM78C64UM0Y8': { code: 'MX', name: '墨西哥' },
    'A2Q3Y263D00KWC': { code: 'BR', name: '巴西' },
    'A1F83G8C2ARO7P': { code: 'GB', name: '英国' },
    'A1PA6795UKMFR9': { code: 'DE', name: '德国' },
    'A13V1IB3VIYZZH': { code: 'FR', name: '法国' },
    'APJ6JRA9NG5V4': { code: 'IT', name: '意大利' },
    'A1RKKUPIHCS9HS': { code: 'ES', name: '西班牙' },
    'A1805IZSGTT6HS': { code: 'NL', name: '荷兰' },
    'A2NODRKZP88ZB9': { code: 'SE', name: '瑞典' },
    'A1C3SOZRARQ6R3': { code: 'PL', name: '波兰' },
    'A33AVAJ2CFY430': { code: 'TR', name: '土耳其' },
    'A1VC38T7YXB528': { code: 'JP', name: '日本' },
    'A39IBJ37TRP1C6': { code: 'AU', name: '澳大利亚' },
    'A21TJRUUN4KGV': { code: 'IN', name: '印度' },
    'A2VIGQ35RCS4UG': { code: 'AE', name: '阿联酋' },
    'A17E79C6D8DWNP': { code: 'SA', name: '沙特' },
    'A19VAU5U5O7RUS': { code: 'SG', name: '新加坡' },
};

const FLAG_MAP: Record<string, string> = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷',
    'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 
    'JP': '🇯🇵', 'AU': '🇦🇺', 'SG': '🇸🇬', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IN': '🇮🇳',
    'NL': '🇳🇱', 'SE': '🇸🇪', 'PL': '🇵🇱', 'TR': '🇹🇷',
    'IE': '🇮🇪', 'BE': '🇧🇪'
};

const getFlag = (id: string) => FLAG_MAP[id] || '🌐';

export const MultiSelectDropdown: React.FC<{ 
  label: string, 
  options: { id: string, name: string }[], 
  onChange: (selectedIds: string[]) => void,
  className?: string
}> = ({ 
  label, 
  options, 
  onChange,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleOnlyThis = (id: string) => {
      const newSet = new Set([id]);
      setSelectedIds(newSet);
      onChange([id]);
      setIsOpen(false);
  };

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(opt => selectedIds.has(opt.id));

  const handleConfirm = () => {
    onChange(Array.from(selectedIds));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds(new Set());
      onChange([]);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full h-7 px-2 border rounded transition-colors text-xs bg-white ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}
      >
        <span className="truncate">{selectedIds.size > 0 ? `已选 ${selectedIds.size} 项` : label}</span>
        
        <div className="flex items-center gap-1">
            {selectedIds.size > 0 && (
                <div 
                    onClick={handleClear}
                    className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="清空筛选"
                >
                    <X size={12} />
                </div>
            )}
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="搜索" 
                    className="w-full pl-2 pr-8 py-1.5 border-b border-gray-200 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
                <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[280px] p-2 space-y-1">
             <label className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    checked={isAllSelected}
                    onChange={(e) => {
                        if (e.target.checked) {
                            const newSet = new Set<string>(selectedIds);
                            filteredOptions.forEach(o => newSet.add(o.id));
                            setSelectedIds(newSet);
                        } else {
                            const newSet = new Set<string>(selectedIds);
                            filteredOptions.forEach(o => newSet.delete(o.id));
                            setSelectedIds(newSet);
                        }
                    }}
                />
                <span className="text-sm text-gray-700">全选</span>
             </label>

             {filteredOptions.map(opt => (
                 <div key={opt.id} className="group/item relative flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                            checked={selectedIds.has(opt.id)}
                            onChange={() => toggleSelection(opt.id)}
                        />
                        <span className="text-sm text-gray-700">{opt.name}</span>
                    </label>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleOnlyThis(opt.id); }}
                        className="absolute right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-blue-700 transition-opacity shadow-sm z-10"
                    >
                        仅筛选此项
                    </button>
                 </div>
             ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b">
             <span className="text-xs text-gray-400">按住Shift可快速多选</span>
             <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50">取消</button>
                 <button onClick={handleConfirm} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">确定</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SalespersonFilterDropdown: React.FC<{ onChange?: (selectedIds: string[]) => void, className?: string }> = ({ onChange, className }) => {
    const [salespersons, setSalespersons] = useState<Salesperson[]>([]);

    useEffect(() => {
        fetch('/api/users/salespersons')
          .then(res => res.json())
          .then(data => setSalespersons(data.data || []))
          .catch(err => console.error(err));
    }, []);

    return <MultiSelectDropdown label="业务员" options={salespersons} onChange={onChange || (() => {})} className={className} />;
};

export const ShopFilterDropdown: React.FC<{ onChange?: (shops: string[]) => void, returnField?: 'id' | 'name' }> = ({ onChange, returnField = 'id' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Extend ShopItem to include marketplaceId which is now provided by backend
  interface ExtendedShopItem extends ShopItem {
      marketplaceId?: string;
  }
  
  const [shops, setShops] = useState<ExtendedShopItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/common/shops')
      .then(r => r.json())
      .then(d => setShops(d.data || []))
      .catch(e => console.error("Failed to load shops", e));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getShopLocationName = (shop: ExtendedShopItem) => {
      if (shop.marketplaceId && MARKETPLACE_ID_MAP[shop.marketplaceId]) {
          return MARKETPLACE_ID_MAP[shop.marketplaceId].name;
      }
      return MARKETPLACE_MAP[shop.region] || shop.region || '未知';
  };

  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getShopLocationName(shop).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) { newSet.delete(id); } else { newSet.add(id); }
    setSelectedIds(newSet);
  };

  const handleOnlyThis = (id: string) => {
      const newSet = new Set([id]);
      setSelectedIds(newSet);
      if (onChange) {
          if (returnField === 'id') {
              onChange([id]);
          } else {
              const shop = shops.find(s => s.id === id);
              onChange([shop ? shop.name : id]);
          }
      }
      setIsOpen(false);
  };

  const isAllSelected = filteredShops.length > 0 && filteredShops.every(s => selectedIds.has(s.id));

  const handleSelectAll = (checked: boolean) => {
      const newSet = new Set<string>(selectedIds);
      if (checked) filteredShops.forEach(s => newSet.add(s.id));
      else filteredShops.forEach(s => newSet.delete(s.id));
      setSelectedIds(newSet);
  };

  const handleConfirm = () => {
    if (onChange) {
        const values = Array.from(selectedIds).map(id => {
            if (returnField === 'id') return id;
            const shop = shops.find(s => s.id === id);
            return shop ? shop.name : id;
        });
        onChange(values);
    }
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds(new Set());
      if (onChange) onChange([]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center justify-between min-w-[100px] h-7 px-2 border rounded transition-colors text-xs bg-white cursor-pointer select-none w-28 ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}
      >
        <span className="truncate flex-1 text-left">{selectedIds.size > 0 ? `已选 ${selectedIds.size} 个` : '全部店铺'}</span>
        <div className="flex items-center gap-1">
            {selectedIds.size > 0 && (
                <div onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></div>
            )}
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 shadow-xl rounded z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
                <input type="text" placeholder="搜索" className="w-full pl-2 pr-8 py-1.5 border-b border-blue-500 text-sm focus:outline-none placeholder:text-gray-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[300px] py-1">
             <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                <span className="text-sm text-gray-800">全选</span>
             </label>

             {filteredShops.map(shop => (
                 <div key={shop.id} className="group/item relative flex items-start px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <label className="flex items-start gap-3 flex-1 cursor-pointer min-w-0">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer shrink-0" checked={selectedIds.has(shop.id)} onChange={() => toggleSelection(shop.id)} />
                        <div className="flex justify-between w-full text-sm min-w-0">
                            <span className="text-gray-800 truncate pr-2">{shop.name}</span>
                            <span className="text-gray-400 whitespace-nowrap">{getShopLocationName(shop)}</span>
                        </div>
                    </label>
                    <button onClick={(e) => { e.stopPropagation(); handleOnlyThis(shop.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-blue-700 transition-opacity shadow-sm z-10 whitespace-nowrap">仅筛选此项</button>
                 </div>
             ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b">
             <span className="text-xs text-gray-400">按住Shift可快速多选</span>
             <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50">取消</button>
                 <button onClick={handleConfirm} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">确定</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const StatusFilterDropdown: React.FC<{ onChange?: (statuses: string[]) => void }> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/common/statuses').then(r => r.json()).then(d => setStatuses(d.data || [])).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStatuses = statuses.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectAll = (checked: boolean) => {
      const newSet = new Set<string>(selectedIds);
      if (checked) filteredStatuses.forEach(s => newSet.add(s.id));
      else filteredStatuses.forEach(s => newSet.delete(s.id));
      setSelectedIds(newSet);
  };

  const handleOnlyThis = (id: string) => {
      const newSet = new Set([id]);
      setSelectedIds(newSet);
      if (onChange) onChange([id]);
      setIsOpen(false);
  }

  const handleConfirm = () => {
    if (onChange) onChange(Array.from(selectedIds));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds(new Set());
      if (onChange) onChange([]);
  };

  const isAllSelected = filteredStatuses.length > 0 && filteredStatuses.every(s => selectedIds.has(s.id));

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className={`group flex items-center justify-between min-w-[100px] h-7 px-2 border rounded transition-colors text-xs bg-white cursor-pointer select-none w-24 ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}>
        <span className="truncate flex-1 text-left">{selectedIds.size > 0 ? `已选 ${selectedIds.size} 个` : '全部状态'}</span>
        <div className="flex items-center gap-1">
            {selectedIds.size > 0 && (<div onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></div>)}
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
                <input type="text" placeholder="搜索" className="w-full pl-2 pr-8 py-1.5 border-b border-blue-500 text-sm focus:outline-none placeholder:text-gray-300" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
                <Search size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[280px] py-1">
             <label className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer" checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} />
                <span className="text-sm text-gray-800">全选</span>
             </label>
             {filteredStatuses.map(status => (
                 <div key={status.id} className="group/item relative flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <label className="flex items-center gap-3 flex-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer shrink-0" checked={selectedIds.has(status.id)} onChange={() => toggleSelection(status.id)} />
                        <span className="text-sm text-gray-800">{status.name}</span>
                    </label>
                    <button onClick={(e) => { e.stopPropagation(); handleOnlyThis(status.id); }} className="absolute right-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-blue-700 transition-opacity shadow-sm z-10">仅筛选此项</button>
                 </div>
             ))}
          </div>
          <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b">
             <span className="text-xs text-gray-400">按住Shift可快速多选</span>
             <div className="flex gap-2">
                 <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50">取消</button>
                 <button onClick={handleConfirm} className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">确定</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const DeliveryMethodFilterDropdown: React.FC<{ onChange?: (method: string | null) => void }> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [methods, setMethods] = useState<{id: string, name: string}[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/common/delivery-methods').then(r => r.json()).then(d => setMethods(d.data || [])).catch(() => setMethods([{id: 'AFN', name: 'FBA'}, {id: 'MFN', name: 'FBM'}]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
      setSelectedId(id);
      if (onChange) onChange(id);
      setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(null);
      if (onChange) onChange(null);
  };

  const selectedName = methods.find(m => m.id === selectedId)?.name;

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className={`group flex items-center justify-between min-w-[80px] h-7 px-2 border rounded transition-colors text-xs bg-white cursor-pointer select-none w-24 ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}>
        <span className="truncate flex-1 text-left">{selectedName || '发货方式'}</span>
        <div className="flex items-center gap-1">
            {selectedId && (<div onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></div>)}
            <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-gray-200 shadow-xl rounded z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100 py-1">
             {methods.map(method => (
                 <div key={method.id} className={`px-3 py-2 cursor-pointer text-sm hover:bg-gray-50 transition-colors ${selectedId === method.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`} onClick={() => handleSelect(method.id)}>
                    {method.name}
                 </div>
             ))}
        </div>
      )}
    </div>
  );
};

export const SiteFilterDropdown: React.FC<{ onChange?: (sites: string[]) => void }> = ({ onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SiteItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/common/sites').then(r => r.json()).then(d => {
          const loadedData = d.data || [];
          setData(loadedData);
          if(loadedData.length > 0) setActiveRegionId(loadedData[0].id);
      }).catch(e => console.error(e));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItem = (id: string, children?: SiteItem[]) => {
      const newSet = new Set(selected);
      // Case 1: Toggling a Region/Group
      if (children) {
          const allChildIds = children.map(c => c.id);
          const isAllChecked = allChildIds.every(cid => newSet.has(cid));
          if (isAllChecked) { 
              allChildIds.forEach(cid => newSet.delete(cid)); 
              newSet.delete(id); 
          } else { 
              allChildIds.forEach(cid => newSet.add(cid)); 
              newSet.add(id); 
          }
      } else {
          // Case 2: Toggling a direct item (can be top-level or child)
          if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
          
          // Check if parent region state needs update
          data.forEach(region => {
              if (region.children && region.children.map(c => c.id).includes(id)) {
                  const allChecked = region.children.every(c => newSet.has(c.id));
                  if (allChecked) newSet.add(region.id); else newSet.delete(region.id);
              }
          });
      }
      setSelected(newSet);
  };

  const handleOnlyThis = (item: SiteItem) => {
      const newSet = new Set<string>();
      if (item.children) { 
          newSet.add(item.id); 
          item.children.forEach(c => newSet.add(c.id)); 
      } else { 
          newSet.add(item.id); 
      }
      setSelected(newSet);
      if (onChange) onChange(Array.from(newSet));
      setIsOpen(false);
  };

  const handleConfirm = () => { if (onChange) onChange(Array.from(selected)); setIsOpen(false); };
  const handleClear = (e: React.MouseEvent) => { e.stopPropagation(); setSelected(new Set()); if (onChange) onChange([]); };
  
  // Find currently hovered item to show children panel, but only if it is a Region type with children
  const activeRegion = data.find(r => r.id === activeRegionId && r.children);

  return (
    <div className="relative" ref={containerRef}>
        <div onClick={() => setIsOpen(!isOpen)} className={`group flex items-center justify-between min-w-[100px] h-7 px-2 border rounded transition-colors text-xs bg-white cursor-pointer select-none ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}>
            <span className="truncate flex-1 text-left">{selected.size > 0 ? `已选 ${selected.size} 个` : '全部站点'}</span>
            <div className="flex items-center gap-1">
                {selected.size > 0 && (<div onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></div>)}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
            </div>
        </div>
        
        {isOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded z-50 flex animate-in fade-in zoom-in-95 duration-100 min-w-[400px]">
                {/* Left Panel: Top Level Items (Regions + Independent Sites) */}
                <div className="w-48 py-1 border-r border-gray-100 bg-white">
                    {data.map(item => {
                        const isChecked = selected.has(item.id);
                        let isIndeterminate = false;
                        if (!isChecked && item.children) { 
                            const checkedCount = item.children.filter(c => selected.has(c.id)).length; 
                            isIndeterminate = checkedCount > 0 && checkedCount < item.children.length; 
                        }
                        
                        const hasChildren = !!item.children;

                        return (
                            <div 
                                key={item.id} 
                                onMouseEnter={() => hasChildren ? setActiveRegionId(item.id) : setActiveRegionId(null)} 
                                className={`group/item flex items-center justify-between px-3 py-2 cursor-pointer transition-colors relative ${activeRegionId === item.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); toggleItem(item.id, item.children); }}>
                                    <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors shrink-0 ${isChecked || isIndeterminate ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                        {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                                        {isIndeterminate && <div className="w-2 h-0.5 bg-white rounded-full" />}
                                    </div>
                                    <span className="text-xs text-gray-700 truncate flex items-center gap-1">
                                        {!hasChildren && <span className="font-emoji">{getFlag(item.id)}</span>}
                                        {item.name}
                                    </span>
                                </div>
                                {hasChildren && <ChevronRight size={12} className="text-gray-400" />}
                                <button onClick={(e) => { e.stopPropagation(); handleOnlyThis(item); }} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/item:opacity-100 hover:bg-blue-700 transition-opacity shadow-sm whitespace-nowrap z-10">仅筛选此项</button>
                            </div>
                        );
                    })}
                </div>
                
                {/* Right Panel: Children (Only for active Region) */}
                {activeRegion ? (
                    <div className="w-48 py-1 bg-white">
                        {activeRegion.children!.map(subItem => {
                            const isChecked = selected.has(subItem.id);
                            return (
                                <div key={subItem.id} className="group/subitem flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors relative">
                                    <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => { e.stopPropagation(); toggleItem(subItem.id); }}>
                                        <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center transition-colors shrink-0 ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                                            {isChecked && <Check size={10} className="text-white" strokeWidth={3} />}
                                        </div>
                                        <span className="text-xs text-gray-700 truncate flex items-center gap-1">
                                            <span className="font-emoji">{getFlag(subItem.id)}</span>
                                            {subItem.name}
                                        </span>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); handleOnlyThis(subItem); }} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/subitem:opacity-100 hover:bg-blue-700 transition-opacity shadow-sm whitespace-nowrap z-10">仅筛选此项</button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="w-48 bg-white border-l border-gray-50 flex items-center justify-center text-xs text-gray-400">
                        {/* Empty state for items without children */}
                    </div>
                )}
                
                <div className="absolute bottom-0 right-0 left-0 border-t border-gray-100 p-2 bg-white flex justify-end gap-2 translate-y-full shadow-lg rounded-b-md z-50">
                    <button onClick={() => setIsOpen(false)} className="px-3 py-1 border border-gray-300 bg-white rounded text-xs text-gray-600 hover:bg-gray-50">取消</button>
                    <button onClick={handleConfirm} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">确定</button>
                </div>
            </div>
        )}
    </div>
  );
};
