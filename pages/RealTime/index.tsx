
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
  Download
} from 'lucide-react';
import { 
  SiteFilterDropdown, 
  ShopFilterDropdown, 
  SalespersonFilterDropdown, 
  DeliveryMethodFilterDropdown
} from '../../components/Filters';
import { ProductTagFilter } from '../../components/ProductTagFilter';

// --- KPI Card Component (New) ---
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
}

const ResizableHeader: React.FC<ResizableHeaderProps> = ({ 
    width, 
    minWidth = 30, 
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
            className={`relative group/th select-none border-r border-gray-300 ${sortKey ? 'cursor-pointer hover:bg-gray-100' : ''} ${className}`} 
            style={{ width: width, minWidth: width, maxWidth: width, ...style }} 
            onClick={handleSortClick}
            {...props}
        >
            <div className="w-full h-full overflow-hidden flex items-center justify-between px-1">
                <span className="truncate flex-1">{children}</span>
                {sortKey && (
                    <div className="flex flex-col ml-1 opacity-50">
                        <ArrowUp size={8} className={currentSort?.key === sortKey && currentSort.direction === 'ASC' ? 'text-blue-600 opacity-100' : ''} />
                        <ArrowDown size={8} className={currentSort?.key === sortKey && currentSort.direction === 'DESC' ? 'text-blue-600 opacity-100' : ''} />
                    </div>
                )}
            </div>
            <div 
                className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 flex justify-center hover:bg-blue-400/20 group-hover/th:opacity-100 opacity-0 transition-opacity"
                onMouseDown={handleMouseDown}
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="w-px h-full bg-gray-400 group-hover/th:bg-blue-400"></div>
            </div>
        </th>
    );
};

interface ColumnConfig {
  id: string;
  label: string;
  group: string;
  visible: boolean;
  pinned: boolean;
  sortable?: boolean;
}

const INITIAL_COL_CONFIG: ColumnConfig[] = [
  // 基础信息
  { id: 'img', label: '图片', group: '基础信息', visible: true, pinned: true },
  { id: 'title_asin', label: '标题/ASIN', group: '基础信息', visible: true, pinned: true },
  { id: 'analysis', label: '分析', group: '基础信息', visible: true, pinned: false },
  { id: 'msku_attr', label: 'MSKU/属性', group: '基础信息', visible: true, pinned: false },
  { id: 'sku_name', label: '品名/SKU', group: '基础信息', visible: true, pinned: false },
  { id: 'store', label: '店铺/站点', group: '基础信息', visible: true, pinned: true },
  { id: 'tags', label: '产品标签', group: '基础信息', visible: true, pinned: false },
  { id: 'salesperson', label: '业务员', group: '基础信息', visible: true, pinned: false },
  { id: 'trend', label: '销量趋势', group: '基础信息', visible: true, pinned: false },
  { id: 'rank_main', label: '大类目排名', group: '基础信息', visible: true, pinned: false },
  { id: 'rank_sub', label: '小类目排名', group: '基础信息', visible: true, pinned: false },
  { id: 'sales_7d', label: '7天销量', group: '基础信息', visible: false, pinned: false },
  { id: 'sales_14d', label: '14天销量', group: '基础信息', visible: false, pinned: false },
  { id: 'sales_30d', label: '30天销量', group: '基础信息', visible: false, pinned: false },

  // FBA库存
  { id: 'fbaDays', label: 'FBA可售天数', group: 'FBA库存', visible: true, pinned: false },
  { id: 'fbaAvailable', label: 'FBA可售', group: 'FBA库存', visible: true, pinned: false },
  { id: 'fbaReserved', label: 'FBA预留', group: 'FBA库存', visible: true, pinned: false },
  { id: 'fbaInbound', label: 'FBA在途', group: 'FBA库存', visible: true, pinned: false },
  
  // 站点今日 (实时) - Sortable
  { id: 'todaySales', label: '销量 (有效)', group: '站点今日 (实时)', visible: true, pinned: false, sortable: true },
  { id: 'todayOrders', label: '订单量', group: '站点今日 (实时)', visible: true, pinned: false, sortable: true },
  { id: 'todayAmount', label: '销售额', group: '站点今日 (实时)', visible: true, pinned: false, sortable: true },
  
  // 站点昨日
  { id: 'yesterdaySales', label: '销量', group: '站点昨日', visible: true, pinned: false, sortable: true },
  { id: 'yesterdayOrders', label: '订单量', group: '站点昨日', visible: true, pinned: false },
  { id: 'yesterdayAmount', label: '销售额', group: '站点昨日', visible: true, pinned: false },

  // 上周同日
  { id: 'lastWeekSales', label: '销量', group: '上周同日', visible: true, pinned: false, sortable: true },
  { id: 'lastWeekOrders', label: '订单量', group: '上周同日', visible: true, pinned: false },
  { id: 'lastWeekAmount', label: '销售额', group: '上周同日', visible: true, pinned: false },
];

