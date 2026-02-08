
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  MoreHorizontal, 
  LayoutGrid, 
  Calendar,
  X,
  ArrowUpToLine,
  Pin,
  Check,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Map,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Info,
  Edit,
  Save,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { MARKETPLACE_MAP } from '../../../constants';
import { ColumnDef, Salesperson } from '../../../types';
import { 
  SalespersonFilterDropdown, 
  SiteFilterDropdown, 
  ShopFilterDropdown, 
  StatusFilterDropdown, 
  DeliveryMethodFilterDropdown 
} from '../../../components/Filters';
import { ActionButton } from '../../../components/ActionButton';
import { PageSizeSelector } from '../../../components/PageSizeSelector';
import { CustomColumnsModal } from '../../../components/CustomColumnsModal';

// Adjusted widths to align with header text length (approx 14px per char + padding + icons)
const INITIAL_COLUMNS: ColumnDef[] = [
  { id: 'store', label: '店铺/站点', width: 90, pinned: true, visible: true },
  { id: 'orderId', label: '订单号', width: 80, pinned: true, visible: true, hasHelp: true },
  { id: 'productInfo', label: '图片/ASIN/MSKU', width: 190, pinned: false, visible: true },
  { id: 'sellerOrderId', label: '卖家订单号', width: 100, pinned: false, visible: true, hasHelp: true },
  { id: 'orderTime', label: '订购时间', width: 90, pinned: false, visible: true, hasSort: true },
  { id: 'paymentTime', label: '付款时间', width: 90, pinned: false, visible: true, hasSort: true },
  { id: 'refundTime', label: '退款时间', width: 90, pinned: false, visible: true, hasSort: true },
  { id: 'status', label: '订单状态', width: 80, pinned: false, visible: true },
  { id: 'sales', label: '销售收益', width: 100, pinned: false, visible: true, hasSort: true, hasHelp: true },
  { id: 'titleSku', label: '品名/SKU', width: 100, pinned: false, visible: true },
  { id: 'qty', label: '销量', width: 60, pinned: false, visible: true, align: 'right' },
  { id: 'refundQty', label: '退款量', width: 60, pinned: false, visible: true, align: 'right' },
  { id: 'promoCode', label: '促销编码', width: 80, pinned: false, visible: true, align: 'center' },
  { id: 'amount', label: '产品金额', width: 100, pinned: false, visible: true, align: 'right', hasSort: true, hasHelp: true },
  { id: 'profit', label: '订单利润/订单利润率', width: 190, pinned: false, visible: true, align: 'left', hasSort: true },
  { id: 'note', label: '备注 (本地/买家)', width: 120, pinned: false, visible: true, align: 'left' },
  { id: 'buyer', label: '买家信息', width: 80, pinned: false, visible: true },
  { id: 'invoiceStatus', label: '发票状态', width: 90, pinned: false, visible: true, align: 'center', hasHelp: true },
  { id: 'reqReview', label: '请求评论状态', width: 120, pinned: false, visible: true, align: 'center', hasHelp: true },
  { id: 'reviewer', label: '测评负责人', width: 90, pinned: false, visible: true, align: 'center' },
];

