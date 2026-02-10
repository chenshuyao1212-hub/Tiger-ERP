
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Download,
  ExternalLink,
  Filter
} from 'lucide-react';
import { 
  SiteFilterDropdown, 
  ShopFilterDropdown, 
  SalespersonFilterDropdown, 
  DeliveryMethodFilterDropdown
} from '../../components/Filters';
import { ProductTagFilter } from '../../components/ProductTagFilter';

// --- Types & Registry ---

// 1. Column Registry (Static Definitions)
// Defines "What columns exist" and their intrinsic properties
const COLUMN_REGISTRY: Record<string, { label: string; group: string; minWidth: number; sortable?: boolean; defaultPinned?: boolean; isSystem?: boolean }> = {
    'img': { label: '图片', group: '基础信息', minWidth: 60, defaultPinned: true, isSystem: true },
    'store': { label: '店铺/站点', group: '基础信息', minWidth: 110, defaultPinned: true },
    'title_asin': { label: '标题/ASIN', group: '基础信息', minWidth: 280, defaultPinned: true }, // Elastic Candidate #1
    'msku_attr': { label: 'MSKU/属性', group: '基础信息', minWidth: 150 }, // Elastic Candidate #2
    
    // 站点今日 (实时)
    'todaySales': { label: '销量', group: '站点今日 (实时)', minWidth: 90, sortable: true },
    'todayOrders': { label: '订单量', group: '站点今日 (实时)', minWidth: 90, sortable: true },
    'todayAmount': { label: '销售额', group: '站点今日 (实时)', minWidth: 120, sortable: true },
    
    // 站点昨日
    'yesterdaySales': { label: '销量', group: '站点昨日', minWidth: 90, sortable: true },
    'yesterdayOrders': { label: '订单量', group: '站点昨日', minWidth: 90 },
    'yesterdayAmount': { label: '销售额', group: '站点昨日', minWidth: 120 },

    // FBA库存
    'fbaAvailable': { label: 'FBA可售', group: 'FBA库存', minWidth: 100 },
    'fbaReserved': { label: 'FBA预留', group: 'FBA库存', minWidth: 100 },
    'fbaInbound': { label: 'FBA在途', group: 'FBA库存', minWidth: 100 },
    'fbaDays': { label: '可售天数', group: 'FBA库存', minWidth: 120 },

    // 上周同日
    'lastWeekSales': { label: '销量', group: '上周同日', minWidth: 90, sortable: true },
    'lastWeekOrders': { label: '订单量', group: '上周同日', minWidth: 90 },
    'lastWeekAmount': { label: '销售额', group: '上周同日', minWidth: 120 },

    // 去年同日
    'lastYearSales': { label: '销量', group: '去年同日', minWidth: 90, sortable: true },
    'lastYearOrders': { label: '订单量', group: '去年同日', minWidth: 90 },
    'lastYearAmount': { label: '销售额', group: '去年同日', minWidth: 120 },
};

// 2. Default User Settings (The "State" of columns)
// Defines order, visibility, and width preference
const DEFAULT_USER_SETTINGS = [
    { id: 'img', visible: true, width: 60, pinned: true },
    { id: 'store', visible: true, width: 110, pinned: true },
    { id: 'title_asin', visible: true, width: 280, pinned: true },
    { id: 'msku_attr', visible: true, width: 180, pinned: false },
    { id: 'todaySales', visible: true, width: 90, pinned: false },
    { id: 'todayOrders', visible: true, width: 90, pinned: false },
    { id: 'todayAmount', visible: true, width: 120, pinned: false },
    { id: 'yesterdaySales', visible: true, width: 90, pinned: false },
    { id: 'yesterdayOrders', visible: true, width: 90, pinned: false },
    { id: 'yesterdayAmount', visible: true, width: 120, pinned: false },
    { id: 'fbaAvailable', visible: true, width: 100, pinned: false },
    { id: 'fbaReserved', visible: true, width: 100, pinned: false },
    { id: 'fbaInbound', visible: true, width: 100, pinned: false },
    { id: 'fbaDays', visible: true, width: 120, pinned: false },
    { id: 'lastWeekSales', visible: true, width: 90, pinned: false },
    { id: 'lastWeekOrders', visible: true, width: 90, pinned: false },
    { id: 'lastWeekAmount', visible: true, width: 120, pinned: false },
    { id: 'lastYearSales', visible: true, width: 90, pinned: false },
    { id: 'lastYearOrders', visible: true, width: 90, pinned: false },
    { id: 'lastYearAmount', visible: true, width: 120, pinned: false },
];