const INITIAL_GROUP_ORDER = ['基础信息', 'FBA库存', '站点今日 (实时)', '站点昨日', '上周同日'];

const COLUMN_DEFS: Record<string, { width: number, align?: 'left'|'center'|'right', render: (item: any) => React.ReactNode }> = {
    'img': { width: 48, align: 'center', render: (item) => <div className="w-8 h-8 border border-gray-200 rounded overflow-hidden mx-auto bg-gray-50 relative group/img"><img src={item.img} className="w-full h-full object-cover" /></div> },
    'title_asin': { width: 120, align: 'left', render: (item) => (<div className="flex flex-col justify-center h-full gap-0.5 w-full overflow-hidden"><div className="text-blue-600 hover:underline cursor-pointer font-bold font-mono text-[11px] truncate w-full block" title={item.asin}>{item.asin}</div><div className="text-gray-700 truncate text-[10px] w-full block" title={item.title}>{item.title}</div></div>) },
    'store': { width: 100, align: 'left', render: (item) => (<div className="flex flex-col justify-center h-full w-full overflow-hidden"><span className="text-blue-600 hover:underline cursor-pointer font-medium truncate text-[11px] w-full block" title={item.store}>{item.store}</span><div className="flex items-center gap-1 mt-0.5 text-gray-400 text-[10px] w-full overflow-hidden"><span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span><span className="truncate">{item.region}</span></div></div>) },
    'analysis': { width: 40, align: 'center', render: () => <BarChart2 size={14} className="text-blue-600 inline cursor-pointer"/> },
    'msku_attr': { width: 110, align: 'left', render: (item) => <div className="font-mono text-gray-600 truncate text-[11px] w-full block" title={item.msku}>{item.msku}</div> },
    'sku_name': { width: 110, align: 'left', render: (item) => <div className="text-gray-600 truncate text-[11px] w-full block" title={item.skuName}>{item.skuName}</div> },
    'tags': { width: 80, align: 'left', render: (item) => (<div className="flex gap-1 flex-wrap overflow-hidden h-full items-center w-full">{item.tags && item.tags.map ? item.tags.map((t: string, i: number) => <span key={i} className="text-[9px] px-1 bg-gray-100 text-gray-500 rounded border border-gray-200 whitespace-nowrap">{t}</span>) : null}</div>) },
    'salesperson': { width: 80, align: 'left', render: (item) => <div className="text-gray-600 flex items-center gap-1 text-[11px] truncate w-full block"><User size={10} className="text-gray-400 shrink-0"/> {item.salesperson}</div> },
    'trend': { width: 100, align: 'center', render: (item) => <div className="flex justify-center items-center h-full"><Sparkline data={item.trend} /></div> },
    'fbaDays': { width: 90, align: 'right', render: (item) => <span className="tabular-nums text-gray-600">{item.fbaDays}</span> },
    'fbaAvailable': { width: 70, align: 'right', render: (item) => <span className="tabular-nums text-gray-600">{item.fbaAvailable}</span> },
    'todaySales': { width: 60, align: 'right', render: (item) => <span className="tabular-nums font-bold text-gray-900">{item.todaySales}</span> },
    'todayOrders': { width: 60, align: 'right', render: (item) => <span className="tabular-nums text-gray-700">{item.todayOrders}</span> },
    'todayAmount': { width: 80, align: 'right', render: (item) => <span className="tabular-nums text-orange-600 font-medium text-[10px]">{item.todayAmount?.toFixed(2)}</span> },
};