const SortIcon = () => (
  <span className="flex flex-col ml-0.5 opacity-40">
    <ChevronDown size={10} className="transform rotate-180 -mb-0.5" />
    <ChevronDown size={10} />
  </span>
);

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  hasSort?: boolean;
  hasHelp?: boolean;
  onResize?: (width: number) => void;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children, className, align = 'left', hasSort = false, hasHelp = false, onResize, style, ...props }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onResize) return;
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = (e.target as HTMLElement).parentElement!.offsetWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <th className={`p-2 font-medium bg-gray-50 border-b border-gray-100 whitespace-nowrap h-10 group/th relative select-none ${className}`} style={style} {...props}>
      <div className={`flex items-center h-full ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {children}
        {hasHelp && <HelpCircle size={10} className="inline text-gray-400 ml-1"/>}
        {hasSort && <SortIcon />}
      </div>
      <div 
        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize z-20 flex justify-center hover:bg-blue-400/10 group-hover/th:opacity-100 opacity-0 transition-opacity"
        onMouseDown={handleMouseDown}
      >
          <div className="w-px h-full bg-gray-400 group-hover/th:bg-blue-400"></div>
      </div>
    </th>
  );
};

// ... (Helper Functions) ...
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDateTime = (date: Date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

// --- CORE LOGIC: Local Date Anchor ---
// Returns a date object based on LOCAL SYSTEM time with offset days.
// "Today" is simply the current date on the user's computer.
// This allows Multi-Region visibility (e.g., Japan data shows up when it's already "Today" in Japan/China, even if it's "Yesterday" in US).
const getLocalDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    d.setHours(0,0,0,0);
    return d;
};

const STORAGE_KEY = 'tiger_erp_platform_order_filters_v2';

// --- Main Component ---

export const PlatformOrder = () => {
  const currentYear = new Date().getFullYear();

  const [columns, setColumns] = useState<ColumnDef[]>(INITIAL_COLUMNS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  
  const [eraMode, setEraMode] = useState<'current' | 'history'>('current');

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInputValue, setNoteInputValue] = useState('');

  // --- Reset Key for Child Components ---
  const [resetKey, setResetKey] = useState(0);

  // --- Advanced Filter State ---
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const advancedFilterRef = useRef<HTMLDivElement>(null);
  const [advFilters, setAdvFilters] = useState({
      amountMin: '',
      amountMax: '',
      isBusiness: false,
      isReplacement: false,
      isReview: false,
      negativeProfit: false,
      zeroCost: false
  });

  // --- AbortController Ref for cancelling stale requests ---
  const abortControllerRef = useRef<AbortController | null>(null);

  // --- Load Settings & Last Sync ---
  useEffect(() => {
      const loadSettings = async () => {
          try {
              const res = await fetch('/api/settings/columns/platform_order');
              if (res.ok) {
                  const savedSettings = await res.json();
                  if (savedSettings && Array.isArray(savedSettings)) {
                      setColumns(savedSettings);
                  }
              }
          } catch (e) {
              console.error("Failed to load column settings", e);
          }
      };
      const loadSyncTime = async () => {
          try {
              const res = await fetch('/api/orders/last-sync');
              const data = await res.json();
              if (data.lastSync) {
                  setLastSyncTime(new Date(data.lastSync).toLocaleString());
              }
          } catch (e) {}
      }
      loadSettings();
      loadSyncTime();
  }, []);

  const handleSaveColumns = async (newColumns: ColumnDef[]) => {
      setColumns(newColumns);
      try {
          await fetch('/api/settings/columns/platform_order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ settings: newColumns })
          });
      } catch (e) {
          console.error("Failed to save column settings", e);
      }
  };
  
  // --- Persistent State Initialization ---
  const getInitialState = () => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
              const parsed = JSON.parse(saved);
              return {
                  ...parsed,
                  dateRange: {
                      start: new Date(parsed.dateRange.start),
                      end: new Date(parsed.dateRange.end)
                  },
                  restored: true
              };
          }
      } catch(e) {}
      return {
          timeType: '订购时间',
          // Default: Last 30 days based on Local Time
          dateRange: { start: getLocalDate(-29), end: getLocalDate(0) },
          searchType: '订单号',
          searchValue: '',
          selectedSalespersons: [],
          selectedSites: [],
          selectedShops: [],
          selectedStatuses: [],
          selectedDeliveryMethod: null,
          isUnlimitedTime: false, // Explicitly false by default
          restored: false
      };
  };

  const initialState = getInitialState();

  const [timeType, setTimeType] = useState(initialState.timeType); 
  const [isTimeTypeOpen, setIsTimeTypeOpen] = useState(false);
  const timeTypeRef = useRef<HTMLDivElement>(null);
  
  const [dateRange, setDateRange] = useState(initialState.dateRange);
  
  const [isUnlimitedTime, setIsUnlimitedTime] = useState(initialState.isUnlimitedTime);

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [pickerViewDate, setPickerViewDate] = useState(initialState.dateRange.end); 
  const [selectingStart, setSelectingStart] = useState(true); 
  const [pickerMode, setPickerMode] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const [searchType, setSearchType] = useState(initialState.searchType);
  const [isSearchTypeOpen, setIsSearchTypeOpen] = useState(false);
  const searchTypeRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState(initialState.searchValue);
  const [isBatchSearchOpen, setIsBatchSearchOpen] = useState(false);
  const batchSearchRef = useRef<HTMLDivElement>(null);
  
  const [selectedSalespersons, setSelectedSalespersons] = useState<string[]>(initialState.selectedSalespersons);
  const [selectedSites, setSelectedSites] = useState<string[]>(initialState.selectedSites);
  const [selectedShops, setSelectedShops] = useState<string[]>(initialState.selectedShops);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialState.selectedStatuses);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<string | null>(initialState.selectedDeliveryMethod);

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Controls table loading state (blocking)
  const [isSyncing, setIsSyncing] = useState(false); // Controls top-right sync icon state (non-blocking)
  const [totalItems, setTotalItems] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [jumpPageInput, setJumpPageInput] = useState('1');

  // Close dropdowns when clicking outside
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          const target = event.target as Node;
          if (advancedFilterRef.current && !advancedFilterRef.current.contains(target)) {
              setIsAdvancedFilterOpen(false);
          }
          if (timeTypeRef.current && !timeTypeRef.current.contains(target)) {
              setIsTimeTypeOpen(false);
          }
          if (datePickerRef.current && !datePickerRef.current.contains(target)) {
              setIsDatePickerOpen(false);
          }
          if (searchTypeRef.current && !searchTypeRef.current.contains(target)) {
              setIsSearchTypeOpen(false);
          }
          if (batchSearchRef.current && !batchSearchRef.current.contains(target)) {
              setIsBatchSearchOpen(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Persistence Effect ---
  useEffect(() => {
      const stateToSave = {
          timeType,
          dateRange,
          searchType,
          searchValue,
          selectedSalespersons,
          selectedSites,
          selectedShops,
          selectedStatuses,
          selectedDeliveryMethod,
          isUnlimitedTime
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [timeType, dateRange, searchType, searchValue, selectedSalespersons, selectedSites, selectedShops, selectedStatuses, selectedDeliveryMethod, isUnlimitedTime]);

  // --- API Methods ---

  const mapSearchType = (type: string) => {
      const map: Record<string, string> = {
          '订单号': 'amazonOrderId',
          '卖家订单号': 'sellerOrderId',
          'ASIN': 'asin',
          'MSKU': 'sku',
          'SKU': 'sku',
          '买家邮箱': 'buyerEmail',
          '买家姓名': 'buyerName'
      };
      return map[type] || 'amazonOrderId';
  };

  /**
   * Fetches orders strictly from the local database.
   * This is fast and non-blocking if we want to show stale data first.
   * Includes AbortController logic to prevent race conditions.
   */
  const fetchDbOrders = async (isSilent = false) => {
      // 1. Cancel previous request if it exists
      if (abortControllerRef.current) {
          abortControllerRef.current.abort();
      }
      
      // 2. Create new controller
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (!isSilent) setIsLoading(true);
      setErrorMsg('');
      
      try {
          const startDateStr = isUnlimitedTime ? null : formatDate(dateRange.start);
          const endDateStr = isUnlimitedTime ? null : formatDate(dateRange.end);

          let finalSearchContent = searchValue.trim();
          let finalUnlimitedTimeStr = isUnlimitedTime ? 'true' : 'false';
          const backendSearchType = mapSearchType(searchType);

          if (finalSearchContent && (finalSearchContent.includes('\n') || finalSearchContent.includes(',') || finalSearchContent.includes('，'))) {
              const ids = finalSearchContent.split(/[\n,，]/).map(s => s.trim()).filter(s => s);
              finalSearchContent = ids.join(',');
              finalUnlimitedTimeStr = 'true';
          } 
          
          const payload = {
              pageNo: currentPage,
              pageSize: pageSize,
              startDate: startDateStr,
              endDate: endDateStr,
              searchType: backendSearchType,
              searchContent: finalSearchContent,
              unlimitedTime: finalUnlimitedTimeStr,
              shops: selectedShops,
              statuses: selectedStatuses,
              timeType: timeType, 
              advanced: advFilters,
              deliveryMethod: selectedDeliveryMethod, // Add delivery method
              sites: selectedSites // Add sites
          };
          
          const res = await fetch('/api/orders/db/list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              signal: controller.signal // Bind signal to request
          });
          
          const data = await res.json();
          
          if (data.rows) {
              // Smart Fallback for Order ID search miss (only if explicit ID search)
              if (data.total === 0 && finalSearchContent && searchType === '订单号' && !isSilent) {
                  try {
                      setIsLoading(true); 
                      // Sync call is kept separate, we don't abort it as it triggers server job
                      await fetch('/api/orders/sync', {
                          method: 'POST',
                          headers: {'Content-Type': 'application/json'},
                          body: JSON.stringify({ minutes: 1440 }) 
                      });
                      
                      // Retry fetch with signal
                      const retryRes = await fetch('/api/orders/db/list', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                          signal: controller.signal
                      });
                      const retryData = await retryRes.json();
                      if (retryData.rows) {
                          setOrders(retryData.rows);
                          setTotalItems(retryData.total || 0);
                          return;
                      }
                  } catch(e) {
                      if (e.name === 'AbortError') throw e; // Re-throw abort error
                  }
              }

              setOrders(data.rows);
              setTotalItems(data.total || 0);
          } else {
              setOrders([]);
              setTotalItems(0);
              const msg = data.error ? `DB Error: ${data.error}` : 'Unknown error from server';
              setErrorMsg(msg);
          }
      } catch (e: any) {
          if (e.name === 'AbortError') {
              console.log('Request aborted');
              return; // Silently exit, do not change state
          }
          console.error("Failed to fetch orders:", e);
          setErrorMsg('Failed to connect to server.');
          setOrders([]);
      } finally {
          // Only turn off loading if this is the active request
          if (abortControllerRef.current === controller) {
              if (!isSilent) setIsLoading(false);
          }
      }
  };

  /**
   * Triggers a background sync operation with external API.
   * New logic: Viewport Priority Update (Hot Sync) + Background Consistency
   */
  const syncOrders = async (mode: 'auto' | 'manual', priorityIds: string[] = []) => {
      setIsSyncing(true);
      try {
          // --- PHASE 1: VIEWPORT PRIORITY SYNC (The "Fast" Part) ---
          if (priorityIds.length > 0) {
              try {
                  console.log(`[PlatformOrder] Hot-Syncing ${priorityIds.length} visible orders...`);
                  await fetch('/api/orders/sync-batch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ orderIds: priorityIds })
                  });
                  // Immediate Silent Refresh to show updated statuses for what user sees
                  await fetchDbOrders(true);
              } catch (e) { console.warn("Hot sync failed", e); }
          }

          // --- PHASE 2: BACKGROUND CONSISTENCY SYNC (The "Slow" Part) ---
          // This runs to ensure new orders/history are caught eventually
          
          const backgroundSyncPromise = (async () => {
              if (mode === 'auto') {
                  console.log("[PlatformOrder] Auto Sync (Last 24h)...");
                  await fetch('/api/orders/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ minutes: 1440 }) 
                  });
              } else if (mode === 'manual') {
                  const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                  
                  let syncStart = dateRange.start;
                  const syncEnd = dateRange.end;

                  // Strategy: If range > 7 days, only sync last 5 days to be fast. Else sync whole range.
                  if (diffDays > 7) {
                      const newStart = new Date(syncEnd);
                      newStart.setDate(syncEnd.getDate() - 5);
                      syncStart = newStart;
                  }

                  console.log(`[PlatformOrder] Background Range Sync: ${formatDate(syncStart)} ~ ${formatDate(syncEnd)}`);
                  
                  await fetch('/api/orders/sync', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ 
                          mode: 'smart',
                          range: { start: formatDate(syncStart), end: formatDate(syncEnd) } 
                      })
                  });
              }
              // Update last sync time and refresh again to catch new orders
              setLastSyncTime(new Date().toLocaleString());
              await fetchDbOrders(true);
          })();

          // We await the background sync so the spinner stays spinning until everything is consistent.
          // The table data, however, has already updated for the user's immediate view.
          await backgroundSyncPromise;

      } catch (err) { 
          console.warn("Sync failed", err); 
      } finally {
          setIsSyncing(false);
      }
  };

  const handleSyncHistory = async () => {
      if (confirm("确定要补全 2024 年至今的历史订单吗？这将需要几分钟时间。")) {
          // Trigger silent background sync for long range
          const startStr = '2024-01-01';
          const endStr = formatDate(new Date());
          setIsSyncing(true);
          try {
             await fetch('/api/orders/sync', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ 
                      mode: 'history_crawler', // Backend handles chunks
                      range: { start: startStr, end: endStr } 
                  })
              });
              alert("历史同步任务已提交后台处理。");
          } catch(e) { alert("请求失败"); }
          finally { setIsSyncing(false); }
      }
  };

  const fetchOrderDetail = async (orderId: string) => {
      try {
          const res = await fetch('/api/orders/db/list', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ searchContent: orderId, searchType: 'amazonOrderId', unlimitedTime: 'true' })
          });
          const data = await res.json();
          if (res.ok && data.rows && data.rows.length > 0) {
              const order = data.rows[0];
              alert(`Order Detail:\nID: ${order.id}\nStatus: ${order.status}`);
          }
      } catch (e) {}
  };

  const handleSaveNote = async (orderId: string) => {
      try {
          await fetch('/api/orders/note', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, note: noteInputValue })
          });
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, localNote: noteInputValue } : o));
          setEditingNoteId(null);
      } catch (e) {
          alert("保存备注失败");
      }
  };

  // --- ACTION HANDLERS ---

  const handleReset = () => {
      localStorage.removeItem(STORAGE_KEY); // Clear persistence
      
      setSearchValue('');
      setSearchType('订单号');
      setIsUnlimitedTime(false);
      setCurrentPage(1);
      
      // Reset to Local Time Last 30 Days
      setDateRange({ start: getLocalDate(-29), end: getLocalDate(0) });
      setTimeType('订购时间');

      setSelectedSalespersons([]);
      setSelectedSites([]);
      setSelectedShops([]);
      setSelectedStatuses([]);
      setSelectedDeliveryMethod(null);
      
      setAdvFilters({
          amountMin: '',
          amountMax: '',
          isBusiness: false,
          isReplacement: false,
          isReview: false,
          negativeProfit: false,
          zeroCost: false
      });

      // TRIGGER DATA RELOAD VIA EFFECT (Fix for Closure Trap)
      // Incrementing resetKey will trigger the useEffect, which runs fetchDbOrders() 
      // with the updated state values from this render cycle.
      setResetKey(prev => prev + 1);
      
      // Trigger Auto Sync (Sync Later)
      // We use 'auto' sync mode which relies on DB anchor logic, so it doesn't need 
      // the frontend dateRange state, making it safe to call here.
      setTimeout(() => {
          syncOrders('auto');
      }, 50);
  };

  // --- EFFECTS ---

  // Initial Load Logic - Render First, Sync Later
  useEffect(() => {
      // 1. Immediately fetch DB data to show something (Fast)
      fetchDbOrders(false);

      // 2. Trigger appropriate background sync (Slow)
      if (initialState.restored) {
          syncOrders('manual');
      } else {
          syncOrders('auto');
      }
  }, []); 

  // Watch for filter changes (Normal Fetch without Sync)
  const isFirstRun = useRef(true);
  useEffect(() => {
      if (isFirstRun.current) {
          isFirstRun.current = false;
          return;
      }
      // Note: isUnlimitedTime is intentionally excluded here to allow user to toggle it
      // as a search modifier without triggering immediate fetch, aligning with "Search" button flow.
      fetchDbOrders(false); // Show loader for page/filter changes
  }, [currentPage, pageSize, selectedShops, selectedStatuses, selectedDeliveryMethod, selectedSites, dateRange, timeType, resetKey]); 

  // ... (Columns, resize, selection logic remains same) ...
  const visibleColumns = useMemo(() => columns.filter(c => c.visible), [columns]);

  const CHECKBOX_COLUMN_WIDTH = 30;
  const getStickyLeft = (index: number) => {
    let left = CHECKBOX_COLUMN_WIDTH; 
    for (let i = 0; i < index; i++) {
        const col = visibleColumns[i];
        if (col.pinned) {
            left += col.width;
        }
    }
    return left;
  };

  const handleColumnResize = (colId: string, newWidth: number) => {
      setColumns(prev => prev.map(col => col.id === colId ? { ...col, width: newWidth } : col));
  };

  const currentPageIds = useMemo(() => orders.map(o => o.id), [orders]);
  const isAllCurrentSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedRowIds.has(id));
  const isIndeterminate = currentPageIds.some(id => selectedRowIds.has(id)) && !isAllCurrentSelected;

  const handleSelectAllCurrent = () => {
      const newSet = new Set(selectedRowIds);
      if (isAllCurrentSelected) {
          currentPageIds.forEach(id => newSet.delete(id));
      } else {
          currentPageIds.forEach(id => newSet.add(id));
      }
      setSelectedRowIds(newSet);
  };

  const handleSelectRow = (id: string) => {
      const newSet = new Set(selectedRowIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedRowIds(newSet);
  };

  const handleSearch = () => {
      if (currentPage !== 1) {
          setCurrentPage(1); 
      } else {
          fetchDbOrders(false); 
      }
      setIsBatchSearchOpen(false);
  };

  const handleEraSwitch = (mode: 'current' | 'history') => {
      setEraMode(mode);
      if (mode === 'current') {
          setDateRange({ 
              start: getLocalDate(-29), 
              end: getLocalDate(0)
          });
      } else {
          setDateRange({ 
              start: new Date(`${currentYear - 1}-01-01`), 
              end: new Date(`${currentYear - 1}-12-31`) 
          });
      }
      setCurrentPage(1); 
  };

  const handleDatePreset = (preset: string | number) => {
    let newStart = getLocalDate();
    let newEnd = getLocalDate();

    if (preset === '今天') {
        newStart = getLocalDate(0);
        newEnd = getLocalDate(0);
    } else if (preset === '昨天') {
        // USE LOCAL TIME: 
        // This reflects physical "Yesterday" for the user.
        // It might be "Today" in US (still yesterday relative to US), but user sees local yesterday.
        newStart = getLocalDate(-1);
        newEnd = getLocalDate(-1); 
    } else if (typeof preset === 'number') {
        newEnd = getLocalDate(0); 
        newStart = getLocalDate(-(preset - 1));
    } else {
        const num = parseInt(String(preset).match(/\d+/)?.[0] || '0');
        if (num > 0) {
            newEnd = getLocalDate(0);
            newStart = getLocalDate(-(num - 1));
        }
    }
    
    setDateRange({ start: newStart, end: newEnd });
    setIsDatePickerOpen(false);
  };

  const handleMonthPreset = (offset: number) => {
      const date = getLocalDate(); 
      date.setMonth(date.getMonth() + offset);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      setDateRange({ start, end });
      setIsDatePickerOpen(false);
  };

  const handleCalendarSelect = (date: Date) => {
      const selectedDate = new Date(date);
      selectedDate.setHours(0,0,0,0);

      if (pickerMode === 'week') {
          const day = selectedDate.getDay();
          const diff = selectedDate.getDate() - day + (day === 0 ? -6 : 1);
          const start = new Date(selectedDate);
          start.setDate(diff);
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23,59,59,999);
          setDateRange({ start, end });
          setIsDatePickerOpen(false);
      } else {
          if (selectingStart) {
              setDateRange({ start: selectedDate, end: selectedDate });
              setSelectingStart(false);
          } else {
              let start = new Date(dateRange.start);
              let end = selectedDate;
              if (end < start) {
                  const temp = start;
                  start = end;
                  end = temp;
              }
              end.setHours(23,59,59,999);
              setDateRange({ start, end });
              setSelectingStart(true);
              setIsDatePickerOpen(false);
          }
      }
  };

  const renderCalendar = (offsetYear: number, offsetMonth: number) => {
      const viewDate = new Date(pickerViewDate);
      viewDate.setFullYear(viewDate.getFullYear() + offsetYear);
      if (pickerMode === 'day' || pickerMode === 'week') {
          viewDate.setMonth(viewDate.getMonth() + offsetMonth);
      }
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();

      if (pickerMode === 'day' || pickerMode === 'week') {
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const prevMonthLastDate = new Date(year, month, 0).getDate();
          const days = [];
          const startOffset = (firstDay + 6) % 7; 
          for(let i=startOffset-1; i>=0; i--) { days.push({ d: prevMonthLastDate - i, type: 'prev' }); }
          for(let i=1; i<=daysInMonth; i++) { days.push({ d: i, type: 'curr' }); }
          const remaining = 42 - days.length;
          for(let i=1; i<=remaining; i++) { days.push({ d: i, type: 'next' }); }

          return (
              <div className="w-[280px]">
                  <div className="flex justify-between items-center mb-4 px-2 select-none">
                      <div className="flex gap-2 text-gray-400">
                          {(pickerMode === 'week' || offsetMonth === 0) && <ChevronsLeft size={16} className="cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setPickerViewDate(new Date(year-1, month, 1)); }} />}
                          {(pickerMode === 'week' || offsetMonth === 0) && <ChevronLeft size={16} className="cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setPickerViewDate(new Date(year, month-1, 1)); }} />}
                      </div>
                      <div className="font-bold text-sm text-gray-800">{year} 年 {month + 1} 月</div>
                      <div className="flex gap-2 text-gray-400">
                          {(pickerMode === 'week' || offsetMonth === 1) && <ChevronRight size={16} className="cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setPickerViewDate(new Date(year, month-1, 1)); }} />} 
                          {(pickerMode === 'week' || offsetMonth === 1) && <ChevronsRight size={16} className="cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); setPickerViewDate(new Date(year+1, month-2, 1)); }} />}
                      </div>
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm text-gray-800 mb-2 font-medium">
                      {['一','二','三','四','五','六','日'].map(d => <div key={d} className="h-8 leading-8">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm gap-y-1">
                      {days.map((item, i) => {
                          const currentD = new Date(year, item.type === 'prev' ? month - 1 : (item.type === 'next' ? month + 1 : month), item.d);
                          let isStart = false; let isEnd = false; let isInRange = false;
                          if (pickerMode === 'week') {
                              if (dateRange.start && dateRange.end) {
                                  const cTime = currentD.setHours(0,0,0,0);
                                  const sTime = new Date(dateRange.start).setHours(0,0,0,0);
                                  const eTime = new Date(dateRange.end).setHours(0,0,0,0);
                                  if (cTime >= sTime && cTime <= eTime) {
                                      isInRange = true;
                                      if (cTime === sTime) isStart = true;
                                      if (cTime === eTime) isEnd = true;
                                  }
                              }
                          } else {
                              const cTime = currentD.setHours(0,0,0,0);
                              const sTime = new Date(dateRange.start).setHours(0,0,0,0);
                              const eTime = new Date(dateRange.end).setHours(0,0,0,0);
                              if (cTime === sTime) isStart = true;
                              if (cTime === eTime) isEnd = true;
                              if (cTime > sTime && cTime < eTime) isInRange = true;
                          }
                          let containerClass = '';
                          let textClass = 'text-gray-700 hover:bg-gray-100 rounded-full';
                          if (pickerMode === 'week') {
                              if (isInRange) {
                                  containerClass = 'bg-blue-600'; textClass = 'text-white font-bold';
                                  if (isStart) containerClass += ' rounded-l-full';
                                  else if (isEnd) containerClass += ' rounded-r-full';
                              }
                          } else {
                              if (isStart) { containerClass = isEnd ? '' : 'bg-blue-50 rounded-l-full'; textClass = 'bg-blue-600 text-white rounded-full shadow-sm relative z-10'; }
                              else if (isEnd) { containerClass = 'bg-blue-50 rounded-r-full'; textClass = 'bg-blue-600 text-white rounded-full shadow-sm relative z-10'; }
                              else if (isInRange) { containerClass = 'bg-blue-50'; textClass = 'text-gray-700'; }
                              else if (item.type !== 'curr') { textClass = 'text-gray-300'; }
                          }
                          return (
                              <div key={i} className={`h-8 w-full flex items-center justify-center cursor-pointer ${containerClass}`}
                                onClick={(e) => { e.stopPropagation(); handleCalendarSelect(currentD); }}
                                onMouseEnter={() => setHoverDate(currentD)}
                                onMouseLeave={() => setHoverDate(null)}
                              >
                                  <span className={`w-8 h-8 flex items-center justify-center transition-colors ${textClass}`}>{item.d}</span>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )
      } 
      return null;
  };

  const renderCellContent = (colId: string, order: any) => {
    const items = (order.items && order.items.length > 0) ? order.items : [{
        title: order.title,
        sku: order.sku,
        asin: order.asin,
        image_url: order.img,
        quantity: order.qty,
        price: order.amount,
        promotion_ids: null
    }];

    switch (colId) {
      case 'store':
        return (
          <div className="flex flex-col items-start justify-center h-full">
             <span className="text-[13px] text-blue-600 font-medium hover:underline cursor-pointer leading-tight mb-1" title={order.store}>
                {order.store}
             </span>
             <span className="text-[13px] text-gray-400 leading-tight">
                {MARKETPLACE_MAP[order.region] || order.region}
             </span>
          </div>
        );
      case 'orderId':
         return (
             <div className="flex flex-col items-start gap-0.5">
                 <span 
                    className="text-blue-600 font-medium hover:underline cursor-pointer font-sans text-[13px]"
                    onClick={() => fetchOrderDetail(order.id)} 
                 >
                    {order.id}
                 </span>
                 <div className="flex items-center mt-0.5">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg" 
                        alt="Amazon" 
                        className="w-4 h-4 object-contain opacity-90"
                    />
                 </div>
             </div>
         );
      case 'sellerOrderId':
          return <span className="text-gray-500">{order.sellerOrderId}</span>;
      case 'orderTime':
          if (!order.orderTime || order.orderTime === '-') return <span className="text-gray-300">-</span>;
          const timeStr = String(order.orderTime);
          const [datePart, timePart] = timeStr.includes(' ') ? timeStr.split(' ') : [timeStr, ''];
          return (
              <div className="flex flex-col text-[11px]">
                  <span className="text-gray-900">{datePart}</span>
                  <span className="text-gray-400">{timePart}</span>
              </div>
          );
      case 'paymentTime':
      case 'refundTime':
          const t = order[colId];
          if (!t || t === '-') return <span className="text-gray-300">-</span>;
          const tStr = String(t);
          const [pDate, pTime] = tStr.includes(' ') ? tStr.split(' ') : [tStr, ''];
           return (
              <div className="flex flex-col text-[11px]">
                  <span className="text-gray-900">{pDate}</span>
                  <span className="text-gray-400">{pTime}</span>
              </div>
          );
      case 'status':
          return (
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${order.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : order.status === 'Canceled' ? 'bg-gray-50 text-gray-500 border-gray-200' : (order.status === 'Shipped' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200')}`}>
                  {order.status}
              </span>
          );
      case 'sales':
          return <span className="font-bold text-gray-800">{order.sales}</span>;
      case 'titleSku':
          return (
              <div className="flex flex-col w-full">
                  {items.map((item: any, idx: number) => (
                      <div key={idx} className={`flex flex-col w-full min-h-[48px] justify-center ${idx > 0 ? 'mt-2 pt-2 border-t border-dashed border-gray-200' : ''}`}>
                          <div className="text-[12px] text-gray-800 leading-tight mb-1 truncate" title={item.title}>
                              {item.title}
                          </div>
                          <span className="text-gray-500 font-mono text-[11px]">{item.sku}</span>
                      </div>
                  ))}
              </div>
          );
      case 'productInfo':
          return (
              <div className="flex flex-col w-full">
                  {items.map((item: any, idx: number) => (
                      <div key={idx} className={`flex gap-2 items-start w-full min-h-[48px] ${idx > 0 ? 'mt-2 pt-2 border-t border-dashed border-gray-200' : ''}`}>
                          <div className="relative w-10 h-10 shrink-0 border border-gray-200 rounded-sm overflow-hidden bg-gray-50">
                              <img src={item.image_url || 'https://via.placeholder.com/40'} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')} />
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 justify-center h-10">
                              <div className="flex items-center gap-1 text-gray-500 text-[11px]">
                                  <span>ASIN:</span>
                                  <span className="text-blue-600 hover:underline cursor-pointer font-medium">{item.asin}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 min-w-0 text-[11px]">
                                  <span>MSKU:</span>
                                  <span className="text-gray-600 truncate font-mono" title={item.sku}>{item.sku}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          );
      case 'qty':
          return (
              <div className="flex flex-col w-full items-end">
                  {items.map((item: any, idx: number) => (
                      <div key={idx} className={`flex flex-col min-h-[48px] justify-center w-full items-end ${idx > 0 ? 'mt-2 pt-2 border-t border-dashed border-gray-200' : ''}`}>
                          <span className="text-gray-900 font-medium">{item.quantity}</span>
                      </div>
                  ))}
              </div>
          );
      case 'refundQty':
          return <span className="text-gray-400">{order.refundQty}</span>;
      case 'promoCode':
          return (
              <div className="flex flex-col w-full items-center">
                  {items.map((item: any, idx: number) => (
                      <div key={idx} className={`flex flex-col min-h-[48px] justify-center w-full items-center ${idx > 0 ? 'mt-2 pt-2 border-t border-dashed border-gray-200' : ''}`}>
                          <span className="text-gray-400 text-[10px]">{item.promotion_ids || '-'}</span>
                      </div>
                  ))}
              </div>
          );
      case 'amount':
          return (
              <div className="flex flex-col w-full items-end justify-center h-full">
                  <span className="font-bold text-gray-800">{order.amount}</span>
              </div>
          );
      case 'profit':
          return (
              <div className="flex flex-col items-start justify-center">
                  <span className="text-[13px] text-gray-900 font-medium font-sans">{order.profit}</span>
                  <span className="text-[13px] text-gray-400 font-sans">{order.margin}</span>
              </div>
          );
      case 'note':
          const isEditing = editingNoteId === order.id;
          return (
              <div className="flex flex-col items-start w-full gap-1 group/note relative min-h-[30px] justify-center">
                  {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                          <input 
                            autoFocus
                            className="w-full border border-blue-400 rounded px-1 py-0.5 text-xs outline-none shadow-sm"
                            value={noteInputValue}
                            onChange={(e) => setNoteInputValue(e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') handleSaveNote(order.id); else if (e.key === 'Escape') setEditingNoteId(null); }}
                            onBlur={() => handleSaveNote(order.id)}
                          />
                      </div>
                  ) : (
                      <>
                        <div className="flex items-center gap-2 w-full">
                            <span className={`truncate text-xs ${order.localNote ? 'text-gray-800 font-medium' : 'text-gray-300'}`}>
                                {order.localNote || '无本地备注'}
                            </span>
                            <Edit 
                                size={12} 
                                className="text-gray-400 hover:text-blue-600 cursor-pointer opacity-0 group-hover/note:opacity-100 transition-opacity" 
                                onClick={() => { setEditingNoteId(order.id); setNoteInputValue(order.localNote || ''); }}
                            />
                        </div>
                        {order.note !== '-' && (
                            <span className="text-[10px] text-gray-400 truncate max-w-full bg-gray-50 px-1 rounded">买家: {order.note}</span>
                        )}
                      </>
                  )}
              </div>
          );
      case 'buyer':
          return (
              <div className="flex flex-col text-[11px]">
                  <span className="text-gray-600">{order.buyer}</span>
                  <span className="text-gray-400 scale-90 origin-left">{order.buyerEmail}</span>
              </div>
          );
       case 'invoiceStatus':
          return order.invoiceStatus === '-' ? <span className="text-gray-300">-</span> : <span>{order.invoiceStatus}</span>;
       case 'reqReview':
          return (
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${order.reqReview === '平台请求' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {order.reqReview}
              </span>
          );
      case 'reviewer':
          return order.reviewer === '-' ? <span className="text-gray-300">-</span> : <span>{order.reviewer}</span>;
      default:
        return null;
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  
  const getPaginationItems = () => {
      const items: (number | string)[] = [];
      if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) items.push(i); }
      else {
          if (currentPage <= 4) { items.push(1, 2, 3, 4, 5, 6, '...', totalPages); }
          else if (currentPage >= totalPages - 3) { items.push(1, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages); }
          else { items.push(1, '...', currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, '...', totalPages); }
      }
      return items;
  };

  return (
    <div className="flex flex-col bg-white shadow-sm border border-slate-200 rounded-sm" style={{ height: 'calc(100vh - 140px)' }}>
      {/* ... (Rest of the JSX remains identical) ... */}
      <CustomColumnsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        columns={columns} 
        onSave={handleSaveColumns}
        defaultColumns={INITIAL_COLUMNS}
      />

      {/* 1. Platform Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 px-2 pt-2">
         <div className="px-4 py-1.5 bg-white border-t border-l border-r border-gray-200 rounded-t-sm text-xs font-bold text-blue-600 cursor-pointer shadow-sm relative -bottom-px z-10">
           亚马逊
         </div>
         <div className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border-t border-transparent hover:bg-gray-100 rounded-t-sm">
           多平台
         </div>
      </div>

      {/* 2. Filter Area */}
      <div className="p-3 bg-white border-b border-gray-200 space-y-3">
        {/* ... Filter controls ... */}
        <div className="flex flex-wrap items-center gap-2">
           <div className="flex rounded-md overflow-hidden border border-blue-100">
             <button 
                onClick={() => handleEraSwitch('current')}
                className={`px-3 py-1 text-xs font-medium transition-colors ${eraMode === 'current' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
             >
                {currentYear}年至今
             </button>
             <button 
                onClick={() => handleEraSwitch('history')}
                className={`px-3 py-1 text-xs font-medium transition-colors border-l border-gray-100 ${eraMode === 'history' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
             >
                历史订单
             </button>
           </div>
           
           <div className="h-4 w-px bg-gray-200 mx-1"></div>

           <SalespersonFilterDropdown 
              key={`sp-${resetKey}`}
              onChange={setSelectedSalespersons}
              className="w-28" 
           />
           
           <SiteFilterDropdown key={`site-${resetKey}`} onChange={setSelectedSites} />
           <ShopFilterDropdown key={`shop-${resetKey}`} onChange={setSelectedShops} returnField="name" />
           <StatusFilterDropdown key={`status-${resetKey}`} onChange={setSelectedStatuses} />
           <DeliveryMethodFilterDropdown key={`del-${resetKey}`} onChange={setSelectedDeliveryMethod} />

           <div className="flex rounded border border-gray-200 hover:border-blue-400 transition-colors bg-white h-7 relative">
              {/* ... (Date picker code unchanged) ... */}
              <div className="relative border-r border-gray-200 h-full" ref={timeTypeRef}>
                <button 
                  onClick={() => { setIsTimeTypeOpen(!isTimeTypeOpen); setIsDatePickerOpen(false); }}
                  className={`h-full px-2 flex items-center gap-1 text-xs text-gray-700 hover:bg-gray-50 min-w-[80px] justify-between ${isTimeTypeOpen ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  <span className="truncate">{timeType}</span>
                  <ChevronDown size={12} className={`transition-transform flex-shrink-0 ${isTimeTypeOpen ? 'rotate-180 text-blue-600' : 'text-gray-400'}`} />
                </button>
                {isTimeTypeOpen && (
                  <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-gray-200 shadow-xl rounded z-50 py-1 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                    {['订购时间', '付款时间', '退款时间'].map(t => (
                      <button 
                        key={t}
                        onClick={() => { setTimeType(t); setIsTimeTypeOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 hover:text-blue-600 transition-colors ${timeType === t ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex-1 h-full" ref={datePickerRef}>
                  <div 
                    className="flex items-center px-2 cursor-pointer hover:bg-gray-50 h-full min-w-[170px]"
                    onClick={() => { 
                        setIsDatePickerOpen(!isDatePickerOpen); 
                        setIsTimeTypeOpen(false); 
                    }}
                  >
                     <Calendar size={12} className="text-gray-400 mr-2" />
                     <span className="text-xs text-gray-600">{formatDate(dateRange.start)} ~ {formatDate(dateRange.end)}</span>
                  </div>

                  {isDatePickerOpen && (
                     <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md z-50 flex animate-in fade-in zoom-in-95 duration-100 origin-top-left">
                        <div className="w-20 py-2 border-r border-gray-100 flex flex-col text-sm text-gray-600">
                            {['按天', '按周', '按月', '按季', '按年'].map(mode => (
                                <button 
                                    key={mode} 
                                    onClick={() => {
                                        setPickerMode(mode === '按天' ? 'day' : mode === '按周' ? 'week' : mode === '按月' ? 'month' : mode === '按季' ? 'quarter' : 'year');
                                    }}
                                    className={`text-left px-4 py-2 hover:text-blue-600 transition-colors ${(pickerMode === 'day' && mode==='按天') || (pickerMode==='week' && mode==='按周') || (pickerMode==='month' && mode==='按月') || (pickerMode==='quarter' && mode==='按季') || (pickerMode==='year' && mode==='按年') ? 'text-blue-600 font-medium bg-blue-50/50' : ''}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {pickerMode === 'day' && (
                            <div className="w-32 py-2 border-r border-gray-100 flex flex-col text-sm text-gray-600 gap-1 overflow-y-auto max-h-[360px]">
                                {['今天', '昨天', '最近7天', '最近14天', '最近30天', '最近60天'].map(p => (
                                    <button key={p} onClick={() => handleDatePreset(p)} className="text-left px-4 py-1.5 hover:text-blue-600 hover:bg-gray-50 transition-colors">{p}</button>
                                ))}
                                <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                {['本周', '上周', '本月', '上月'].map(p => (
                                    <button key={p} onClick={() => {
                                        if(p.includes('月')) handleMonthPreset(p==='本月'?0:-1);
                                        else handleDatePreset(7); 
                                    }} className="text-left px-4 py-1.5 hover:text-blue-600 hover:bg-gray-50 transition-colors">{p}</button>
                                ))}
                            </div>
                        )}
                        
                        <div className="p-4 bg-white flex gap-8">
                            {renderCalendar(0, 0)}
                            {(pickerMode === 'day' || pickerMode === 'month' || pickerMode === 'quarter') && renderCalendar(pickerMode === 'day' ? 0 : 1, pickerMode === 'day' ? 1 : 0)}
                        </div>
                     </div>
                  )}
              </div>
           </div>
           
           {/* ... Search Inputs ... */}
           <div className="flex items-center border border-gray-200 rounded ml-2 hover:border-blue-400 transition-colors h-7 bg-white relative">
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
                    {['订单号', '卖家订单号', 'ASIN', '父ASIN', 'MSKU', 'SKU', '品名', '标题', '买家邮箱', '备注', '促销编码', '物流商', '运单号'].map(t => (
                      <button 
                        key={t}
                        onClick={() => { setSearchType(t); setIsSearchTypeOpen(false); }}
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
                placeholder="双击批量搜索内容" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onDoubleClick={() => { setIsBatchSearchOpen(true); setIsSearchTypeOpen(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button 
                onClick={handleSearch}
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
                              onChange={(e) => setSearchValue(e.target.value)}
                              autoFocus
                          />
                      </div>
                      <div className="flex items-center justify-between px-3 py-3 border-t border-gray-100 mt-2 bg-gray-50/50 rounded-b-md">
                          <button 
                            onClick={() => setSearchValue('')}
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
                                onClick={handleSearch}
                                className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 shadow-sm"
                              >
                                  搜索
                              </button>
                          </div>
                      </div>
                  </div>
              )}
           </div>

           <div className="flex items-center gap-2 ml-2">
             <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
               <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" 
                  checked={isUnlimitedTime}
                  onChange={(e) => setIsUnlimitedTime(e.target.checked)}
               />
               不限时间
             </label>
             
             <div className="relative" ref={advancedFilterRef}>
                 <button 
                    onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                    className={`flex items-center justify-center w-7 h-7 rounded border transition-colors ${
                        (advFilters.amountMin || advFilters.amountMax || advFilters.isBusiness || advFilters.isReplacement || advFilters.negativeProfit || advFilters.zeroCost)
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-blue-400 text-gray-500 hover:text-blue-600 bg-white'
                    }`}
                    title="高级筛选"
                 >
                    <Filter size={14} />
                 </button>

                 {isAdvancedFilterOpen && (
                     <div className="absolute top-full left-0 mt-2 w-[400px] bg-white border border-gray-200 shadow-xl rounded-md z-[70] animate-in fade-in zoom-in-95 duration-100 flex flex-col p-4 origin-top-left">
                         {/* ... (Existing Advanced Filter UI) ... */}
                         <div className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                             <Filter size={14} /> 高级筛选
                         </div>
                         
                         <div className="mb-4">
                             <div className="text-xs text-gray-500 mb-1.5">订单金额范围</div>
                             <div className="flex items-center gap-2">
                                 <div className="relative flex-1">
                                     <DollarSign size={12} className="absolute left-2 top-1.5 text-gray-400" />
                                     <input 
                                        type="number" 
                                        placeholder="Min" 
                                        className="w-full border border-gray-300 rounded pl-6 pr-2 py-1 text-xs focus:border-blue-500 outline-none"
                                        value={advFilters.amountMin}
                                        onChange={e => setAdvFilters({...advFilters, amountMin: e.target.value})}
                                     />
                                 </div>
                                 <span className="text-gray-400">-</span>
                                 <div className="relative flex-1">
                                     <DollarSign size={12} className="absolute left-2 top-1.5 text-gray-400" />
                                     <input 
                                        type="number" 
                                        placeholder="Max" 
                                        className="w-full border border-gray-300 rounded pl-6 pr-2 py-1 text-xs focus:border-blue-500 outline-none"
                                        value={advFilters.amountMax}
                                        onChange={e => setAdvFilters({...advFilters, amountMax: e.target.value})}
                                     />
                                 </div>
                             </div>
                         </div>

                         <div className="mb-4">
                             <div className="text-xs text-gray-500 mb-1.5">订单属性</div>
                             <div className="flex flex-wrap gap-2">
                                 <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${advFilters.isBusiness ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                     <input type="checkbox" className="hidden" checked={advFilters.isBusiness} onChange={e => setAdvFilters({...advFilters, isBusiness: e.target.checked})} />
                                     <span>B2B订单</span>
                                 </label>
                                 <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${advFilters.isReplacement ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                     <input type="checkbox" className="hidden" checked={advFilters.isReplacement} onChange={e => setAdvFilters({...advFilters, isReplacement: e.target.checked})} />
                                     <span>换货订单</span>
                                 </label>
                                 <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${advFilters.isReview ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                     <input type="checkbox" className="hidden" checked={advFilters.isReview} onChange={e => setAdvFilters({...advFilters, isReview: e.target.checked})} />
                                     <span>测评订单</span>
                                 </label>
                             </div>
                         </div>

                         <div className="mb-4">
                             <div className="text-xs text-gray-500 mb-1.5">异常状态</div>
                             <div className="flex flex-wrap gap-2">
                                 <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${advFilters.negativeProfit ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                     <input type="checkbox" className="hidden" checked={advFilters.negativeProfit} onChange={e => setAdvFilters({...advFilters, negativeProfit: e.target.checked})} />
                                     <AlertTriangle size={12} />
                                     <span>利润为负</span>
                                 </label>
                                 <label className={`flex items-center gap-1 px-3 py-1.5 rounded border text-xs cursor-pointer transition-colors ${advFilters.zeroCost ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                     <input type="checkbox" className="hidden" checked={advFilters.zeroCost} onChange={e => setAdvFilters({...advFilters, zeroCost: e.target.checked})} />
                                     <AlertTriangle size={12} />
                                     <span>成本/运费为0</span>
                                 </label>
                             </div>
                         </div>

                         <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                             <button 
                                onClick={() => setAdvFilters({ amountMin: '', amountMax: '', isBusiness: false, isReplacement: false, isReview: false, negativeProfit: false, zeroCost: false })}
                                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                             >
                                 清空条件
                             </button>
                             <button 
                                onClick={() => { setIsAdvancedFilterOpen(false); fetchDbOrders(false); }}
                                className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shadow-sm"
                             >
                                 查询
                             </button>
                         </div>
                     </div>
                 )}
             </div>

             <button 
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors ml-1"
             >
               重置
             </button>
           </div>
        </div>
      </div>

      {/* 3. Action Bar */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex flex-wrap gap-y-2 justify-between items-center">
         {/* ... (Existing Action Bar) ... */}
         {/* ... */}
         <div className="flex items-center gap-4">
            {eraMode === 'history' && (
                <ActionButton 
                    label={isSyncing ? "正在补全..." : "补全历史订单"} 
                    onClick={() => handleSyncHistory()} 
                    icon={isSyncing ? <Loader2 size={12} className="animate-spin"/> : <RefreshCw size={12}/>}
                    primary 
                />
            )}
            {lastSyncTime && (
                <div className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
                    <Clock size={10} /> 最近同步: {lastSyncTime}
                </div>
            )}
            <div className="h-4 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
                <ActionButton label="导入费用" hasDropdown />
                <ActionButton label="标记测评" hasDropdown />
                <ActionButton label="上传发票" hasDropdown />
                <ActionButton label="导入成本" hasDropdown />
                <ActionButton label="更多" hasDropdown />
            </div>
         </div>
         
         <div className="flex items-center gap-4 text-xs text-gray-600">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Settings size={14} /> 自定义列
            </button>
            <div className="flex items-center gap-1 text-gray-400">
              <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><LayoutGrid size={15}/></button>
              <button 
                className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded" 
                onClick={() => syncOrders('manual', orders.map(o => o.id))} 
                title="刷新并同步当前时间范围数据"
              >
                  <RefreshCw size={15} className={isSyncing ? 'animate-spin text-blue-600' : ''}/>
              </button>
              <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><Download size={15}/></button>
              <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><HelpCircle size={15}/></button>
            </div>
         </div>
      </div>

      {/* 4. Table */}
      <div className="flex-1 overflow-x-auto overflow-y-scroll bg-white scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-100 relative min-h-0">
        <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[2800px]">
           <thead className="bg-gray-50 sticky top-0 z-40 text-gray-600 font-medium shadow-sm h-10">
             {/* ... (Table Header) ... */}
             <tr>
               <th className="p-2 w-[30px] text-center sticky left-0 z-[60] bg-gray-50 border-b border-gray-100 border-r border-gray-200 h-10">
                   <div className="flex items-center justify-center">
                       <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                            checked={isAllCurrentSelected}
                            ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                            onChange={handleSelectAllCurrent}
                       />
                   </div>
               </th>
               
               {visibleColumns.map((col, idx) => {
                 const isPinned = col.pinned;
                 const pinnedCount = visibleColumns.filter(c => c.pinned).length;
                 const stickyStyle: React.CSSProperties = {
                   position: 'sticky',
                   top: 0,
                   zIndex: isPinned ? 50 : 40,
                   left: isPinned ? `${getStickyLeft(idx)}px` : undefined,
                   backgroundColor: '#f9fafb',
                   boxShadow: isPinned && idx === pinnedCount - 1 ? '4px 0 8px -4px rgba(0,0,0,0.1)' : 'none',
                   borderRight: '1px solid #f3f4f6',
                   borderBottom: '1px solid #f3f4f6'
                 };

                 return (
                   <TableHeader 
                      key={col.id} 
                      align={col.align} 
                      hasSort={col.hasSort}
                      hasHelp={col.hasHelp}
                      className={isPinned ? 'bg-gray-50' : ''}
                      style={stickyStyle}
                      onResize={(newWidth) => handleColumnResize(col.id, newWidth)}
                   >
                     <div style={{ width: col.width }} className="truncate">
                       {col.label}
                     </div>
                   </TableHeader>
                 );
               })}

               <th className="p-2 font-medium text-center sticky top-0 right-0 z-[60] bg-gray-50 border-b border-gray-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] h-10">
                 <div className="flex items-center justify-center h-full w-20">操作</div>
               </th>
             </tr>
           </thead>
           <tbody className="text-gray-700">
             {/* ... (Table Body) ... */}
             {isLoading ? (
                 <tr><td colSpan={20} className="p-20 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> 数据加载中...</td></tr>
             ) : orders.length === 0 ? (
                 <tr>
                    <td colSpan={20} className="p-20 text-center text-gray-400">
                        {errorMsg ? <span className="text-red-500">{errorMsg}</span> : (
                            <div className="flex flex-col items-center gap-2">
                                <span>暂无数据 (当前时间范围无订单)</span>
                                {eraMode === 'history' && (
                                    <div className="flex items-center gap-2 text-xs bg-orange-50 text-orange-600 px-3 py-1.5 rounded border border-orange-100">
                                        <AlertTriangle size={12} />
                                        提示：本地数据库暂无历史数据，请点击左上角“补全历史订单”抓取数据。
                                    </div>
                                )}
                            </div>
                        )}
                    </td>
                 </tr>
             ) : (
             orders.map((order, idx) => (
               <tr key={idx} className={`transition-colors group ${selectedRowIds.has(order.id) ? 'bg-blue-50' : 'hover:bg-blue-50'}`}>
                 <td className={`p-2 text-center sticky left-0 z-30 border-b border-gray-100 border-r border-gray-200 transition-colors ${selectedRowIds.has(order.id) ? 'bg-blue-50' : 'bg-white group-hover:bg-blue-50'}`}>
                     <div className="flex items-center justify-center">
                        <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer" 
                            checked={selectedRowIds.has(order.id)}
                            onChange={() => handleSelectRow(order.id)}
                        />
                     </div>
                 </td>

                 {visibleColumns.map((col, cIdx) => {
                    const isPinned = col.pinned;
                    const pinnedCount = visibleColumns.filter(c => c.pinned).length;
                    const stickyStyle: React.CSSProperties = isPinned ? {
                      position: 'sticky',
                      left: `${getStickyLeft(cIdx)}px`,
                      zIndex: 30,
                      backgroundColor: selectedRowIds.has(order.id) ? '#eff6ff' : 'white', 
                      boxShadow: cIdx === pinnedCount - 1 ? '4px 0 8px -4px rgba(0,0,0,0.1)' : 'none',
                      borderRight: '1px solid #f3f4f6'
                    } : {};

                    return (
                      <td 
                        key={col.id} 
                        className={`p-2 border-b border-gray-100 ${isPinned ? (selectedRowIds.has(order.id) ? 'bg-blue-50' : 'group-hover:bg-blue-50') : ''} align-top`}
                        // @ts-ignore
                        style={stickyStyle}
                      >
                        <div className={`flex ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                           {renderCellContent(col.id, order)}
                        </div>
                      </td>
                    );
                 })}
                 
                 <td className={`p-2 text-center sticky right-0 z-30 border-b border-gray-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] transition-colors ${selectedRowIds.has(order.id) ? 'bg-blue-50' : 'bg-white group-hover:bg-blue-50'}`}>
                   <div className="flex items-center justify-center gap-2">
                     <span className="text-blue-600 hover:underline cursor-pointer whitespace-nowrap">联系买家</span>
                     <MoreHorizontal size={14} className="text-blue-600 cursor-pointer hover:bg-blue-100 rounded" />
                   </div>
                 </td>
               </tr>
             )))}
           </tbody>
        </table>
      </div>
      
      {/* 5. Footer (Pagination) */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs select-none">
        <div className="text-gray-600">
            已选 <span className="font-bold text-gray-900 px-1">{selectedRowIds.size}</span> 条
        </div>
        <div className="flex items-center gap-4">
          <div className="text-gray-600 mr-2">
              共 <span className="font-bold text-gray-900 px-1">{totalItems}</span> 条
          </div>
          
          <div className="flex items-center gap-1">
             <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-6 h-6 flex items-center justify-center border border-transparent hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
             >
                <ChevronLeft size={14} />
             </button>
             
             {getPaginationItems().map((p, idx) => (
                 <React.Fragment key={idx}>
                     {p === '...' ? (
                         <span className="w-6 h-6 flex items-center justify-center text-gray-400">...</span>
                     ) : (
                         <button 
                            onClick={() => setCurrentPage(Number(p))}
                            className={`w-6 h-6 flex items-center justify-center rounded border transition-colors
                                ${currentPage === p 
                                    ? 'bg-blue-50 text-blue-600 border-blue-600 font-medium' 
                                    : 'border-transparent hover:bg-gray-100 text-gray-600'
                                }`
                            }
                         >
                            {p}
                         </button>
                     )}
                 </React.Fragment>
             ))}

             <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-6 h-6 flex items-center justify-center border border-transparent hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
             >
                <ChevronRight size={14} />
             </button>
          </div>

          <PageSizeSelector 
            value={pageSize} 
            onChange={(val) => {
                setPageSize(val);
                setCurrentPage(1);
            }} 
          />

          <div className="flex items-center gap-1 text-gray-500">
             前往 
             <input 
                type="text" 
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const p = parseInt(jumpPageInput);
                        if (!isNaN(p) && p >= 1 && p <= totalPages) {
                            setCurrentPage(p);
                        }
                    }
                }}
                className="w-8 h-6 border border-gray-200 text-center text-xs rounded outline-none focus:border-blue-500 bg-gray-50 mx-1" 
             /> 
             页
          </div>
        </div>
      </div>
    </div>
  );
};
