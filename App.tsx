
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  Grid, 
  Menu,
  ChevronRight,
  RefreshCw,
  Home,
  Plus,
  X,
  Flame,
  Clock,
  LogOut
} from 'lucide-react';
import { MAIN_MENU, QUICK_ACTIONS, MOCK_STORES } from './constants';
import { TigerLogo } from './components/TigerLogo';
// New Page Imports
import { PlatformOrder } from './pages/Order/PlatformOrder';
import { ProductList } from './pages/Product/ProductList';
import { MultiAttributeList } from './pages/Product/MultiAttributeList';
import { SalesStat } from './pages/Data/SalesStat';
import { Dashboard } from './pages/Dashboard';
import { FacebookMarketing } from './pages/Marketing/Facebook';
import { ShopPerformance } from './pages/Data/ShopPerformance';
import { Shop } from './pages/Settings/Shop';
import { RealTime } from './pages/RealTime';

const App = () => {
  // Use CSS hover state for menu instead of React state for smoother entry/exit
  const [selectedStore, setSelectedStore] = useState(MOCK_STORES[0]);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const quickSearchRef = useRef<HTMLDivElement>(null);

  // Close quick search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (quickSearchRef.current && !quickSearchRef.current.contains(event.target as Node)) {
        setIsQuickSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Tabs State - Initialize from LocalStorage to restore workspace
  const [tabs, setTabs] = useState<{ id: string; label: string; active: boolean; }[]>(() => {
    try {
      const saved = localStorage.getItem('tiger_erp_tabs');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to restore tabs from storage", e);
    }
    return [];
  });

  // Persist tabs to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tiger_erp_tabs', JSON.stringify(tabs));
  }, [tabs]);

  const activeTabId = tabs.find(t => t.active)?.id;

  const handleTabClick = (id: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      active: tab.id === id
    })));
  };

  // Helper to open tab from children components
  const handleOpenTab = (id: string, label: string) => {
      const existingTab = tabs.find(t => t.id === id);
      if (existingTab) {
          setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
      } else {
          setTabs(prev => [
              ...prev.map(t => ({ ...t, active: false })),
              { id, label, active: true }
          ]);
      }
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTabs(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx === -1) return prev;
      
      const isRemovingActive = prev[idx].active;
      const newTabs = prev.filter(t => t.id !== id);
      
      if (isRemovingActive && newTabs.length > 0) {
        // If closing active tab, activate the previous one, or the first one if index was 0
        const newActiveIdx = Math.max(0, idx - 1);
        if (newTabs[newActiveIdx]) {
            newTabs[newActiveIdx] = { ...newTabs[newActiveIdx], active: true };
        }
      }
      return newTabs;
    });
  };

  const handleHomeClick = () => {
    // Deselect all tabs to show the Dashboard
    setTabs(prev => prev.map(tab => ({ ...tab, active: false })));
  };

  const handleMenuClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    handleOpenTab(item.id, item.label);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      
      {/* --- Top Header (Dark Blue) --- */}
      <header className="bg-[#0f172a] text-white shadow-sm z-50 sticky top-0">
        <div className="h-12 px-4 flex items-center justify-between w-full">
          
          {/* Left: Logo & Main Navigation */}
          <div className="flex items-center gap-6 flex-1">
            <TigerLogo className="shrink-0" />
            
            {/* Main Menu - Mega Menu Style */}
            <nav className="hidden xl:flex items-center gap-1 h-full">
              {MAIN_MENU.map(item => (
                <div 
                  key={item.id}
                  className="group h-12 flex items-center relative"
                >
                  <button 
                    className="px-4 py-1 rounded text-[14px] font-medium whitespace-nowrap text-slate-300 group-hover:text-white group-hover:bg-[#1e3a8a] transition-all"
                  >
                    {item.label}
                  </button>

                  {/* Mega Menu Dropdown */}
                  {item.children && (
                    <div className="absolute left-0 top-12 pt-0 w-max min-w-[700px] max-w-[1000px] z-50 invisible opacity-0 translate-y-2 transition-all duration-300 ease-out group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                      <div className="bg-[#1e293b] shadow-2xl rounded-b-md border-t-2 border-blue-500 py-3 px-6">
                        <div className="flex flex-col">
                          {item.children.map((group, idx) => (
                            <div 
                              key={group.id} 
                              className={`flex items-start py-4 ${idx !== item.children.length - 1 ? 'border-b border-dashed border-slate-700' : ''}`}
                            >
                              {/* Level 2: Group Title (Left Column) */}
                              <div className="w-32 shrink-0 flex items-center gap-2 text-slate-400 text-[13px] font-bold pr-4">
                                <span className="text-orange-500">
                                   {group.icon ? group.icon : <Grid size={16} />}
                                </span>
                                <span>{group.label}</span>
                                {/* Vertical separator */}
                                <div className="ml-auto w-px h-3 bg-slate-600/50"></div>
                              </div>
                              
                              {/* Level 3: Items (Right Column) */}
                              <div className="flex flex-wrap gap-x-8 gap-y-3 flex-1 pl-4 items-center">
                                {group.children?.map(subItem => (
                                  <a 
                                    key={subItem.id} 
                                    href="#"
                                    onClick={(e) => handleMenuClick(e, subItem)}
                                    className="text-white hover:text-orange-500 text-[13px] transition-colors flex items-center gap-1.5 relative group/link"
                                  >
                                    {subItem.label}
                                    {subItem.isNew && (
                                      <span className="bg-orange-500 text-white text-[10px] px-1 py-[1px] rounded-[2px] leading-tight font-bold scale-90">
                                        NEW
                                      </span>
                                    )}
                                    {subItem.isHot && (
                                      <Flame size={12} className="text-orange-500 fill-orange-500" />
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right: Store Switcher & Actions */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
             {/* Store Dropdown */}
             <div className="relative">
              <button 
                onClick={() => setIsStoreOpen(!isStoreOpen)}
                className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-colors border border-slate-700 text-slate-200"
              >
                <img src={`https://picsum.photos/20/20?random=${selectedStore.id}`} alt="flag" className="w-3.5 h-3.5 rounded-full object-cover" />
                <span className="max-w-[100px] truncate">{selectedStore.name}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              
              {isStoreOpen && (
                <div className="absolute top-full right-0 mt-1 w-60 bg-white text-slate-800 rounded shadow-xl border border-slate-100 py-1 z-50">
                  {MOCK_STORES.map(store => (
                    <button 
                      key={store.id}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs flex items-center gap-2"
                      onClick={() => {
                        setSelectedStore(store);
                        setIsStoreOpen(false);
                      }}
                    >
                      <span className="font-bold text-slate-400 w-6">{store.marketplace}</span>
                      {store.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
              <Search size={16} />
            </button>
            <button className="p-1.5 hover:bg-slate-700 rounded text-slate-300 relative">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-1.5 hover:bg-slate-700 rounded text-slate-300">
              <HelpCircle size={16} />
            </button>
            
            {/* User Avatar (Static) */}
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer overflow-hidden border border-blue-400 ml-2">
              A
            </div>
          </div>
        </div>
      </header>

      {/* --- Secondary Operation Bar (Medium Blue) --- */}
      <div className="bg-[#1e3a8a] shadow-md sticky top-12 z-40 select-none">
        <div className="h-10 px-4 flex items-center gap-2 w-full">
          {/* Home Button */}
          <button 
            onClick={handleHomeClick}
            className={`
              p-1.5 rounded-md transition-colors 
              ${!activeTabId ? 'bg-white text-blue-800' : 'text-blue-200 hover:text-white hover:bg-white/10'}
            `}
          >
            <Home size={18} />
          </button>

          {/* Vertical Divider */}
          <div className="w-px h-4 bg-blue-400/30 mx-1"></div>

          {/* Tab List */}
          <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide h-full">
            {tabs.map((tab, index) => (
              <div key={tab.id} className="flex items-center h-full">
                {/* Separator */}
                {index > 0 && !tab.active && !tabs[index - 1].active && (
                  <span className="text-blue-400/40 text-[10px] mx-2">|</span>
                )}

                <div 
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    group flex items-center gap-2 px-3 py-1.5 rounded text-xs cursor-pointer transition-all border border-transparent whitespace-nowrap
                    ${tab.active 
                      ? 'bg-white text-slate-800 font-bold shadow-sm' 
                      : 'text-blue-100 hover:text-white hover:bg-white/10'}
                  `}
                >
                  <span>{tab.label}</span>
                  {/* Close Icon: Visible on Active or Group Hover */}
                  <span 
                    className={`
                      rounded-full p-0.5 hover:bg-slate-200 hover:text-red-500 transition-all flex items-center justify-center
                      ${tab.active ? 'opacity-100 w-4' : 'opacity-0 w-0 group-hover:w-4 group-hover:opacity-100 overflow-hidden'}
                    `}
                    onClick={(e) => handleCloseTab(e, tab.id)}
                  >
                    <X size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Plus Button & Quick Search */}
          <div className="relative shrink-0 ml-2" ref={quickSearchRef}>
            <button 
              onClick={() => setIsQuickSearchOpen(!isQuickSearchOpen)}
              className={`text-blue-200 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors ${isQuickSearchOpen ? 'bg-white/10 text-white' : ''}`}
            >
              <Plus size={18} />
            </button>

            {/* Quick Search Dropdown */}
            {isQuickSearchOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-md shadow-xl border border-slate-200 py-3 px-4 animate-in fade-in zoom-in-95 duration-150 origin-top-right z-50">
                <div className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-sm w-fit mb-3 shadow-sm">快速打开</div>
                <div className="relative mb-4">
                  <input 
                    type="text" 
                    placeholder="搜索" 
                    className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 text-slate-700"
                    autoFocus
                  />
                  <Search size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
                </div>
                
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2 font-medium">
                    <Clock size={12} />
                    <span>最近访问</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {['全部订单', '广告管理', '商品列表'].map((item) => (
                      <button key={item} className="text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 px-2 py-1.5 rounded flex items-center justify-between group transition-colors">
                          <span>{item}</span>
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-slate-300" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <main className="flex-1 p-6 w-full overflow-hidden flex flex-col">
        {activeTabId === 'platformOrder' ? <PlatformOrder /> : 
         activeTabId === 'prod_list' ? <ProductList /> :
         activeTabId === 'multiAttributeList' ? <MultiAttributeList /> :
         activeTabId === 'sales_stat' ? <SalesStat /> :
         activeTabId === 'shop_perf_day' ? <ShopPerformance /> :
         activeTabId === 'real_time' ? <RealTime /> : 
         activeTabId === 'shop' ? <Shop /> : 
         activeTabId?.startsWith('fb_') ? <FacebookMarketing tabId={activeTabId} /> :
         activeTabId ? <div className="p-4 text-gray-500">Placeholder content for {activeTabId}</div> : <Dashboard onOpenTab={handleOpenTab} />}
      </main>
    </div>
  );
};

export default App;
