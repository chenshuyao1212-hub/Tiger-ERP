
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  RefreshCw, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  Loader2,
  Clock,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  LayoutGrid,
  FilterX,
  CloudDownload,
  Filter,
  BarChart2,
  User,
  Download,
  ExternalLink,
  Target
} from 'lucide-react';
import { 
  SiteFilterDropdown, 
  ShopFilterDropdown, 
  SalespersonFilterDropdown, 
  DeliveryMethodFilterDropdown
} from '../../components/Filters';
import { ProductTagFilter } from '../../components/ProductTagFilter';

// --- KPI Card Component ---
const RealTimeKpiCard = ({ title, value, yesterday, lastWeek, prefix = '', decimals = 0 }: any) => {
    const formatVal = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    
    const renderTrend = (current: number, past: number) => {
        if (past === 0) {
            if (current === 0) return <span className="text-gray-400 text-[10px]">0%</span>;
            return (
                <div className="flex items-center text-red-500 text-[10px] font-bold">
                    100% <ArrowUp size={10} className="ml-0.5" strokeWidth={3} />
                </div>
            );
        }
        
        const diff = current - past;
        const pct = (Math.abs(diff) / past) * 100;
        const pctStr = pct > 999 ? '>999%' : `${pct.toFixed(0)}%`;
        
        if (diff > 0) {
            return (
                <div className="flex items-center text-red-500 text-[10px] font-bold">
                    {pctStr} <ArrowUp size={10} className="ml-0.5" strokeWidth={3} />
                </div>
            );
        } else if (diff < 0) {
            return (
                <div className="flex items-center text-green-500 text-[10px] font-bold">
                    {pctStr} <ArrowDown size={10} className="ml-0.5" strokeWidth={3} />
                </div>
            );
        } else {
            return <span className="text-gray-400 text-[10px]">0%</span>;
        }
    };

    return (
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-[124px] hover:shadow-md transition-shadow relative group">
            <div>
                <div className="text-xs text-gray-500 mb-1 font-medium">{title}</div>
                <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight mt-1">
                    {prefix}{formatVal(value)}
                </div>
            </div>
            
            <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[11px] leading-none">
                    <div className="flex items-center gap-1 text-gray-400">
                        <span>昨日同时</span>
                        <HelpCircle size={10} className="cursor-help hover:text-gray-600"/>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-500 mr-2 font-mono min-w-[30px] text-right">{prefix}{formatVal(yesterday)}</span>
                        <div className="h-2.5 w-px bg-gray-200 mr-2"></div>
                        <div className="w-12 flex justify-end">
                            {renderTrend(value, yesterday)}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[11px] leading-none">
                    <div className="flex items-center gap-1 text-gray-400">
                        <span>上周同时</span>
                        <HelpCircle size={10} className="cursor-help hover:text-gray-600"/>
                    </div>
                    <div className="flex items-center">
                        <span className="text-gray-500 mr-2 font-mono min-w-[30px] text-right">{prefix}{formatVal(lastWeek)}</span>
                        <div className="h-2.5 w-px bg-gray-200 mr-2"></div>
                        <div className="w-12 flex justify-end">
                            {renderTrend(value, lastWeek)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Reusable Simple Dropdown for Currency ---
const SimpleSelect = ({ value, onChange, options, width }: { value: string, onChange: (val: string) => void, options: string[], width: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => { if(ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    return (
        <div ref={ref} className="relative" style={{ width }}>
            <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between h-8 px-2 border rounded-sm transition-colors text-xs bg-white cursor-pointer select-none ${isOpen ? 'border-blue-500' : 'border-gray-200 hover:border-blue-400 text-gray-600'}`}>
                <span className="truncate">{value || options[0]}</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </div>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-xl rounded z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    {options.map(opt => (
                        <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`px-3 py-2 cursor-pointer text-xs hover:bg-gray-50 transition-colors ${value === opt ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}>{opt}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Resizable Header Component ---
interface ResizableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    width: number;
    minWidth?: number;
    onResize: (width: number) => void;
    onResizeEnd?: () => void;
    className?: string;
    children: React.ReactNode;
    sortKey?: string;
    currentSort?: { key: string, direction: 'ASC' | 'DESC' };
    onSort?: (key: string) => void;
    style?: React.CSSProperties;
}

const ResizableHeader: React.FC<ResizableHeaderProps> = ({ 
    width, 
    minWidth = 40, 
    onResize, 
    onResizeEnd, 
    className, 
    children, 
    style,
    sortKey,
    currentSort,
    onSort,
    ...props 
}) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!onResize) return;
        e.preventDefault();
        e.stopPropagation();
        const startX = e.pageX;
        const startWidth = width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const newWidth = Math.max(minWidth, startWidth + (moveEvent.pageX - startX));
            onResize(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (onResizeEnd) onResizeEnd();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSortClick = () => {
        if (sortKey && onSort) {
            onSort(sortKey);
        }
    };

    return (
        <th 
            className={`relative group/th select-none border-r border-b border-gray-200 ${sortKey ? 'cursor-pointer hover:bg-opacity-80' : ''} ${className}`} 
            style={{ width: width, minWidth: width, maxWidth: width, ...style }} 
            onClick={handleSortClick}
            {...props}
        >
            <div className="w-full h-full overflow-hidden flex items-center justify-between px-2">
                <span className="truncate flex-1">{children}</span>
                {sortKey && (
                    <div className="flex flex-col ml-1 opacity-40">
                        <ArrowUp size={8} className={currentSort?.key === sortKey && currentSort.direction === 'ASC' ? 'text-blue-700 opacity-100' : ''} />
                        <ArrowDown size={8} className={currentSort?.key === sortKey && currentSort.direction === 'DESC' ? 'text-blue-700 opacity-100' : ''} />
                    </div>
                )}
            </div>
            <div 
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 flex justify-center hover:bg-blue-400/20 group-hover/th:opacity-100 opacity-0 transition-opacity"
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="w-px h-full bg-gray-300 group-hover/th:bg-blue-400"></div>
            </div>
        </th>
    );
};

// --- Column Definitions ---
interface ColumnConfig {
  id: string;
  label: string;
  group: string;
  visible: boolean;
  pinned: boolean;
  sortable?: boolean;
  width: number;
}

const INITIAL_COL_CONFIG: ColumnConfig[] = [
  // 基础信息 (Pinned Left)
  { id: 'img', label: '图片', group: '基础信息', visible: true, pinned: true, width: 60 },
  { id: 'store', label: '店铺/站点', group: '基础信息', visible: true, pinned: true, width: 110 },
  { id: 'title_asin', label: '标题/ASIN', group: '基础信息', visible: true, pinned: true, width: 280 },
  { id: 'msku_attr', label: 'MSKU/属性', group: '基础信息', visible: true, pinned: false, width: 180 },
  
  // 站点今日 (实时) - Orange
  { id: 'todaySales', label: '销量', group: '站点今日 (实时)', visible: true, pinned: false, width: 90, sortable: true },
  { id: 'todayOrders', label: '订单量', group: '站点今日 (实时)', visible: true, pinned: false, width: 90, sortable: true },
  { id: 'todayAmount', label: '销售额', group: '站点今日 (实时)', visible: true, pinned: false, width: 120, sortable: true },
  
  // 站点昨日 - Red
  { id: 'yesterdaySales', label: '销量', group: '站点昨日', visible: true, pinned: false, width: 90, sortable: true },
  { id: 'yesterdayOrders', label: '订单量', group: '站点昨日', visible: true, pinned: false, width: 90 },
  { id: 'yesterdayAmount', label: '销售额', group: '站点昨日', visible: true, pinned: false, width: 120 },

  // FBA库存 - Blue
  { id: 'fbaAvailable', label: 'FBA可售', group: 'FBA库存', visible: true, pinned: false, width: 100 },
  { id: 'fbaReserved', label: 'FBA预留', group: 'FBA库存', visible: true, pinned: false, width: 100 },
  { id: 'fbaInbound', label: 'FBA在途', group: 'FBA库存', visible: true, pinned: false, width: 100 },
  { id: 'fbaDays', label: '可售天数', group: 'FBA库存', visible: true, pinned: false, width: 120 },

  // 上周同日 - Purple
  { id: 'lastWeekSales', label: '销量', group: '上周同日', visible: true, pinned: false, width: 90, sortable: true },
  { id: 'lastWeekOrders', label: '订单量', group: '上周同日', visible: true, pinned: false, width: 90 },
  { id: 'lastWeekAmount', label: '销售额', group: '上周同日', visible: true, pinned: false, width: 120 },

  // 去年同日 - Green
  { id: 'lastYearSales', label: '销量', group: '去年同日', visible: true, pinned: false, width: 90, sortable: true },
  { id: 'lastYearOrders', label: '订单量', group: '去年同日', visible: true, pinned: false, width: 90 },
  { id: 'lastYearAmount', label: '销售额', group: '去年同日', visible: true, pinned: false, width: 120 },
];

const INITIAL_GROUP_ORDER = ['基础信息', '站点今日 (实时)', '站点昨日', 'FBA库存', '上周同日', '去年同日'];

// Visual Coding for Groups
const getGroupStyle = (groupName: string) => {
    switch (groupName) {
        case '站点今日 (实时)': return 'bg-orange-50 border-t-orange-400 text-orange-700';
        case '站点昨日': return 'bg-red-50 border-t-red-400 text-red-700';
        case 'FBA库存': return 'bg-blue-50 border-t-blue-400 text-blue-700';
        case '上周同日': return 'bg-purple-50 border-t-purple-400 text-purple-700';
        case '去年同日': return 'bg-green-50 border-t-green-400 text-green-700';
        default: return 'bg-gray-50 border-t-gray-200 text-gray-700';
    }
};

const COLUMN_RENDERERS: Record<string, (item: any) => React.ReactNode> = {
    'img': (item) => (
        <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden mx-auto bg-gray-50 flex items-center justify-center">
            {item.img ? <img src={item.img} className="w-full h-full object-cover" /> : <span className="text-[9px] text-gray-300">No Img</span>}
        </div>
    ),
    'store': (item) => (
        <div className="flex flex-col justify-center h-full w-full overflow-hidden">
            <span className="text-blue-600 hover:underline cursor-pointer font-medium truncate text-[11px] w-full block" title={item.store}>
                {item.store}
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-[10px] w-full overflow-hidden">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.region === 'US' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                <span className="truncate">{item.region}</span>
            </div>
        </div>
    ),
    'title_asin': (item) => (
        <div className="flex flex-col justify-center h-full gap-0.5 w-full overflow-hidden">
            <div className="flex items-center gap-1">
                <div className="text-blue-600 hover:underline cursor-pointer font-bold font-mono text-[11px] truncate" title={item.asin}>{item.asin}</div>
                <ExternalLink size={10} className="text-gray-300 hover:text-blue-600 cursor-pointer"/>
            </div>
            <div className="text-gray-500 text-[10px] leading-tight line-clamp-2" title={item.title}>
                {item.title}
            </div>
        </div>
    ),
    'msku_attr': (item) => (
        <div className="flex flex-col justify-center h-full gap-0.5">
            <div className="font-mono text-gray-700 truncate text-[11px]" title={item.msku}>{item.msku}</div>
            <div className="text-gray-400 text-[10px] truncate">{item.skuName || '-'}</div>
        </div>
    )
};

// Numeric Renderer Factory
const renderNumeric = (val: number, format: 'int' | 'currency' = 'int', colorClass = 'text-gray-900') => {
    if (!val && val !== 0) return <span className="text-gray-300">-</span>;
    if (val === 0) return <span className="text-gray-300">0</span>;
    
    let displayVal = '';
    if (format === 'currency') {
        displayVal = val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return (
            <div className="flex flex-col items-end">
                <span className={`font-mono text-[11px] font-medium ${colorClass}`}>US${displayVal}</span>
            </div>
        );
    } 
    return <span className={`font-mono font-medium ${colorClass}`}>{val.toLocaleString()}</span>;
};

export const RealTime = () => {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState('ASIN');
  const [columns, setColumns] = useState<ColumnConfig[]>(INITIAL_COL_CONFIG);
  const [groupOrder, setGroupOrder] = useState<string[]>(INITIAL_GROUP_ORDER);

  // Column Widths State
  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  const handleColumnResize = (colId: string, newWidth: number) => {
      setColWidths(prev => ({ ...prev, [colId]: newWidth }));
  };
  const handleColumnResizeEnd = () => console.log('Resize end');

  // Filters State
  const [resetKey, setResetKey] = useState(0);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterCurrency, setFilterCurrency] = useState<string>('原币种');
  const [filterSalespersons, setFilterSalespersons] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string | null>(null);
  
  // Toolbar States
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('ASIN');
  const [compareYesterday, setCompareYesterday] = useState(false);
  const [groupByAsin, setGroupByAsin] = useState(false);
  const [hideZero, setHideZero] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ASC' | 'DESC' }>({ key: 'todaySales', direction: 'DESC' });

  const fetchData = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/realtime/data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sites: selectedSites,
                  shops: selectedShops,
                  salespersons: filterSalespersons,
                  dimension: activeTab,
                  searchContent: searchText,
                  sortKey: sortConfig.key,
                  sortDir: sortConfig.direction
              })
          });
          if (res.ok) {
              const result = await res.json();
              if (result.success) {
                  setData(result.rows || []);
                  setSummary(result.summary);
              }
          }
      } catch (e) {
          console.error("Fetch failed", e);
      } finally {
          setLastUpdate(new Date());
          setLoading(false);
      }
  };

  const handleSync = async () => {
      setIsSyncing(true);
      try {
          const res = await fetch('/api/orders/sync', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ minutes: 1440 }) 
          });
          const result = await res.json();
          if (result.success) {
              fetchData();
          } else {
              alert("同步失败，请稍后重试");
          }
      } catch (e) {
          alert("网络请求失败");
      } finally {
          setIsSyncing(false);
      }
  };

  useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 60000); 
      return () => clearInterval(interval);
  }, [selectedSites, selectedShops, filterSalespersons, activeTab, sortConfig]);

  const handleSort = (key: string) => {
      setSortConfig(prev => {
          if (prev.key === key) {
              return { key, direction: prev.direction === 'ASC' ? 'DESC' : 'ASC' };
          }
          return { key, direction: 'DESC' };
      });
  };

  const handleReset = () => {
      setResetKey(prev => prev + 1);
      setFilterTags([]);
      setFilterCurrency('原币种');
      setFilterSalespersons([]);
      setSelectedSites([]);
      setSelectedShops([]);
      setSelectedDeliveryMethod(null);
      setSearchText('');
      setSortConfig({ key: 'todaySales', direction: 'DESC' });
      setCompareYesterday(false);
      setGroupByAsin(false);
      setHideZero(false);
  };

  // --- KPI Data Preparation ---
  const kpiData = useMemo(() => {
      const s = summary || {
          sales: { value: 0, yesterday: 0, lastWeek: 0 },
          orders: { value: 0, yesterday: 0, lastWeek: 0 },
          amount: { value: 0, yesterday: 0, lastWeek: 0 },
          avgPrice: { value: 0, yesterday: 0, lastWeek: 0 },
          cancelled: { value: 0, yesterday: 0, lastWeek: 0 }
      };

      const calcAvg = (amt: number, qty: number) => qty > 0 ? amt / qty : 0;

      return [
          { title: '销量', value: s.sales.value, yesterday: s.sales.yesterday, lastWeek: s.sales.lastWeek, decimals: 0 },
          { title: '销售额', value: s.amount.value, yesterday: s.amount.yesterday, lastWeek: s.amount.lastWeek, prefix: 'US$', decimals: 2 },
          { title: '订单量', value: s.orders.value, yesterday: s.orders.yesterday, lastWeek: s.orders.lastWeek, decimals: 0 },
          { title: '商品均价', value: calcAvg(s.amount.value, s.sales.value), yesterday: calcAvg(s.amount.yesterday, s.sales.yesterday), lastWeek: calcAvg(s.amount.lastWeek, s.sales.lastWeek), prefix: 'US$', decimals: 2 },
          { title: '取消订单数', value: s.cancelled.value, yesterday: s.cancelled.yesterday, lastWeek: s.cancelled.lastWeek, decimals: 0 }
      ];
  }, [summary]);

  // --- Calculate Table Segments ---
  const { pinnedColumns, unpinnedBasicInfo, pinnedGroups, unpinnedGroups } = useMemo(() => {
      const basicCols = columns.filter(c => c.group === '基础信息' && c.visible);
      const pinnedBasic = basicCols.filter(c => c.pinned);
      const unpinnedBasic = basicCols.filter(c => !c.pinned);

      const pGroups: { name: string, columns: ColumnConfig[] }[] = [];
      const upGroups: { name: string, columns: ColumnConfig[] }[] = [];

      groupOrder.forEach(gName => {
          if (gName === '基础信息') return;
          const gCols = columns.filter(c => c.group === gName && c.visible);
          if (gCols.length === 0) return;

          const isPinned = gCols.every(c => c.pinned);
          if (isPinned) pGroups.push({ name: gName, columns: gCols });
          else upGroups.push({ name: gName, columns: gCols });
      });

      return { pinnedColumns: pinnedBasic, unpinnedBasicInfo: unpinnedBasic, pinnedGroups: pGroups, unpinnedGroups: upGroups };
  }, [columns, groupOrder]);

  const CHECKBOX_WIDTH = 40;
  
  const getStickyLeft = (type: 'col' | 'group', index: number) => {
      let left = CHECKBOX_WIDTH;
      for (let i = 0; i < pinnedColumns.length; i++) {
          if (type === 'col' && index === i) return left;
          left += (colWidths[pinnedColumns[i].id] || pinnedColumns[i].width);
      }
      for (let i = 0; i < pinnedGroups.length; i++) {
          if (type === 'group' && index === i) return left;
          pinnedGroups[i].columns.forEach(c => left += (colWidths[c.id] || c.width));
      }
      return left;
  };

  const getPinnedGroupColLeft = (groupIndex: number, colIndex: number) => {
      let left = CHECKBOX_WIDTH;
      pinnedColumns.forEach(c => left += (colWidths[c.id] || c.width));
      for(let i=0; i<groupIndex; i++) {
          pinnedGroups[i].columns.forEach(c => left += (colWidths[c.id] || c.width));
      }
      for(let i=0; i<colIndex; i++) {
          left += (colWidths[pinnedGroups[groupIndex].columns[i].id] || pinnedGroups[groupIndex].columns[i].width);
      }
      return left;
  };

  const tableWidth = useMemo(() => {
      const colsWidth = columns.filter(c => c.visible).reduce((acc, col) => {
          return acc + (colWidths[col.id] || col.width);
      }, 0);
      return CHECKBOX_WIDTH + colsWidth;
  }, [columns, colWidths]);

  // Total Calculation Helper
  const calcTotal = (key: string) => {
      return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* GLOBAL FILTER BAR */}
      <div className="h-12 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-2">
              <SiteFilterDropdown key={`site-${resetKey}`} onChange={setSelectedSites} width="160px" />
              <ShopFilterDropdown key={`shop-${resetKey}`} onChange={setSelectedShops} returnField="name" width="130px" />
              <DeliveryMethodFilterDropdown key={`dm-${resetKey}`} onChange={setSelectedDeliveryMethod} width="100px" />
              <ProductTagFilter key={`tag-${resetKey}`} onChange={setFilterTags} width="120px"/>
              <SimpleSelect value={filterCurrency} onChange={setFilterCurrency} options={['原币种', 'CNY', 'USD', 'EUR']} width="80px" />
              <SalespersonFilterDropdown key={`sp-${resetKey}`} onChange={setFilterSalespersons} width="130px" />
              <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:text-blue-600 transition-colors ml-1">
                  <Filter size={12} className="fill-gray-100" /> 重置
              </button>
          </div>
          <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">分时趋势</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">统计设置</button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden w-full min-h-0 bg-gray-50/30">
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4 mb-0 shrink-0">
              {kpiData.map((kpi, idx) => <RealTimeKpiCard key={idx} {...kpi} />)}
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col min-h-0 relative">
              
              {/* UPDATED Toolbar */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                      {/* Radio Group for Tabs */}
                      <div className="flex rounded border border-gray-300 overflow-hidden">
                          {['ASIN', '父ASIN', 'MSKU', 'SKU'].map((tab) => (
                              <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab)}
                                  className={`px-4 py-1.5 text-xs font-medium border-r border-gray-300 last:border-r-0 transition-colors
                                      ${activeTab === tab 
                                          ? 'bg-white text-blue-600 shadow-[inset_0_0_0_1px_#3b82f6] z-10' 
                                          : 'bg-white text-gray-600 hover:text-blue-600'
                                      }`}
                              >
                                  {tab}
                              </button>
                          ))}
                      </div>

                      {/* Search Input Composite */}
                      <div className="flex items-center h-8">
                           <div className="relative h-full">
                               <div className="h-full flex items-center border border-r-0 border-gray-300 rounded-l px-2 bg-white hover:border-gray-400 cursor-pointer min-w-[80px] justify-between group">
                                   <span className="text-xs text-gray-600">{searchType}</span>
                                   <ChevronDown size={12} className="text-gray-400" />
                               </div>
                           </div>
                           <input 
                              type="text" 
                              className="h-full w-64 border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:z-10 transition-colors"
                              placeholder="搜索内容"
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                           />
                           <button 
                              className="h-full px-3 border border-l-0 border-gray-300 rounded-r bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                              onClick={() => fetchData()}
                           >
                               <Search size={14} />
                           </button>
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                      {/* Checkboxes */}
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked={compareYesterday} onChange={e => setCompareYesterday(e.target.checked)} />
                          <span className="text-xs text-gray-700">环比昨日</span>
                          <HelpCircle size={12} className="text-gray-400" />
                      </label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked={groupByAsin} onChange={e => setGroupByAsin(e.target.checked)} />
                          <span className="text-xs text-gray-700">按ASIN汇总</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked={hideZero} onChange={e => setHideZero(e.target.checked)} />
                          <span className="text-xs text-gray-700">隐藏今日销量为0数据</span>
                          <HelpCircle size={12} className="text-gray-400" />
                      </label>

                      <div className="h-4 w-px bg-gray-300 mx-1"></div>

                      {/* Icon Buttons */}
                      <div className="flex items-center gap-1">
                          <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="自定义列">
                              <Settings size={14} />
                              <span>自定义列</span>
                          </button>
                          <div className="h-4 w-px bg-gray-300 mx-1"></div>
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="历史"><Clock size={16} /></button>
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="刷新" onClick={() => fetchData()}>
                              <RefreshCw size={16} className={isSyncing ? "animate-spin text-blue-600" : ""} />
                          </button>
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="导出"><Download size={16} /></button>
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors" title="帮助"><HelpCircle size={16} /></button>
                      </div>
                  </div>
              </div>

              {/* Super Table */}
              <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <table className="text-xs text-left border-separate border-spacing-0 table-fixed" style={{ width: tableWidth }}>
                      <thead className="text-gray-600 font-medium sticky top-0 z-40 bg-gray-50 shadow-sm">
                          {/* Group Headers (Row 1) */}
                          <tr className="h-7">
                              <th rowSpan={2} className="sticky left-0 z-[60] bg-gray-50 border-r border-b border-gray-200 text-center" style={{ width: CHECKBOX_WIDTH }}><input type="checkbox" className="rounded border-gray-400" /></th>
                              
                              {/* Pinned Individual Columns (Row 1+2 merge) */}
                              {pinnedColumns.map((col, idx) => {
                                  const width = colWidths[col.id] || col.width;
                                  return (
                                      <ResizableHeader 
                                        key={col.id} 
                                        width={width}
                                        onResize={(w) => handleColumnResize(col.id, w)}
                                        onResizeEnd={handleColumnResizeEnd}
                                        rowSpan={2} 
                                        className="sticky z-[60] bg-gray-50 border-r border-b border-gray-200 px-2 whitespace-nowrap" 
                                        style={{ left: getStickyLeft('col', idx) }}
                                        sortKey={col.sortable ? col.id : undefined}
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                      >
                                          {col.label}
                                      </ResizableHeader>
                                  );
                              })}

                              {/* Pinned Groups (Row 1) */}
                              {pinnedGroups.map((group, idx) => (
                                  <th key={group.name} colSpan={group.columns.length} className={`sticky z-[60] text-center border-r border-b border-gray-200 text-[11px] whitespace-nowrap font-bold border-t-[3px] ${getGroupStyle(group.name)}`} style={{ left: getStickyLeft('group', idx) }}>{group.name}</th>
                              ))}

                              {/* Unpinned Individual Columns (Row 1+2 merge) */}
                              {unpinnedBasicInfo.map(col => {
                                  const width = colWidths[col.id] || col.width;
                                  return <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} rowSpan={2} className="border-r border-b border-gray-200 bg-gray-50 px-2 whitespace-nowrap" sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>;
                              })}

                              {/* Unpinned Groups (Row 1) */}
                              {unpinnedGroups.map(group => <th key={group.name} colSpan={group.columns.length} className={`text-center border-r border-b border-gray-200 text-[11px] whitespace-nowrap font-bold border-t-[3px] ${getGroupStyle(group.name)}`}>{group.name}</th>)}
                          </tr>

                          {/* Metric Headers (Row 2) */}
                          <tr className="h-8 text-[11px]">
                              {pinnedGroups.map((group, gIdx) => (
                                  group.columns.map((col, cIdx) => {
                                      const width = colWidths[col.id] || col.width;
                                      return (
                                          <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} className={`sticky z-50 px-3 text-right border-r border-b border-gray-200 font-normal whitespace-nowrap bg-white text-gray-600`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }} sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>
                                      );
                                  })
                              ))}
                              {unpinnedGroups.map(group => (
                                  group.columns.map(col => {
                                      const width = colWidths[col.id] || col.width;
                                      return (
                                          <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} className={`px-3 text-right border-r border-b border-gray-200 font-normal whitespace-nowrap bg-white text-gray-600`} sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>
                                      );
                                  })
                              ))}
                          </tr>
                      </thead>
                      <tbody className="bg-white text-gray-700 font-sans text-[11px]">
                          {loading && data.length === 0 ? (
                              <tr><td colSpan={100} className="p-20 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> 加载数据中...</td></tr>
                          ) : data.length === 0 ? (
                              <tr><td colSpan={100} className="p-20 text-center text-gray-400">暂无数据</td></tr>
                          ) : (
                              data.map((item, idx) => (
                                  <tr key={idx} className="group hover:bg-blue-50 transition-colors h-[52px] border-b border-gray-100">
                                      <td className="text-center sticky left-0 z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" /></td>
                                      
                                      {/* Pinned Individual Cells */}
                                      {pinnedColumns.map((col, cIdx) => (
                                          <td key={col.id} className={`px-3 py-1 sticky z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100`} style={{ left: getStickyLeft('col', cIdx) }}>
                                              {COLUMN_RENDERERS[col.id] ? COLUMN_RENDERERS[col.id](item) : item[col.id]}
                                          </td>
                                      ))}

                                      {/* Pinned Group Cells */}
                                      {pinnedGroups.map((group, gIdx) => (
                                          group.columns.map((col, cIdx) => {
                                              const isCurrency = col.id.includes('Amount');
                                              const colorClass = col.id.includes('Sales') ? 'text-gray-900 font-bold' : (isCurrency ? 'text-orange-600' : 'text-gray-600');
                                              return (
                                                  <td key={col.id} className={`px-3 text-right sticky z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100 tabular-nums`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }}>
                                                      {renderNumeric(item[col.id], isCurrency ? 'currency' : 'int', colorClass)}
                                                  </td>
                                              );
                                          })
                                      ))}

                                      {/* Unpinned Individual Cells */}
                                      {unpinnedBasicInfo.map(col => (
                                          <td key={col.id} className="px-3 border-r border-b border-gray-100">
                                              {COLUMN_RENDERERS[col.id] ? COLUMN_RENDERERS[col.id](item) : item[col.id]}
                                          </td>
                                      ))}

                                      {/* Unpinned Group Cells */}
                                      {unpinnedGroups.map(group => (
                                          group.columns.map(col => {
                                              const isCurrency = col.id.includes('Amount');
                                              const colorClass = col.id.includes('Sales') ? 'text-gray-900 font-bold' : (isCurrency ? 'text-orange-600' : 'text-gray-600');
                                              return (
                                                  <td key={col.id} className="px-3 text-right border-r border-b border-gray-100 tabular-nums">
                                                      {renderNumeric(item[col.id], isCurrency ? 'currency' : 'int', colorClass)}
                                                  </td>
                                              );
                                          })
                                      ))}
                                  </tr>
                              ))
                          )}
                      </tbody>
                      
                      {/* Sticky Footer */}
                      <tfoot className="bg-white sticky bottom-0 z-40 border-t-2 border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-[11px] font-bold text-gray-800">
                          <tr className="h-10 bg-white">
                              <td className="sticky left-0 bg-white z-50 border-r border-gray-100"></td>
                              {pinnedColumns.map((col, cIdx) => (
                                  <td key={col.id} className={`sticky bg-white z-50 border-r border-gray-100 px-3 text-center`} style={{ left: getStickyLeft('col', cIdx) }}>
                                      {col.id === 'store' ? '本页汇总' : ''}
                                  </td>
                              ))}
                              {pinnedGroups.map((group, gIdx) => (
                                  group.columns.map((col, cIdx) => {
                                      const isCurrency = col.id.includes('Amount');
                                      return (
                                          <td key={col.id} className={`sticky bg-blue-50 z-50 border-r border-gray-100 text-right px-3`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }}>
                                              {renderNumeric(calcTotal(col.id), isCurrency ? 'currency' : 'int')}
                                          </td>
                                      );
                                  })
                              ))}
                              {unpinnedBasicInfo.map(col => <td key={col.id} className="border-r border-gray-100"></td>)}
                              {unpinnedGroups.map(group => (
                                  group.columns.map(col => {
                                      const isCurrency = col.id.includes('Amount');
                                      return (
                                          <td key={col.id} className="px-3 text-right border-r border-gray-100">
                                              {renderNumeric(calcTotal(col.id), isCurrency ? 'currency' : 'int')}
                                          </td>
                                      );
                                  })
                              ))}
                          </tr>
                      </tfoot>
                  </table>
              </div>
              
              <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs text-gray-500 select-none shrink-0">
                  <div>显示第 1 到 {data.length} 条记录，共 {data.length} 条</div>
                  <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-1">
                          <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&lt;</button>
                          <button className="w-6 h-6 flex items-center justify-center border border-blue-600 bg-blue-600 text-white rounded shadow-sm">1</button>
                          <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>&gt;</button>
                      </div>
                      <select className="border border-gray-200 rounded px-2 py-1 outline-none text-gray-600 hover:border-blue-400 cursor-pointer bg-white">
                          <option>100条/页</option>
                      </select>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