const Sparkline = ({ data, color = "#3b82f6" }: { data: number[], color?: string }) => {
    if (!data || data.length === 0) return <div className="h-6 w-16 bg-gray-50 rounded"></div>;
    const height = 24;
    const width = 64;
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * (height - 4) - 2; 
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} className="overflow-visible">
            <path d={`M${points}`} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length-1] - min) / range) * (height - 4) - 2} r="2" fill={color} />
        </svg>
    );
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
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

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
  
  // Search & Sort State
  const [searchText, setSearchText] = useState('');
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
          {
              title: '销量',
              value: s.sales.value,
              yesterday: s.sales.yesterday,
              lastWeek: s.sales.lastWeek,
              decimals: 0
          },
          {
              title: '销售额',
              value: s.amount.value,
              yesterday: s.amount.yesterday,
              lastWeek: s.amount.lastWeek,
              prefix: 'US$',
              decimals: 2
          },
          {
              title: '订单量',
              value: s.orders.value,
              yesterday: s.orders.yesterday,
              lastWeek: s.orders.lastWeek,
              decimals: 0
          },
          {
              title: '商品均价',
              value: calcAvg(s.amount.value, s.sales.value),
              yesterday: calcAvg(s.amount.yesterday, s.sales.yesterday),
              lastWeek: calcAvg(s.amount.lastWeek, s.sales.lastWeek),
              prefix: 'US$',
              decimals: 2
          },
          {
              title: '取消订单数',
              value: s.cancelled.value,
              yesterday: s.cancelled.yesterday,
              lastWeek: s.cancelled.lastWeek,
              decimals: 0
          }
      ];
  }, [summary]);

  // --- Calculate Table Segments ---
  const { pinnedColumns, unpinnedBasicInfo, pinnedGroups, unpinnedGroups } = useMemo(() => {
      const basicCols = columns.filter(c => c.group === '基础信息');
      const pinnedBasic = basicCols.filter(c => c.pinned && c.visible);
      const unpinnedBasic = basicCols.filter(c => !c.pinned && c.visible);

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

  const CHECKBOX_WIDTH = 32;
  const getStickyLeft = (type: 'col' | 'group', index: number) => {
      let left = CHECKBOX_WIDTH;
      for (let i = 0; i < pinnedColumns.length; i++) {
          if (type === 'col' && index === i) return left;
          const w = colWidths[pinnedColumns[i].id] || COLUMN_DEFS[pinnedColumns[i].id]?.width || 100;
          left += w;
      }
      for (let i = 0; i < pinnedGroups.length; i++) {
          const group = pinnedGroups[i];
          if (type === 'group' && index === i) return left;
          const groupWidth = group.columns.reduce((acc, c) => acc + (colWidths[c.id] || COLUMN_DEFS[c.id]?.width || 80), 0);
          left += groupWidth;
      }
      return left;
  };

  const getPinnedGroupColLeft = (groupIndex: number, colIndex: number) => {
      let left = CHECKBOX_WIDTH;
      pinnedColumns.forEach(c => left += (colWidths[c.id] || COLUMN_DEFS[c.id]?.width || 100));
      for(let i=0; i<groupIndex; i++) {
          pinnedGroups[i].columns.forEach(c => left += (colWidths[c.id] || COLUMN_DEFS[c.id]?.width || 80));
      }
      for(let i=0; i<colIndex; i++) {
          const c = pinnedGroups[groupIndex].columns[i];
          left += (colWidths[c.id] || COLUMN_DEFS[c.id]?.width || 80);
      }
      return left;
  };

  const tableWidth = useMemo(() => {
      const checkboxWidth = 32;
      const actionsWidth = 64;
      const colsWidth = columns.filter(c => c.visible).reduce((acc, col) => {
          return acc + (colWidths[col.id] || COLUMN_DEFS[col.id]?.width || 100);
      }, 0);
      return checkboxWidth + actionsWidth + colsWidth;
  }, [columns, colWidths]);

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 
        ================================================================
        GLOBAL FILTER & CONTROL BAR (New Design) 
        ================================================================
      */}
      <div className="h-12 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0 z-20 relative">
          
          {/* Left: Filter Group */}
          <div className="flex items-center gap-2">
              <SiteFilterDropdown key={`site-${resetKey}`} onChange={setSelectedSites} width="160px" />
              <ShopFilterDropdown key={`shop-${resetKey}`} onChange={setSelectedShops} returnField="name" width="130px" />
              <DeliveryMethodFilterDropdown key={`dm-${resetKey}`} onChange={setSelectedDeliveryMethod} width="100px" />
              
              <ProductTagFilter 
                  key={`tag-${resetKey}`}
                  onChange={setFilterTags} 
                  width="120px"
              />
              
              <SimpleSelect 
                  value={filterCurrency} 
                  onChange={setFilterCurrency} 
                  options={['原币种', 'CNY', 'USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD']} 
                  width="80px" 
              />
              
              <SalespersonFilterDropdown key={`sp-${resetKey}`} onChange={setFilterSalespersons} width="130px" />
              
              {/* Reset Button */}
              <button 
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:text-blue-600 transition-colors ml-1"
                  title="重置筛选"
              >
                  <Filter size={12} className="fill-gray-100" /> 重置
              </button>
          </div>

          {/* Right: Operation Group */}
          <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">
                  分时趋势
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">
                  统计设置
              </button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">
                  隐藏统计
              </button>
          </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden w-full min-h-0 bg-gray-50/30">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-5 gap-4 mb-0 shrink-0">
              {kpiData.map((kpi, idx) => (
                  <RealTimeKpiCard key={idx} {...kpi} />
              ))}
          </div>

          {/* Table Area */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col min-h-0 relative">
              
              {/* Table Toolbar (Tabs & Search) */}
              <div className="px-4 py-2 border-b border-gray-200 bg-white flex justify-between items-center shrink-0 h-10">
                  <div className="flex items-center gap-2">
                      {/* Tabs */}
                      <div className="flex gap-4 mr-4">
                          {['ASIN', '父ASIN', 'MSKU', 'SKU'].map(tab => (
                              <button 
                                key={tab} 
                                onClick={() => setActiveTab(tab)} 
                                className={`text-xs font-bold transition-colors border-b-2 pb-2 -mb-2.5 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                              >
                                {tab}
                              </button>
                          ))}
                      </div>
                      
                      <div className="h-4 w-px bg-gray-200 mx-2"></div>

                      {/* Search */}
                      <div className="flex items-center border border-gray-200 rounded-sm h-7 hover:border-blue-400 transition-colors bg-white w-64">
                        <div className="relative h-full flex-1 flex items-center px-2">
                            <LayoutGrid size={12} className="text-gray-300 mr-2 shrink-0" />
                            <input 
                                type="text" 
                                className="w-full text-xs outline-none text-gray-700 bg-transparent placeholder:text-gray-300 h-full" 
                                placeholder="搜索 ASIN/SKU/标题" 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') fetchData(); }}
                            />
                        </div>
                        <div className="h-full w-7 flex items-center justify-center border-l border-gray-200 cursor-pointer hover:bg-gray-50 text-gray-500 hover:text-blue-600" onClick={() => fetchData()}>
                            <Search size={12} />
                        </div>
                      </div>
                  </div>

                  {/* Sync & Tools */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                          <Clock size={10} className="text-gray-400"/> 
                          <span className="font-mono text-[10px]">{lastUpdate.toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={handleSync} 
                        disabled={isSyncing}
                        className={`hover:text-blue-600 transition-colors ${isSyncing ? 'animate-spin text-blue-600' : ''}`}
                        title="同步"
                      >
                          <CloudDownload size={14} />
                      </button>
                      <button className="hover:text-blue-600 transition-colors" title="下载"><Download size={14} /></button>
                      <button className="hover:text-blue-600 transition-colors" title="设置"><Settings size={14} /></button>
                  </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                  <table className="text-xs text-left border-separate border-spacing-0 table-fixed" style={{ width: tableWidth }}>
                      <thead className="text-gray-600 font-medium sticky top-0 z-40 bg-gray-50 shadow-sm">
                          <tr className="h-8">
                              <th rowSpan={2} className="sticky left-0 z-50 bg-gray-50 border-r border-b border-gray-100 w-8 text-center" style={{ width: 32 }}><input type="checkbox" className="rounded border-gray-400" /></th>
                              {pinnedColumns.map((col, idx) => {
                                  if (col.id === 'img') return <th key={col.id} rowSpan={2} className="sticky z-50 bg-gray-50 border-r border-b border-gray-300 px-2 whitespace-nowrap" style={{ left: getStickyLeft('col', idx), width: 48, minWidth: 48, maxWidth: 48 }}>{col.label}</th>;
                                  const def = COLUMN_DEFS[col.id] || { width: 100, align: 'left' };
                                  const width = colWidths[col.id] || def.width;
                                  return (
                                      <ResizableHeader 
                                        key={col.id} 
                                        width={width}
                                        onResize={(w) => handleColumnResize(col.id, w)}
                                        onResizeEnd={handleColumnResizeEnd}
                                        rowSpan={2} 
                                        className="sticky z-50 bg-gray-50 border-r border-b border-gray-300 px-2 whitespace-nowrap" 
                                        style={{ left: getStickyLeft('col', idx) }}
                                        sortKey={col.sortable ? col.id : undefined}
                                        currentSort={sortConfig}
                                        onSort={handleSort}
                                      >
                                          {col.label}
                                      </ResizableHeader>
                                  );
                              })}
                              {pinnedGroups.map((group, idx) => (
                                  <th key={group.name} colSpan={group.columns.length} className={`sticky z-50 text-center border-r border-b border-gray-300 text-[11px] whitespace-nowrap bg-blue-50 text-blue-700 font-bold border-t-2 border-t-blue-500`} style={{ left: getStickyLeft('group', idx) }}>{group.name} (固定)</th>
                              ))}
                              {unpinnedBasicInfo.map(col => {
                                  const def = COLUMN_DEFS[col.id] || { width: 100, align: 'left' };
                                  const width = colWidths[col.id] || def.width;
                                  return (
                                      <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} rowSpan={2} className="border-r border-b border-gray-300 bg-gray-50 px-2 whitespace-nowrap" sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>
                                  );
                              })}
                              {unpinnedGroups.map(group => <th key={group.name} colSpan={group.columns.length} className={`text-center border-r border-b border-gray-300 text-[11px] whitespace-nowrap bg-gray-50 text-gray-700`}>{group.name}</th>)}
                              <th rowSpan={2} className="text-center sticky right-0 z-50 bg-gray-50 border-l border-b border-gray-300 w-16 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap" style={{ width: 64 }}>操作</th>
                          </tr>
                          <tr className="h-8 text-[11px]">
                              {pinnedGroups.map((group, gIdx) => (
                                  group.columns.map((col, cIdx) => {
                                      const def = COLUMN_DEFS[col.id] || { width: 80, align: 'right' };
                                      const width = colWidths[col.id] || def.width;
                                      return (
                                          <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} className={`sticky z-50 px-1 text-right border-r border-b border-gray-300 font-normal whitespace-nowrap bg-blue-50 text-gray-800`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }} sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>
                                      );
                                  })
                              ))}
                              {unpinnedGroups.map(group => (
                                  group.columns.map(col => {
                                      const def = COLUMN_DEFS[col.id] || { width: 80, align: 'right' };
                                      const width = colWidths[col.id] || def.width;
                                      return (
                                          <ResizableHeader key={col.id} width={width} onResize={(w) => handleColumnResize(col.id, w)} onResizeEnd={handleColumnResizeEnd} className={`px-1 text-right border-r border-b border-gray-300 font-normal whitespace-nowrap bg-gray-50 text-gray-500`} sortKey={col.sortable ? col.id : undefined} currentSort={sortConfig} onSort={handleSort}>{col.label}</ResizableHeader>
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
                                  <tr key={idx} className="group hover:bg-blue-50 transition-colors h-12 border-b border-gray-100">
                                      <td className="text-center sticky left-0 z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" /></td>
                                      {pinnedColumns.map((col, cIdx) => {
                                          const def = COLUMN_DEFS[col.id] || { width: 100, align: 'left', render: (d: any) => <span>{d[col.id]}</span> };
                                          return (<td key={col.id} className={`px-2 py-1 sticky z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100 ${col.id === 'store' ? 'border-r-gray-300' : ''}`} style={{ left: getStickyLeft('col', cIdx) }}>{def.render(item)}</td>);
                                      })}
                                      {pinnedGroups.map((group, gIdx) => (
                                          group.columns.map((col, cIdx) => {
                                              const def = COLUMN_DEFS[col.id] || { width: 80, align: 'right', render: (d: any) => <span>{d[col.id]}</span> };
                                              return (<td key={col.id} className={`px-1 text-right sticky z-30 bg-blue-50 group-hover:bg-blue-100 border-r border-b border-gray-100 tabular-nums`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }}>{def.render(item)}</td>);
                                          })
                                      ))}
                                      {unpinnedBasicInfo.map(col => {
                                          const def = COLUMN_DEFS[col.id] || { width: 100, align: 'left', render: (d: any) => <span>{d[col.id]}</span> };
                                          return (<td key={col.id} className={`px-2 border-r border-b border-gray-100 ${col.id === 'trend' ? 'text-center' : ''}`}>{def.render(item)}</td>);
                                      })}
                                      {unpinnedGroups.map(group => (
                                          group.columns.map(col => {
                                              const def = COLUMN_DEFS[col.id] || { width: 80, align: 'right', render: (d: any) => <span>{d[col.id]}</span> };
                                              return (<td key={col.id} className={`px-1 text-right border-r border-b border-gray-100 tabular-nums`}>{def.render(item)}</td>);
                                          })
                                      ))}
                                      <td className="text-center sticky right-0 z-30 bg-white group-hover:bg-blue-50 border-l border-b border-gray-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                          <button className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-100/50"><MoreHorizontal size={14} /></button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                      <tfoot className="bg-white sticky bottom-0 z-40 border-t-2 border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-[11px] font-bold text-gray-800">
                          <tr className="h-9 bg-white">
                              <td className="sticky left-0 bg-white z-50 border-r border-gray-100"></td>
                              {pinnedColumns.map((col, cIdx) => (
                                  <td key={col.id} className={`sticky bg-white z-50 border-r border-gray-100 px-2 text-center`} style={{ left: getStickyLeft('col', cIdx) }}>{col.id === 'store' ? '汇总' : ''}</td>
                              ))}
                              {pinnedGroups.map((group, gIdx) => (
                                  group.columns.map((col, cIdx) => (<td key={col.id} className={`sticky bg-blue-50 z-50 border-r border-gray-100 text-right px-1`} style={{ left: getPinnedGroupColLeft(gIdx, cIdx) }}>-</td>))
                              ))}
                              {unpinnedBasicInfo.map(col => {
                                  const isNumeric = ['sales_7d', 'sales_14d', 'sales_30d'].includes(col.id);
                                  return (<td key={col.id} className={`px-2 border-r border-gray-100 ${isNumeric ? 'text-right' : ''}`}>{isNumeric ? data.reduce((s,i)=>s+(i[col.id]||0),0).toLocaleString() : ''}</td>);
                              })}
                              {unpinnedGroups.map(group => (
                                  group.columns.map(col => {
                                      let val: any = '';
                                      if (col.id.includes('Sales')) val = data.reduce((s, i) => s + (Number(i[col.id]) || 0), 0).toLocaleString();
                                      return (<td key={col.id} className={`px-1 text-right border-r border-gray-100`}>{val}</td>);
                                  })
                              ))}
                              <td className="sticky right-0 bg-white z-50 border-l border-gray-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]"></td>
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