const ELASTIC_PRIORITY = ['title_asin', 'msku_attr', 'store']; // Who gets to grow?

// --- Components ---

const RealTimeKpiCard = ({ title, value, yesterday, lastWeek, prefix = '', decimals = 0 }: any) => {
    const formatVal = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    
    const renderTrend = (current: number, past: number) => {
        if (past === 0) {
            if (current === 0) return <span className="text-gray-400 text-[10px]">0%</span>;
            return <div className="flex items-center text-red-500 text-[10px] font-bold">100% <ArrowUp size={10} className="ml-0.5" strokeWidth={3} /></div>;
        }
        const diff = current - past;
        const pct = (Math.abs(diff) / past) * 100;
        const pctStr = pct > 999 ? '>999%' : `${pct.toFixed(0)}%`;
        
        if (diff > 0) return <div className="flex items-center text-red-500 text-[10px] font-bold">{pctStr} <ArrowUp size={10} className="ml-0.5" strokeWidth={3} /></div>;
        if (diff < 0) return <div className="flex items-center text-green-500 text-[10px] font-bold">{pctStr} <ArrowDown size={10} className="ml-0.5" strokeWidth={3} /></div>;
        return <span className="text-gray-400 text-[10px]">0%</span>;
    };

    return (
        <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-[124px] hover:shadow-md transition-shadow relative group">
            <div>
                <div className="text-xs text-gray-500 mb-1 font-medium">{title}</div>
                <div className="text-2xl font-bold text-gray-900 font-mono tracking-tight mt-1">{prefix}{formatVal(value)}</div>
            </div>
            <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[11px] leading-none">
                    <div className="flex items-center gap-1 text-gray-400"><span>昨日同时</span><HelpCircle size={10} className="cursor-help hover:text-gray-600"/></div>
                    <div className="flex items-center"><span className="text-gray-500 mr-2 font-mono min-w-[30px] text-right">{prefix}{formatVal(yesterday)}</span><div className="h-2.5 w-px bg-gray-200 mr-2"></div><div className="w-12 flex justify-end">{renderTrend(value, yesterday)}</div></div>
                </div>
                <div className="flex justify-between items-center text-[11px] leading-none">
                    <div className="flex items-center gap-1 text-gray-400"><span>上周同时</span><HelpCircle size={10} className="cursor-help hover:text-gray-600"/></div>
                    <div className="flex items-center"><span className="text-gray-500 mr-2 font-mono min-w-[30px] text-right">{prefix}{formatVal(lastWeek)}</span><div className="h-2.5 w-px bg-gray-200 mr-2"></div><div className="w-12 flex justify-end">{renderTrend(value, lastWeek)}</div></div>
                </div>
            </div>
        </div>
    );
};

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

const ResizableHeader: React.FC<React.ThHTMLAttributes<HTMLTableCellElement> & { 
    width: number; 
    onResize: (delta: number) => void; 
    sortKey?: string;
    currentSort?: { key: string, direction: 'ASC' | 'DESC' };
    onSort?: (key: string) => void;
}> = ({ width, onResize, sortKey, currentSort, onSort, children, className, style, ...props }) => {
    
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startX = e.pageX;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.pageX - startX;
            onResize(delta);
        };
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <th className={`relative group/th select-none border-r border-b border-gray-200 ${sortKey ? 'cursor-pointer hover:bg-opacity-80' : ''} ${className}`} style={{ width, minWidth: width, maxWidth: width, ...style }} onClick={() => sortKey && onSort && onSort(sortKey)} {...props}>
            <div className="w-full h-full overflow-hidden flex items-center justify-between px-2">
                <span className="truncate flex-1">{children}</span>
                {sortKey && (
                    <div className="flex flex-col ml-1 opacity-40">
                        <ArrowUp size={8} className={currentSort?.key === sortKey && currentSort.direction === 'ASC' ? 'text-blue-700 opacity-100' : ''} />
                        <ArrowDown size={8} className={currentSort?.key === sortKey && currentSort.direction === 'DESC' ? 'text-blue-700 opacity-100' : ''} />
                    </div>
                )}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-20 flex justify-center hover:bg-blue-400/20 group-hover/th:opacity-100 opacity-0 transition-opacity" onMouseDown={handleMouseDown} onClick={(e) => e.stopPropagation()}>
                <div className="w-px h-full bg-gray-300 group-hover/th:bg-blue-400"></div>
            </div>
        </th>
    );
};

