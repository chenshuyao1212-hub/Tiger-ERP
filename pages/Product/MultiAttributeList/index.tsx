
import React from 'react';
import { 
  Search, 
  ChevronDown, 
  Settings, 
  RefreshCw, 
  HelpCircle,
  Grid,
  Package
} from 'lucide-react';
import { FilterSelect } from '../../../components/FilterSelect';

export const MultiAttributeList = () => {
  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 1. Filter Row */}
      <div className="p-3 bg-white border-b border-gray-200 flex flex-wrap items-center gap-2">
         <FilterSelect label="商品分类" width="120px" />
         <FilterSelect label="商品品牌" width="120px" />
         <FilterSelect label="所有状态" width="120px" />
         <FilterSelect label="开发员" width="120px" />
         <FilterSelect label="CNY" width="80px" />
         
         {/* Composite Search Input */}
         <div className="flex items-center border border-gray-200 rounded hover:border-blue-400 transition-colors h-7 bg-white ml-auto sm:ml-0">
            <div className="relative h-full border-r border-gray-200 bg-gray-50/50">
              <select className="appearance-none bg-transparent text-xs pl-2 pr-6 focus:outline-none text-gray-600 h-full cursor-pointer w-20">
                <option>SPU</option>
              </select>
              <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative h-full flex items-center">
               <Grid size={12} className="ml-2 text-gray-300" />
               <input type="text" className="w-56 text-xs px-2 outline-none text-gray-600 h-full placeholder:text-gray-300" placeholder="双击可批量搜索内容" />
               <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button className="px-3 h-full bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-xs text-gray-600 font-medium" title="精确搜索">精</button>
         </div>
      </div>

      {/* 2. Action Bar */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors shadow-sm">
               添加多属性商品
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">
               更新多属性商品
            </button>
            <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 rounded text-xs hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm">
               属性管理
            </button>
         </div>
         
         <div className="flex items-center gap-2 text-gray-500">
             <button className="flex items-center gap-1 hover:text-blue-600 transition-colors text-xs text-gray-600">
               <Settings size={14} /> 自定义列
             </button>
             <div className="h-4 w-px bg-gray-200 mx-1"></div>
             <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded text-gray-400"><RefreshCw size={14}/></button>
             <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded text-gray-400"><HelpCircle size={14}/></button>
         </div>
      </div>

      {/* 3. Table Header & Empty State */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <table className="w-full text-xs text-left border-collapse min-w-[2000px]">
             <thead className="bg-white text-gray-900 font-bold border-b border-gray-200">
               <tr>
                 <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                 <th className="p-3 font-bold text-gray-800">图片</th>
                 <th className="p-3 font-bold text-gray-800">SKU</th>
                 <th className="p-3 font-bold text-gray-800">品名/分类</th>
                 <th className="p-3 font-bold text-gray-800">商品品牌</th>
                 <th className="p-3 font-bold text-gray-800">变种属性</th>
                 <th className="p-3 font-bold text-gray-800 text-right">采购成本(¥)</th>
                 <th className="p-3 font-bold text-gray-800 text-right">默认头程费用(¥)</th>
                 <th className="p-3 font-bold text-gray-800 text-right">商品重量(g)</th>
                 <th className="p-3 font-bold text-gray-800 text-right">商品规格(cm)</th>
                 <th className="p-3 font-bold text-gray-800">状态</th>
                 <th className="p-3 font-bold text-gray-800">1688配对</th>
                 <th className="p-3 font-bold text-gray-800">开发员</th>
                 <th className="p-3 font-bold text-gray-800">查看人</th>
                 <th className="p-3 font-bold text-gray-800">创建时间</th>
                 <th className="p-3 font-bold text-gray-800">更新时间</th>
                 <th className="p-3 font-bold text-gray-800">开发时间</th>
                 <th className="p-3 font-bold text-gray-800 text-center sticky right-0 bg-white shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">操作</th>
               </tr>
             </thead>
             <tbody>
                {/* Empty Body */}
             </tbody>
          </table>
        </div>
        
        {/* Empty State Illustration */}
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 pb-20">
           <div className="w-24 h-24 mb-4 text-blue-100 flex items-center justify-center">
             <Package size={80} strokeWidth={1} className="text-blue-100 fill-blue-50/30" />
           </div>
           <span className="text-xs text-gray-400">暂无数据</span>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs select-none">
        <div className="text-gray-600">已选 <span className="font-bold text-gray-900">0</span> 条</div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500">共 0 条</span>
          
          <div className="flex items-center gap-1">
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>&lt;</button>
             <button className="w-6 h-6 flex items-center justify-center border border-blue-600 bg-blue-600 text-white rounded">1</button>
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 text-gray-600" disabled>&gt;</button>
          </div>

          <select className="border border-gray-200 rounded px-1 py-0.5 outline-none text-gray-600 hover:border-blue-400 cursor-pointer">
            <option>20条/页</option>
            <option>50条/页</option>
          </select>

          <div className="flex items-center gap-1 text-gray-500">
             前往 <input type="text" className="w-8 h-5 border border-gray-200 text-center text-xs rounded outline-none focus:border-blue-500" defaultValue="1" /> 页
          </div>
        </div>
      </div>
    </div>
  );
};
