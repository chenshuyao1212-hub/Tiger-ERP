
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  RefreshCw, 
  MoreHorizontal, 
  Download, 
  HelpCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  FilterX,
  Loader2,
  Filter
} from 'lucide-react';
import { SiteFilterDropdown, ShopFilterDropdown } from '../../../components/Filters';

// Mock Data Structure matching the grouped table design
interface ShopGroup {
  id: string;
  groupName: string; // e.g. 东问科技-Yistao
  region: string;    // e.g. 北美区
  sellerId?: string; // e.g. A1H41KTBXHP189
  stores: ShopItem[];
}

interface ShopItem {
  id: string;
  name: string; // e.g. 东问-US
  countryCode: string; // e.g. US
  countryName: string; // e.g. 美国
  corpInfo?: {
    tax?: string;
    address?: string;
  };
  ioss?: string;
  taxEstimateStatus: string; // e.g. 未开启
  taxRate?: string;
  adAuth: {
    status: 'success' | 'unauthorized' | 'failed' | 'expired';
    time?: string;
  };
  storeAuth: {
    status: 'success' | 'expiring' | 'failed';
    authTime: string; // Changed from expiryTime to authTime
  };
}

// Marketplace ID Map to Country Code and Name
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

const REGION_MAP: Record<string, string> = {
    'na': '北美区',
    'eu': '欧洲区',
    'fe': '远东区'
};

const FlagIcon = ({ code }: { code: string }) => {
    const flags: Record<string, string> = {
        'US': '🇺🇸', 'CA': '🇨🇦', 'MX': '🇲🇽', 'BR': '🇧🇷',
        'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 
        'JP': '🇯🇵', 'AU': '🇦🇺', 'SG': '🇸🇬', 'AE': '🇦🇪', 'SA': '🇸🇦', 'IN': '🇮🇳',
        'NL': '🇳🇱', 'SE': '🇸🇪', 'PL': '🇵🇱', 'TR': '🇹🇷'
    };
    return <span className="mr-1 font-emoji text-sm">{flags[code] || '🌐'}</span>;
};