// --- Renderers & Styles ---

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
            <span className="text-blue-600 hover:underline cursor-pointer font-medium truncate text-[11px] w-full block" title={item.store}>{item.store}</span>
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
            <div className="text-gray-500 text-[10px] leading-tight truncate" title={item.title}>{item.title}</div>
        </div>
    ),
    'msku_attr': (item) => (
        <div className="flex flex-col justify-center h-full gap-0.5 w-full overflow-hidden">
            <div className="font-mono text-gray-700 truncate text-[11px]" title={item.msku}>{item.msku}</div>
            <div className="text-gray-400 text-[10px] truncate">{item.skuName || '-'}</div>
        </div>
    )
};

const renderNumeric = (val: number, format: 'int' | 'currency' = 'int', colorClass = 'text-gray-900') => {
    if (!val && val !== 0) return <span className="text-gray-300">-</span>;
    if (val === 0) return <span className="text-gray-300">0</span>;
    let displayVal = format === 'currency' ? val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val.toLocaleString();
    return format === 'currency' ? <div className="flex flex-col items-end"><span className={`font-mono text-[11px] font-medium ${colorClass}`}>US${displayVal}</span></div> : <span className={`font-mono font-medium ${colorClass}`}>{displayVal}</span>;
};

// --- Main Component ---

