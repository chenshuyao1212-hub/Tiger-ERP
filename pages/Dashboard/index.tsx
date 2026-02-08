
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  RefreshCw, 
  Settings, 
  ChevronRight, 
  Maximize2,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- Sub-components ---

const KpiBlock = ({ label, value, sub1, sub2, isPositive1, isPositive2 }: any) => (
  <div className="flex flex-col animate-in fade-in duration-500">
    <div className="text-xs text-gray-500 mb-1">{label}</div>
    <div className="text-lg font-bold text-gray-800 mb-1">{value}</div>
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-gray-400">环比</span>
      <span className={`flex items-center ${isPositive1 ? 'text-green-500' : 'text-red-500'}`}>
        {sub1} {isPositive1 ? '↑' : '↓'}
      </span>
    </div>
    <div className="flex items-center gap-2 text-[10px]">
      <span className="text-gray-400">同比</span>
      <span className={`flex items-center ${isPositive2 ? 'text-green-500' : 'text-red-500'}`}>
        {sub2} {isPositive2 ? '↑' : '↓'}
      </span>
    </div>
  </div>
);

const SectionHeader = ({ title, extra }: { title: string, extra?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
      {title}
      <ChevronRight size={14} className="text-gray-400" />
    </h3>
    {extra}
  </div>
);

const TodoCard = ({ title, colorClass, icon, children }: any) => (
  <div className="bg-gray-50 rounded p-3 flex-1 min-w-[200px]">
    <div className={`flex items-center gap-1 text-xs font-bold mb-3 ${colorClass}`}>
      {icon} {title}
    </div>
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
      {children}
    </div>
  </div>
);

const TodoItem = ({ label, value, isRed = false }: any) => (
  <div>
    <div className="text-[10px] text-gray-400 mb-0.5 transform scale-95 origin-left">{label}</div>
    <div className={`font-bold text-sm ${isRed ? 'text-red-500' : 'text-gray-800'}`}>{value}</div>
  </div>
);

// --- Main Dashboard Component ---

export const Dashboard = ({ onOpenTab }: { onOpenTab?: (id: string, label: string) => void }) => {
  // --- Data States ---
  const [overviewData, setOverviewData] = useState<any>(null);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [taskData, setTaskData] = useState<any>(null);
  
  // --- UI States ---
  const [period, setPeriod] = useState('today'); // 'today', 'week', 'month'
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const [isRefreshingRanking, setIsRefreshingRanking] = useState(false);

  // --- Fetch Functions ---
  const fetchOverview = async (selectedPeriod = period) => {
      setIsLoadingOverview(true);
      try {
          const res = await fetch(`/api/dashboard/overview?period=${selectedPeriod}`);
          if (res.ok) setOverviewData(await res.json());
      } catch (e) { console.error(e); }
      setIsLoadingOverview(false);
  };

  const fetchRanking = async (isRefresh = false) => {
      if (isRefresh) setIsRefreshingRanking(true); else setIsLoadingRanking(true);
      try {
          const res = await fetch('/api/dashboard/ranking');
          if (res.ok) setRankingData(await res.json());
      } catch (e) { console.error(e); }
      setIsLoadingRanking(false);
      setIsRefreshingRanking(false);
  };

  const fetchTasks = async () => {
      try {
          const res = await fetch('/api/dashboard/tasks');
          if (res.ok) setTaskData(await res.json());
      } catch (e) { console.error(e); }
  };

  // --- Initial Load ---
  useEffect(() => {
      fetchOverview();
      fetchRanking();
      fetchTasks();
  }, []);

  // --- Period Change Handler ---
  const handlePeriodChange = (newPeriod: string) => {
      setPeriod(newPeriod);
      fetchOverview(newPeriod);
  };

  // --- Skeleton Loaders ---
  if (!overviewData && isLoadingOverview) {
      return (
          <div className="p-8 flex items-center justify-center h-full text-gray-400 gap-2">
              <Loader2 className="animate-spin" /> 正在加载数据...
          </div>
      );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-full pb-6">
      {/* 1. Global Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-sm border border-gray-200 shadow-sm">
        <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-gray-50">
          <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">全部站点</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
        <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-gray-50">
          <span className="text-xs text-gray-500 mr-2 whitespace-nowrap">全部店铺</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
        <div className="flex items-center border border-gray-200 rounded px-2 py-1 bg-gray-50">
          <span className="text-xs text-gray-500 mr-2">USD</span>
          <ChevronDown size={12} className="text-gray-400" />
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400 whitespace-nowrap overflow-hidden">
           <span>北京: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
           <button className="text-blue-600 flex items-center gap-1">+ 添加时钟</button>
           <span className="hidden sm:inline">|</span>
           <span className="hidden sm:inline">初始化引导</span>
           <HelpCircle size={14} className="hidden sm:block" />
        </div>
      </div>

      {/* 2. Top Metrics Row (Sea Seller Assistant) */}
      <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm group">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onOpenTab && onOpenTab('real_time', '海卖助手')}
          >
             <div className="bg-blue-600 p-1 rounded-sm"><RefreshCw size={12} className="text-white"/></div>
             <span className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">海卖助手</span>
             <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="flex bg-gray-100 rounded p-0.5">
             <button onClick={() => handlePeriodChange('today')} className={`text-xs px-2 py-0.5 transition-colors ${period === 'today' ? 'bg-white shadow-sm text-blue-600 rounded-sm font-medium' : 'text-gray-500'}`}>站点今日</button>
             <button onClick={() => handlePeriodChange('week')} className={`text-xs px-2 py-0.5 transition-colors ${period === 'week' ? 'bg-white shadow-sm text-blue-600 rounded-sm font-medium' : 'text-gray-500'}`}>本周</button>
             <button onClick={() => handlePeriodChange('month')} className={`text-xs px-2 py-0.5 transition-colors ${period === 'month' ? 'bg-white shadow-sm text-blue-600 rounded-sm font-medium' : 'text-gray-500'}`}>本月</button>
          </div>
        </div>
        {isLoadingOverview ? (
            <div className="h-20 flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" /></div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mt-4 animate-in fade-in duration-500">
            {[
                { label: '销量', val: overviewData?.kpi?.sales || '-', sub: '昨日: -' },
                { label: '销售额(USD)', val: overviewData?.kpi?.revenue || '-', sub: '昨日: -' },
                { label: '订单量', val: overviewData?.kpi?.orders || '-', sub: '昨日: -' },
                { label: '商品均价(USD)', val: overviewData?.kpi?.avgPrice || '-', sub: '昨日: -' },
                { label: '取消订单数', val: overviewData?.kpi?.canceled || '0', sub: '昨日: -' },
            ].map((item, idx) => (
                <div key={idx} className="flex flex-col border-r last:border-0 border-gray-100 pr-4">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">{item.label} <HelpCircle size={10} className="text-gray-300"/></div>
                    <div className="text-2xl font-bold text-gray-800">{item.val}</div>
                    <div className="text-xs text-gray-400 mt-1">{item.sub}</div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* 3. Main Chart & Right Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Chart & KPI (9 cols) */}
        <div className="col-span-1 lg:col-span-9 bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex flex-col">
           <div className="flex flex-wrap items-center justify-between mb-4 border-b border-gray-100 pb-3 gap-2">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">综合指标 <ChevronRight size={14} className="text-gray-400" /></h3>
              <div className="flex flex-wrap items-center gap-2">
                 <div className="flex bg-gray-100 rounded p-0.5 text-xs overflow-x-auto">
                    <button onClick={() => handlePeriodChange('today')} className={`px-2 py-0.5 whitespace-nowrap transition-colors ${period === 'today' ? 'bg-white shadow-sm text-blue-600 rounded-sm' : 'text-gray-500'}`}>站点今日</button>
                    <button onClick={() => handlePeriodChange('week')} className={`px-2 py-0.5 whitespace-nowrap transition-colors ${period === 'week' ? 'bg-white shadow-sm text-blue-600 rounded-sm' : 'text-gray-500'}`}>本周</button>
                    <button onClick={() => handlePeriodChange('month')} className={`px-2 py-0.5 whitespace-nowrap transition-colors ${period === 'month' ? 'bg-white shadow-sm text-blue-600 rounded-sm' : 'text-gray-500'}`}>本月</button>
                 </div>
                 <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded px-2 py-0.5">
                    <span className="whitespace-nowrap">指标对比</span>
                    <ChevronDown size={12} />
                 </div>
                 <Settings size={14} className="text-gray-400 cursor-pointer" />
                 <Maximize2 size={14} className="text-gray-400 cursor-pointer" />
              </div>
           </div>
           
           {isLoadingOverview ? (
               <div className="h-[400px] flex items-center justify-center text-gray-400"><Loader2 className="animate-spin" size={32} /></div>
           ) : (
               <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 mb-6">
                    <KpiBlock label="销量" value={overviewData?.comprehensive?.sales?.value} sub1={overviewData?.comprehensive?.sales?.sub1} sub2={overviewData?.comprehensive?.sales?.sub2} isPositive1={true} isPositive2={true} />
                    <KpiBlock label="订单量" value={overviewData?.comprehensive?.orders?.value} sub1={overviewData?.comprehensive?.orders?.sub1} sub2={overviewData?.comprehensive?.orders?.sub2} isPositive1={true} isPositive2={true} />
                    <KpiBlock label="销售额(USD)" value={overviewData?.comprehensive?.revenue?.value} sub1={overviewData?.comprehensive?.revenue?.sub1} sub2={overviewData?.comprehensive?.revenue?.sub2} isPositive1={true} isPositive2={true} />
                    <KpiBlock label="广告花费(USD)" value={overviewData?.comprehensive?.adSpend?.value} sub1={overviewData?.comprehensive?.adSpend?.sub1} sub2={overviewData?.comprehensive?.adSpend?.sub2} isPositive1={false} isPositive2={false} />
                    
                    <KpiBlock label="广告销售额(USD)" value={overviewData?.comprehensive?.adSales?.value} sub1={overviewData?.comprehensive?.adSales?.sub1} sub2={overviewData?.comprehensive?.adSales?.sub2} isPositive1={true} isPositive2={true} />
                    <KpiBlock label="ACoS" value={overviewData?.comprehensive?.acos?.value} sub1={overviewData?.comprehensive?.acos?.sub1} sub2={overviewData?.comprehensive?.acos?.sub2} isPositive1={false} isPositive2={false} />
                    <KpiBlock label="毛利润(USD)" value={overviewData?.comprehensive?.profit?.value} sub1={overviewData?.comprehensive?.profit?.sub1} sub2={overviewData?.comprehensive?.profit?.sub2} isPositive1={true} isPositive2={true} />
                    <KpiBlock label="毛利率" value={overviewData?.comprehensive?.margin?.value} sub1={overviewData?.comprehensive?.margin?.sub1} sub2={overviewData?.comprehensive?.margin?.sub2} isPositive1={true} isPositive2={true} />
                </div>

                <div className="flex-1 min-h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={overviewData?.chart || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ fontSize: '12px', color: '#374151' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
               </>
           )}
        </div>

        {/* Right: Ads & Exceptions (3 cols) */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
           {/* Ads Broadcast */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
              <SectionHeader title="广告播报" extra={<div className="text-[10px] text-gray-400">上次更新: 2分钟前 <RefreshCw size={10} className="inline"/></div>} />
              {isLoadingOverview ? <div className="h-40 bg-gray-50 rounded animate-pulse"></div> : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="text-[10px] text-gray-400 mb-1">广告花费(USD)</div>
                        <div className="text-lg font-bold text-gray-800">{overviewData?.ads?.spend}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 mb-1">广告销售额(USD)</div>
                        <div className="text-lg font-bold text-gray-800">{overviewData?.ads?.sales}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 mb-1">ACoTS</div>
                        <div className="text-lg font-bold text-gray-800">{overviewData?.ads?.acots}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-gray-400 mb-1">ACoS</div>
                        <div className="text-lg font-bold text-gray-800">{overviewData?.ads?.acos}</div>
                    </div>
                  </div>
              )}
           </div>

           {/* Exceptions */}
           <div className="bg-white p-4 rounded-sm border border-gray-200 shadow-sm flex-1">
              <SectionHeader title="运营异常监控" extra={<div className="text-[10px] text-gray-400">实时更新</div>} />
              <div className="space-y-3 mt-2">
                 {isLoadingOverview ? (
                     [1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-50 rounded w-full animate-pulse"></div>)
                 ) : (
                     overviewData?.exceptions?.map((row: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs items-center">
                           <span className="text-gray-600 truncate">{row.name}</span>
                           <span className={`${row.isWarn ? 'text-blue-600' : 'text-gray-400'} flex items-center gap-1`}>
                             {row.val}
                             {row.isNew && <span className="bg-orange-100 text-orange-500 text-[8px] px-1 rounded">新</span>}
                           </span>
                        </div>
                     ))
                 )}
              </div>
              <div className="mt-4 text-center">
                 <button className="text-xs text-gray-400 hover:text-blue-600 flex items-center justify-center w-full gap-1">
                   查看更多 <ChevronRight size={10} />
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Operation To-Do & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
         {/* Left: To-Do (8 cols) */}
         <div className="col-span-1 lg:col-span-8 bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">待处理</h3>
               <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">全部</span>
                  <span className="cursor-pointer hover:text-blue-600">采购发货流程</span>
                  <span className="cursor-pointer hover:text-blue-600">销售流程</span>
                  <Settings size={14} className="text-gray-400 cursor-pointer" />
               </div>
            </div>
            
            {!taskData ? <div className="h-24 bg-gray-50 rounded animate-pulse"></div> : (
                <div className="flex flex-wrap gap-4">
                <TodoCard title="采购" colorClass="text-green-600" icon={<RefreshCw size={12}/>}>
                    {taskData?.todos?.purchase?.map((item: any, i: number) => (
                        <TodoItem key={i} label={item.label} value={item.value} isRed={item.isRed} />
                    ))}
                </TodoCard>
                <TodoCard title="FBA" colorClass="text-orange-500" icon={<Settings size={12}/>}>
                    {taskData?.todos?.fba?.map((item: any, i: number) => (
                        <TodoItem key={i} label={item.label} value={item.value} isRed={item.isRed} />
                    ))}
                </TodoCard>
                <TodoCard title="FBM" colorClass="text-blue-500" icon={<Settings size={12}/>}>
                    {taskData?.todos?.fbm?.map((item: any, i: number) => (
                        <TodoItem key={i} label={item.label} value={item.value} isRed={item.isRed} />
                    ))}
                </TodoCard>
                </div>
            )}
         </div>

         {/* Right: Schedule (4 cols) */}
         <div className="col-span-1 lg:col-span-4 bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">运营待办 <ChevronRight size={14} className="text-gray-400" /></h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                 <span className="flex items-center gap-1 border border-gray-200 px-2 py-0.5 rounded"><Calendar size={10}/> 2026-2周</span>
              </div>
            </div>
            {/* Calendar Strip (Static for now, but dynamic date) */}
            <div className="flex justify-between border-b border-gray-100 pb-2 mb-4 text-center overflow-x-auto">
               {[...Array(7)].map((_, i) => {
                   const d = new Date();
                   d.setDate(d.getDate() - d.getDay() + i);
                   const isToday = new Date().getDate() === d.getDate();
                   return (
                       <div key={i} className={`text-xs min-w-[32px] ${isToday ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-gray-500'}`}>
                           <div className="mb-1 text-gray-400">{['日','一','二','三','四','五','六'][i]}</div>
                           <div>{isToday ? '今' : `${d.getMonth()+1}-${d.getDate()}`}</div>
                       </div>
                   )
               })}
            </div>
            
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-xs gap-2">
               <div className="bg-gray-100 p-3 rounded-full mb-1">
                  <Settings size={24} className="text-gray-300" />
               </div>
               <p>今天暂无待办任务</p>
               <p>快来计划一下吧~</p>
            </div>
            <button className="w-full border border-gray-200 py-1.5 text-xs text-gray-600 rounded mt-2 hover:bg-gray-50">+ 添加任务</button>
         </div>
      </div>

      {/* 5. Bottom: Announcements & Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
         {/* Announcements (3 cols) */}
         <div className="col-span-1 lg:col-span-3 bg-white p-4 rounded-sm border border-gray-200 shadow-sm text-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">公告 <ChevronRight size={14} className="text-gray-400" /></h3>
              <span className="text-gray-400 scale-90">更新日期: {new Date().toISOString().split('T')[0]}</span>
            </div>
            <ul className="space-y-3 text-gray-600 leading-relaxed">
               {taskData?.announcements?.map((item: any, i: number) => (
                   <li key={i} className="flex justify-between gap-2">
                      <span className="truncate flex-1">• {item.text}</span>
                      <span className="text-gray-400 shrink-0">{item.date}</span>
                   </li>
               ))}
            </ul>
         </div>

         {/* Ranking (9 cols) */}
         <div className="col-span-1 lg:col-span-9 bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
             <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  排行榜 Top50 
                  <button onClick={() => fetchRanking(true)} className={`text-gray-400 hover:text-blue-600 ${isRefreshingRanking ? 'animate-spin text-blue-600' : ''}`}><RefreshCw size={14}/></button>
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                 <div className="flex border border-gray-200 rounded overflow-hidden">
                    <button className="bg-blue-50 text-blue-600 px-2 py-0.5 border-r border-gray-200">销量</button>
                    <button className="bg-white text-gray-500 px-2 py-0.5 border-r border-gray-200 hover:bg-gray-50">销售额</button>
                    <button className="bg-white text-gray-500 px-2 py-0.5 hover:bg-gray-50">利润</button>
                 </div>
                 <div className="flex items-center border border-gray-200 rounded px-2 py-0.5 text-gray-500 w-24 justify-between">
                    <span>ASIN</span> <ChevronDown size={12} />
                 </div>
                 <Download size={14} className="text-gray-400 cursor-pointer hover:text-blue-600" />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
               <table className="w-full text-xs text-left min-w-[800px]">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                     <tr>
                        <th className="p-2 font-medium w-10"></th>
                        <th className="p-2 font-medium w-12">图片</th>
                        <th className="p-2 font-medium">ASIN/MSKU</th>
                        <th className="p-2 font-medium">店铺</th>
                        <th className="p-2 font-medium text-right">销量 ↓</th>
                        <th className="p-2 font-medium text-right">订单量</th>
                        <th className="p-2 font-medium text-right">销售额</th>
                        <th className="p-2 font-medium text-right">广告花费</th>
                        <th className="p-2 font-medium text-right">毛利润</th>
                        <th className="p-2 font-medium text-right">毛利率</th>
                        <th className="p-2 font-medium text-right">FBA可售</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {isLoadingRanking ? (
                         <tr><td colSpan={11} className="p-10 text-center text-gray-400"><Loader2 className="animate-spin inline mr-2"/> 数据加载中...</td></tr>
                     ) : rankingData.length === 0 ? (
                         <tr><td colSpan={11} className="p-10 text-center text-gray-400">暂无排名数据</td></tr>
                     ) : rankingData.map((row) => (
                        <tr key={row.rank} className="hover:bg-gray-50 group transition-colors">
                           <td className="p-2 text-center text-gray-500 font-bold">{row.rank <= 3 ? <span className={`inline-block w-4 h-4 rounded-full text-white text-[10px] leading-4 text-center ${row.rank===1?'bg-[#FFD700]':row.rank===2?'bg-[#C0C0C0]':'bg-[#CD7F32]'}`}>{row.rank}</span> : row.rank}</td>
                           <td className="p-2"><img src={row.img} alt="" className="w-8 h-8 rounded object-cover border border-gray-100" /></td>
                           <td className="p-2">
                              <div className="text-blue-600 font-medium hover:underline cursor-pointer">{row.asin}</div>
                              <div className="text-gray-400 text-[10px] truncate max-w-[120px]" title={row.msku}>{row.msku}</div>
                           </td>
                           <td className="p-2 text-blue-600 hover:underline cursor-pointer">{row.store}</td>
                           <td className="p-2 text-right">{row.sales}</td>
                           <td className="p-2 text-right">{row.orders}</td>
                           <td className="p-2 text-right">{row.amt}</td>
                           <td className="p-2 text-right">{row.ad}</td>
                           <td className="p-2 text-right">{row.profit}</td>
                           <td className="p-2 text-right">{row.margin}</td>
                           <td className="p-2 text-right">{row.fba}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
};