// Custom Select Component
const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder,
    width = "w-24",
    className = ""
}: { 
    value: string, 
    onChange: (val: string) => void, 
    options: string[], 
    placeholder?: string,
    width?: string,
    className?: string
}) => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <div className={`relative ${className}`} style={{ width }} ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between h-7 px-2 border rounded transition-colors text-xs bg-white cursor-pointer select-none ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-400'}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full min-w-[100px] bg-white border border-gray-200 shadow-xl rounded z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt) => (
                        <div 
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className={`px-3 py-2 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${value === opt ? 'text-blue-600 bg-blue-50 font-medium' : 'text-gray-700'}`}
                        >
                            {opt}
                        </div>
                    ))}
                    {(value && value !== placeholder) && (
                        <div 
                            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                            className="px-3 py-2 cursor-pointer text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-t border-gray-50 mt-1 flex items-center gap-1"
                        >
                            <FilterX size={10} /> 清除
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const Shop = () => {
  // Filter States
  const [searchType, setSearchType] = useState('Seller ID');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSites, setFilterSites] = useState<string[]>([]);
  const [filterShops, setFilterShops] = useState<string[]>([]);
  const [filterAuth, setFilterAuth] = useState<string>('');
  const [filterAdAuth, setFilterAdAuth] = useState<string>('');
  
  const [resetKey, setResetKey] = useState(0); 
  
  // Real Data States
  const [groups, setGroups] = useState<ShopGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchShops = async () => {
      setIsLoading(true);
      try {
          const res = await fetch('/api/settings/shops/list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  pageNo: 1, 
                  pageSize: 100 // Reduced from 500 to 100 to respect API limits
              })
          });
          const data = await res.json();
          if (data.rows) {
              processData(data.rows);
          } else {
              setGroups([]);
              setTotalCount(0);
          }
      } catch (e) {
          console.error("Fetch shops failed", e);
          setGroups([]);
          setTotalCount(0);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchShops();
  }, [filterSites, filterShops, filterAuth, filterAdAuth, searchTerm]);

  const processData = (rows: any[]) => {
      let filteredRows = rows;

      // 1. Filter by Site
      if (filterSites.length > 0) {
          filteredRows = filteredRows.filter(row => {
              const info = MARKETPLACE_ID_MAP[row.marketplaceId];
              const code = info ? info.code : (row.marketplaceId && row.marketplaceId.length === 2 ? row.marketplaceId : null);
              return code && filterSites.includes(code);
          });
      }

      // 2. Filter by Shop
      if (filterShops.length > 0) {
          filteredRows = filteredRows.filter(row => filterShops.includes(row.id));
      }

      // 3. Filter by Auth Status (0=Default, 1=Invalid, 2=SP Invalid)
      if (filterAuth) {
          filteredRows = filteredRows.filter(row => {
              const s = String(row.status);
              if (filterAuth === '授权成功') return s === '0' || s === '0.0';
              if (filterAuth === '授权失败') return s === '1' || s === '2';
              return true; 
          });
      }

      // 4. Filter by Ad Auth Status ("已授权", "未授权", "已过期")
      if (filterAdAuth) {
          filteredRows = filteredRows.filter(row => {
              const s = row.adStatus;
              if (filterAdAuth === '已授权') return s === '已授权' || s === 'authorized';
              if (filterAdAuth === '未授权') return s === '未授权' || s === 'unauthorized' || !s;
              return true;
          });
      }

      // 5. Search
      if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          filteredRows = filteredRows.filter(row => {
              if (searchType === 'Seller ID') {
                  return (row.sellerId || '').toLowerCase().includes(term);
              } else {
                  return (row.name || '').toLowerCase().includes(term);
              }
          });
      }

      setTotalCount(filteredRows.length);

      // Group by sellerId
      const grouped: Record<string, ShopGroup> = {};
      
      filteredRows.forEach(row => {
          const sellerId = row.sellerId || 'UNKNOWN';
          
          if (!grouped[sellerId]) {
              grouped[sellerId] = {
                  id: `group-${sellerId}`,
                  groupName: row.name ? row.name.split('-')[0] : 'Unknown Group',
                  region: REGION_MAP[row.region] || row.region || '未知区域',
                  sellerId: row.sellerId,
                  stores: []
              };
          }

          const marketplaceInfo = MARKETPLACE_ID_MAP[row.marketplaceId] || { code: '?', name: '未知' };
          
          // Ad Status Mapping (Strict based on API Doc)
          let adStatus: any = 'unauthorized';
          if (row.adStatus === '已授权') {
              adStatus = 'success';
          } else if (row.adStatus === '已过期') {
              adStatus = 'expired';
          } else if (row.adStatus === '未授权' || !row.adStatus) {
              adStatus = 'unauthorized';
          }
          
          // Shop Status Mapping (Strict based on API Doc: 0=Default, 1=Fail, 2=SP Fail)
          let storeStatus: any = 'success';
          const sCode = String(row.status);
          if (sCode === '1' || sCode === '2') {
              storeStatus = 'failed';
          }
          
          const adAuthTime = '-';
          const authTime = '-';

          grouped[sellerId].stores.push({
              id: row.id,
              name: row.name,
              countryCode: marketplaceInfo.code,
              countryName: marketplaceInfo.name,
              corpInfo: { tax: '-', address: '-' },
              ioss: '-',
              taxEstimateStatus: '未开启',
              taxRate: '-',
              adAuth: { status: adStatus, time: adAuthTime },
              storeAuth: { status: storeStatus, authTime: authTime } 
          });
      });

      setGroups(Object.values(grouped));
  };

  const handleReset = () => {
      setSearchType('Seller ID');
      setSearchTerm('');
      setFilterSites([]);
      setFilterShops([]);
      setFilterAuth('');
      setFilterAdAuth('');
      setResetKey(prev => prev + 1); 
  };

  return (
    <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-sm" style={{ height: 'calc(100vh - 140px)' }}>
        {/* 1. Alert Banner */}
        <div className="bg-orange-50 text-orange-800 text-xs px-4 py-2 flex items-center gap-2 border-b border-orange-100 shrink-0">
            <AlertTriangle size={14} className="fill-orange-500 text-white" />
            <span>注意：为防止关联，请在亚马逊店铺常用网络IP环境下进行授权</span>
        </div>

        {/* 2. Filter Bar */}
        <div className="p-3 border-b border-gray-200 bg-white flex flex-wrap items-center gap-2 shrink-0">
            <SiteFilterDropdown key={`site-${resetKey}`} onChange={setFilterSites} />
            <ShopFilterDropdown key={`shop-${resetKey}`} onChange={setFilterShops} />
            
            <CustomSelect 
                placeholder="授权状态" 
                value={filterAuth}
                onChange={setFilterAuth}
                options={['授权成功', '授权失败', '即将过期']} 
                width="100px"
            />
            
            <CustomSelect 
                placeholder="广告授权状态" 
                value={filterAdAuth}
                onChange={setFilterAdAuth}
                options={['已授权', '未授权']} 
                width="110px" 
            />

            {/* Separated Search Input Group */}
            <div className="flex items-center gap-2">
                <CustomSelect 
                    value={searchType}
                    onChange={setSearchType}
                    options={['Seller ID', '店铺名称']}
                    width="100px"
                />
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-48 text-xs pl-3 pr-8 py-1.5 border border-gray-200 rounded outline-none text-gray-600 placeholder:text-gray-300 focus:border-blue-400 transition-colors h-7" 
                        placeholder="双击可批量搜索" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <button className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 hover:border-blue-400 text-gray-500 hover:text-blue-600 bg-white transition-colors">
                <Filter size={12} />
            </button>

            <button 
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-3 py-1 rounded hover:bg-gray-50 transition-colors h-7 border border-transparent hover:border-gray-200"
            >
               <FilterX size={12} /> 重置
            </button>
        </div>

        {/* 3. Action Bar */}
        <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
                <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm font-medium">
                    授权店铺
                </button>
                <button className="bg-white text-gray-600 border border-gray-200 text-xs px-4 py-1.5 rounded hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm flex items-center gap-1">
                    商城预估 <HelpCircle size={12} className="text-gray-400"/>
                </button>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>授权店铺数：<span className="text-gray-900 font-bold">{totalCount}</span></span>
                <div className="h-3 w-px bg-gray-300"></div>
                <button 
                    onClick={fetchShops} 
                    className={`hover:text-blue-600 transition-colors ${isLoading ? 'animate-spin text-blue-600' : ''}`} 
                    title="刷新"
                >
                    <RefreshCw size={14}/>
                </button>
                <button className="hover:text-blue-600 transition-colors" title="下载"><Download size={14}/></button>
                <button className="hover:text-blue-600 transition-colors" title="帮助"><HelpCircle size={14}/></button>
            </div>
        </div>

        {/* 4. Grouped Table */}
        <div className="flex-1 overflow-auto bg-gray-50/30">
            <table className="w-full text-left text-xs text-gray-600 border-collapse min-w-[1400px]">
                <thead className="bg-gray-100 text-gray-700 font-medium border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-3 w-48">店铺名称 <HelpCircle size={10} className="inline text-gray-400"/></th>
                        <th className="p-3 w-32">站点</th>
                        <th className="p-3 w-48">企业信息</th>
                        <th className="p-3 w-32">IOSS税号 <HelpCircle size={10} className="inline text-gray-400"/></th>
                        <th className="p-3 w-32">税费预估 <HelpCircle size={10} className="inline text-gray-400"/></th>
                        <th className="p-3 w-24">税率 <HelpCircle size={10} className="inline text-gray-400"/></th>
                        <th className="p-3 w-48">广告授权</th>
                        <th className="p-3 w-48">广告授权时间</th>
                        <th className="p-3 w-32">店铺授权</th>
                        <th className="p-3 w-48">店铺授权时间</th>
                        <th className="p-3 text-center w-24 sticky right-0 bg-gray-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
                    </tr>
                </thead>
                {isLoading && groups.length === 0 ? (
                    <tbody><tr><td colSpan={11} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2"/> 数据加载中...</td></tr></tbody>
                ) : groups.length === 0 ? (
                    <tbody><tr><td colSpan={11} className="p-10 text-center text-gray-400">暂无店铺数据 (请尝试调整筛选条件)</td></tr></tbody>
                ) : (
                    groups.map(group => (
                        <tbody key={group.id} className="group-body bg-white border-b border-gray-200">
                            {/* Group Header Row */}
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <td colSpan={11} className="px-3 py-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-6">
                                            <span className="text-gray-500">账号名称: <span className="text-gray-800 font-bold ml-1">{group.groupName}</span></span>
                                            <span className="text-gray-400">区域: {group.region}</span>
                                        </div>
                                        {group.sellerId && (
                                            <span className="text-gray-400 font-mono scale-90 origin-right">Amazon Seller ID: {group.sellerId}</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                            {/* Store Rows */}
                            {group.stores.map(store => (
                                <tr key={store.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100 last:border-0">
                                    <td className="p-3 font-medium text-gray-800">{store.name}</td>
                                    <td className="p-3 flex items-center">
                                        <FlagIcon code={store.countryCode} />
                                        <span>{store.countryName}</span>
                                    </td>
                                    <td className="p-3 text-[10px] text-gray-400 leading-tight">
                                        <div>税号：{store.corpInfo?.tax || '-'}</div>
                                        <div>地址：{store.corpInfo?.address || '-'}</div>
                                    </td>
                                    <td className="p-3 text-gray-400">{store.ioss || '-'}</td>
                                    <td className="p-3 text-gray-400">{store.taxEstimateStatus}</td>
                                    <td className="p-3 text-gray-400">{store.taxRate || '-'}</td>
                                    
                                    {/* Ad Auth Status */}
                                    <td className="p-3">
                                        {store.adAuth.status === 'success' ? (
                                            <span className="text-green-600">授权成功</span>
                                        ) : store.adAuth.status === 'unauthorized' ? (
                                            <span className="text-blue-600 hover:underline cursor-pointer">授权</span>
                                        ) : (
                                            <span className="text-red-500">授权失败/过期</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-[10px] text-gray-500 font-mono">{store.adAuth.time}</td>

                                    {/* Store Auth Status */}
                                    <td className="p-3">
                                        {store.storeAuth.status === 'success' ? (
                                            <span className="text-green-600">授权成功</span>
                                        ) : (
                                            <span className="text-red-500">即将过期</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-[10px] text-gray-500 font-mono">{store.storeAuth.authTime}</td>

                                    {/* Actions */}
                                    <td className="p-3 text-center sticky right-0 bg-white group-hover:bg-blue-50/50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="text-blue-600 hover:underline">店铺授权</button>
                                            <button className="text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded p-0.5"><MoreHorizontal size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    ))
                )}
            </table>
        </div>
        
        {/* 5. Pagination Footer */}
        <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs select-none shrink-0">
            <div className="text-gray-500">
                已选 <span className="font-bold text-gray-900">0</span> 条
            </div>
            <div className="flex items-center gap-4">
                <span className="text-gray-500">授权店铺数：{totalCount}</span>
                <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>&lt;</button>
                    <button className="w-6 h-6 flex items-center justify-center border border-blue-600 bg-blue-600 text-white rounded">1</button>
                    <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 text-gray-600" disabled>&gt;</button>
                </div>
                <select className="border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-600 hover:border-blue-400 cursor-pointer">
                    <option>100条/页</option>
                </select>
                <div className="flex items-center gap-1 text-gray-500">
                    前往 <input type="text" className="w-8 h-5 border border-gray-200 text-center text-xs rounded outline-none focus:border-blue-500" defaultValue="1" /> 页
                </div>
            </div>
        </div>
    </div>
  )
}