export const RealTime = () => {
  // Data States
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ASC' | 'DESC' }>({ key: 'todaySales', direction: 'DESC' });

  // Filter States
  const [activeTab, setActiveTab] = useState('ASIN');
  const [searchText, setSearchText] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterCurrency, setFilterCurrency] = useState<string>('原币种');
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string | null>(null);
  const [filterSalespersons, setFilterSalespersons] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);

  // Column Management States
  const [columnSettings, setColumnSettings] = useState(DEFAULT_USER_SETTINGS);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Resize Observer for Elastic Layout ---
  useEffect(() => {
      if (!containerRef.current) return;
      const ro = new ResizeObserver(entries => {
          setContainerWidth(entries[0].contentRect.width);
      });
      ro.observe(containerRef.current);
      return () => ro.disconnect();
  }, []);

  // --- Data Fetching ---
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
      } catch (e) { console.error("Fetch failed", e); } 
      finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, 
  [selectedSites, selectedShops, filterSalespersons, activeTab, sortConfig]);

  // --- Layout Calculation Engine (The Core) ---
  const CHECKBOX_WIDTH = 40;

  const { renderColumns, tableTotalWidth } = useMemo(() => {
      // 1. Merge Settings with Registry to get full column objects
      const visibleCols = columnSettings
          .filter(s => s.visible)
          .map(s => {
              const def = COLUMN_REGISTRY[s.id];
              return {
                  ...s,
                  label: def?.label || s.id,
                  group: def?.group || '其他',
                  minWidth: def?.minWidth || 60,
                  sortable: def?.sortable,
                  defaultPinned: def?.defaultPinned,
                  isSystem: def?.isSystem
              };
          });

      // 2. Identify Elastic Column (Priority-based Relay)
      // If user hides 'title_asin', next priority takes over.
      const elasticColId = ELASTIC_PRIORITY.find(id => visibleCols.some(c => c.id === id)) 
                           || visibleCols[visibleCols.length - 1]?.id;

      // 3. Calculate Widths
      // Sum of current user-defined widths (excluding elastic potential)
      const currentTotalFixedWidth = visibleCols.reduce((sum, col) => sum + col.width, 0);
      const availableSpace = containerWidth - CHECKBOX_WIDTH;
      
      // 4. Distribute
      const finalColumns = visibleCols.map(col => {
          let renderWidth = col.width;
          if (col.id === elasticColId) {
              // If there's extra space, Elastic Col absorbs it
              if (currentTotalFixedWidth < availableSpace) {
                  const extra = availableSpace - currentTotalFixedWidth;
                  renderWidth = col.width + extra;
              }
          }
          return { ...col, renderWidth, isElastic: col.id === elasticColId };
      });

      const finalTotalWidth = Math.max(
          CHECKBOX_WIDTH + finalColumns.reduce((acc, c) => acc + c.renderWidth, 0),
          containerWidth // Ensure table fills container even if calculations are slightly off
      );

      return { renderColumns: finalColumns, tableTotalWidth: finalTotalWidth };
  }, [columnSettings, containerWidth]);

  // --- Handlers ---

  const handleResize = useCallback((colId: string, delta: number) => {
      setColumnSettings(prev => {
          const newSettings = prev.map(col => {
              if (col.id === colId) {
                  // Ensure we don't shrink below registry minWidth or 40px
                  const def = COLUMN_REGISTRY[col.id];
                  const min = def?.minWidth || 40;
                  const newWidth = Math.max(min, col.width + delta);
                  return { ...col, width: newWidth };
              }
              return col;
          });
          return newSettings;
      });
  }, []);

  const handleSort = (key: string) => {
      setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'DESC' ? 'ASC' : 'DESC' }));
  };

  const handleReset = () => {
      setResetKey(p => p + 1);
      setFilterTags([]); setFilterCurrency('原币种'); setFilterSalespersons([]);
      setSelectedSites([]); setSelectedShops([]); setSelectedDeliveryMethod(null);
      setSearchText(''); setSortConfig({ key: 'todaySales', direction: 'DESC' });
      setColumnSettings(DEFAULT_USER_SETTINGS); // Reset columns too
  };

  // --- Grouping Logic for Render ---
  const { pinnedCols, unpinnedCols, pinnedGroups, unpinnedGroups } = useMemo(() => {
      const pCols = renderColumns.filter(c => c.pinned);
      const uCols = renderColumns.filter(c => !c.pinned);

      // Helper to bundle columns into groups
      const bundleGroups = (cols: typeof renderColumns) => {
          const groups: { name: string, columns: typeof renderColumns }[] = [];
          let currentGroup: typeof groups[0] | null = null;

          cols.forEach(col => {
              if (currentGroup && currentGroup.name === col.group) {
                  currentGroup.columns.push(col);
              } else {
                  if (currentGroup) groups.push(currentGroup);
                  currentGroup = { name: col.group, columns: [col] };
              }
          });
          if (currentGroup) groups.push(currentGroup);
          return groups;
      };

      return {
          pinnedCols: pCols,
          unpinnedCols: uCols,
          pinnedGroups: bundleGroups(pCols),
          unpinnedGroups: bundleGroups(uCols)
      };
  }, [renderColumns]);

  // Calculation for sticky positioning
  const getStickyLeft = (index: number) => {
      let left = CHECKBOX_WIDTH;
      for (let i = 0; i < index; i++) {
          left += pinnedCols[i].renderWidth;
      }
      return left;
  };

  const calcTotal = (key: string) => data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);

  // --- KPI Data ---
  const kpiData = useMemo(() => {
      const s = summary || { sales: {}, orders: {}, amount: {}, cancelled: {} };
      const val = (obj: any, k: string) => obj?.[k] || 0;
      const calcAvg = (amt: number, qty: number) => qty > 0 ? amt/qty : 0;
      return [
          { title: '销量', value: val(s.sales,'value'), yesterday: val(s.sales,'yesterday'), lastWeek: val(s.sales,'lastWeek') },
          { title: '销售额', value: val(s.amount,'value'), yesterday: val(s.amount,'yesterday'), lastWeek: val(s.amount,'lastWeek'), prefix: 'US$', decimals: 2 },
          { title: '订单量', value: val(s.orders,'value'), yesterday: val(s.orders,'yesterday'), lastWeek: val(s.orders,'lastWeek') },
          { title: '商品均价', value: calcAvg(val(s.amount,'value'), val(s.sales,'value')), yesterday: calcAvg(val(s.amount,'yesterday'), val(s.sales,'yesterday')), lastWeek: calcAvg(val(s.amount,'lastWeek'), val(s.sales,'lastWeek')), prefix: 'US$', decimals: 2 },
          { title: '取消订单数', value: val(s.cancelled,'value'), yesterday: val(s.cancelled,'yesterday'), lastWeek: val(s.cancelled,'lastWeek') }
      ];
  }, [summary]);

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 1. Global Filter Bar */}
      <div className="h-12 border-b border-gray-200 bg-white px-4 flex items-center justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-2">
              <SiteFilterDropdown key={`site-${resetKey}`} onChange={setSelectedSites} width="160px" />
              <ShopFilterDropdown key={`shop-${resetKey}`} onChange={setSelectedShops} returnField="name" width="130px" />
              <DeliveryMethodFilterDropdown key={`dm-${resetKey}`} onChange={setSelectedDeliveryMethod} width="100px" />
              <ProductTagFilter key={`tag-${resetKey}`} onChange={setFilterTags} width="120px"/>
              <SimpleSelect value={filterCurrency} onChange={setFilterCurrency} options={['原币种', 'CNY', 'USD', 'EUR']} width="80px" />
              <SalespersonFilterDropdown key={`sp-${resetKey}`} onChange={setFilterSalespersons} width="130px" />
              <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 hover:text-blue-600 transition-colors ml-1"><Filter size={12} className="fill-gray-100" /> 重置</button>
          </div>
          <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">分时趋势</button>
              <button className="px-3 py-1.5 border border-gray-200 rounded-sm text-xs text-gray-600 hover:text-blue-600 hover:border-blue-400 bg-white transition-colors">统计设置</button>
          </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden w-full min-h-0 bg-gray-50/30">
          {/* KPI Cards */}
          <div className="grid grid-cols-5 gap-4 mb-0 shrink-0">
              {kpiData.map((kpi, idx) => <RealTimeKpiCard key={idx} {...kpi} />)}
          </div>

          {/* Table Container */}
          <div className="flex-1 bg-white border border-gray-200 rounded shadow-sm overflow-hidden flex flex-col min-h-0 relative">
              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-3">
                      <div className="flex rounded border border-gray-300 overflow-hidden">
                          {['ASIN', '父ASIN', 'MSKU', 'SKU'].map((tab) => (
                              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-xs font-medium border-r border-gray-300 last:border-r-0 transition-colors ${activeTab === tab ? 'bg-white text-blue-600 shadow-[inset_0_0_0_1px_#3b82f6] z-10' : 'bg-white text-gray-600 hover:text-blue-600'}`}>{tab}</button>
                          ))}
                      </div>
                      <div className="flex items-center h-8">
                           <div className="relative h-full">
                               <div className="h-full flex items-center border border-r-0 border-gray-300 rounded-l px-2 bg-white hover:border-gray-400 cursor-pointer min-w-[80px] justify-between group">
                                   <span className="text-xs text-gray-600">{searchType}</span><ChevronDown size={12} className="text-gray-400" />
                               </div>
                           </div>
                           <input type="text" className="h-full w-64 border border-gray-300 px-3 text-xs outline-none focus:border-blue-500 focus:z-10 transition-colors" placeholder="搜索内容" value={searchText} onChange={(e) => setSearchText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchData()} />
                           <button className="h-full px-3 border border-l-0 border-gray-300 rounded-r bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors" onClick={() => fetchData()}><Search size={14} /></button>
                      </div>
                  </div>
                  <div className="flex items-center gap-1">
                      <button className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200 transition-colors"><Settings size={14} /><span>自定义列</span></button>
                      <div className="h-4 w-px bg-gray-300 mx-1"></div>
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded" title="刷新" onClick={fetchData}><RefreshCw size={16} className={isSyncing ? "animate-spin text-blue-600" : ""} /></button>
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"><Download size={16} /></button>
                  </div>
              </div>

              {/* THE TABLE */}
              <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" ref={containerRef}>
                  <table className="text-xs text-left border-separate border-spacing-0 table-fixed" style={{ width: tableTotalWidth }}>
                      <thead className="text-gray-600 font-medium sticky top-0 z-40 bg-gray-50 shadow-sm">
                          {/* Row 1: Groups */}
                          <tr className="h-7">
                              <th rowSpan={2} className="sticky left-0 z-[60] bg-gray-50 border-r border-b border-gray-200 text-center" style={{ width: CHECKBOX_WIDTH }}><input type="checkbox" className="rounded border-gray-400" /></th>
                              
                              {pinnedGroups.map((group, gIdx) => (
                                  <th key={gIdx} colSpan={group.columns.length} className={`sticky z-[60] text-center border-r border-b border-gray-200 text-[11px] whitespace-nowrap font-bold border-t-[3px] ${getGroupStyle(group.name)}`} style={{ left: getStickyLeft(pinnedCols.indexOf(group.columns[0])) }}>{group.name}</th>
                              ))}
                              
                              {unpinnedGroups.map((group, gIdx) => (
                                  <th key={gIdx} colSpan={group.columns.length} className={`text-center border-r border-b border-gray-200 text-[11px] whitespace-nowrap font-bold border-t-[3px] ${getGroupStyle(group.name)}`}>{group.name}</th>
                              ))}
                          </tr>

                          {/* Row 2: Columns */}
                          <tr className="h-8 text-[11px]">
                              {pinnedCols.map((col, idx) => (
                                  <ResizableHeader 
                                    key={col.id} 
                                    width={col.renderWidth} 
                                    onResize={(d) => handleResize(col.id, d)}
                                    sortKey={col.sortable ? col.id : undefined}
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                    className="sticky z-50 bg-white"
                                    style={{ left: getStickyLeft(idx) }}
                                  >
                                      {col.label}
                                  </ResizableHeader>
                              ))}
                              {unpinnedCols.map((col, idx) => (
                                  <ResizableHeader 
                                    key={col.id} 
                                    width={col.renderWidth} 
                                    onResize={(d) => handleResize(col.id, d)}
                                    sortKey={col.sortable ? col.id : undefined}
                                    currentSort={sortConfig}
                                    onSort={handleSort}
                                    className="bg-white"
                                  >
                                      {col.label}
                                  </ResizableHeader>
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
                                      
                                      {pinnedCols.map((col, cIdx) => (
                                          <td key={col.id} className={`px-3 py-1 sticky z-30 bg-white group-hover:bg-blue-50 border-r border-b border-gray-100 ${['store','title_asin','img'].includes(col.id) ? '' : 'text-right tabular-nums'}`} style={{ left: getStickyLeft(cIdx) }}>
                                              {COLUMN_RENDERERS[col.id] ? COLUMN_RENDERERS[col.id](item) : (col.id.includes('Amount') || col.id.includes('Sales') ? renderNumeric(item[col.id], col.id.includes('Amount') ? 'currency' : 'int', col.id.includes('Sales') ? 'text-gray-900 font-bold' : undefined) : item[col.id])}
                                          </td>
                                      ))}
                                      
                                      {unpinnedCols.map((col, cIdx) => (
                                          <td key={col.id} className={`px-3 py-1 border-r border-b border-gray-100 ${['store','title_asin','img'].includes(col.id) ? '' : 'text-right tabular-nums'}`}>
                                              {COLUMN_RENDERERS[col.id] ? COLUMN_RENDERERS[col.id](item) : (col.id.includes('Amount') || col.id.includes('Sales') ? renderNumeric(item[col.id], col.id.includes('Amount') ? 'currency' : 'int', col.id.includes('Sales') ? 'text-gray-900 font-bold' : undefined) : item[col.id])}
                                          </td>
                                      ))}
                                  </tr>
                              ))
                          )}
                      </tbody>

                      <tfoot className="bg-white sticky bottom-0 z-40 border-t-2 border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-[11px] font-bold text-gray-800">
                          <tr className="h-10 bg-white">
                              <td className="sticky left-0 bg-white z-50 border-r border-gray-100"></td>
                              {pinnedCols.map((col, idx) => (
                                  <td key={col.id} className={`sticky bg-white z-50 border-r border-gray-100 px-3 ${col.id === 'store' ? 'text-center' : 'text-right'}`} style={{ left: getStickyLeft(idx) }}>
                                      {col.id === 'store' ? '本页汇总' : (col.group !== '基础信息' ? renderNumeric(calcTotal(col.id), col.id.includes('Amount') ? 'currency' : 'int') : '')}
                                  </td>
                              ))}
                              {unpinnedCols.map((col, idx) => (
                                  <td key={col.id} className="border-r border-gray-100 px-3 text-right">
                                      {col.group !== '基础信息' ? renderNumeric(calcTotal(col.id), col.id.includes('Amount') ? 'currency' : 'int') : ''}
                                  </td>
                              ))}
                          </tr>
                      </tfoot>
                  </table>
              </div>
              
              {/* Pagination */}
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
