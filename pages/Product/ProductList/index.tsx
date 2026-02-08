
import React from 'react';
import { 
  Search, 
  ChevronDown, 
  Settings, 
  RefreshCw, 
  Download, 
  MoreHorizontal, 
  Calendar,
  Filter, 
  HelpCircle,
  ArrowDown,
  Grid
} from 'lucide-react';
import { FilterSelect } from '../../../components/FilterSelect';
import { ActionButton } from '../../../components/ActionButton';

interface ProductItem {
  id: string;
  img: string;
  pairingStatus: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  unit: string;
  bundle: string;
  cost: string;
  headCost: string;
  createTime: string;
  status: string;
  leadTime: number;
  updateTime: string;
  source?: string;
}

// Mock data matching the screenshot exactly
const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: '66-PB003-05',
    img: 'https://images.unsplash.com/photo-1593341646782-e0b495c9436d?w=40&h=40&fit=crop',
    pairingStatus: '已配对',
    name: 'YVMOVE V40Pro 匹克球3个装',
    category: '运动户外/匹克球运动/球',
    brand: 'YVMOVE-鹿肯',
    model: 'V40Pro-12',
    unit: '盒',
    bundle: '-',
    cost: '10.0000',
    headCost: '-',
    createTime: '2026-01-07',
    status: '待售',
    leadTime: 15,
    updateTime: '2026-01-08 14:47:12'
  },
  {
    id: '66-PB012-05',
    img: 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?w=40&h=40&fit=crop',
    pairingStatus: '已配对',
    name: 'YVMOVE V40Pro 匹克球12个装',
    category: '运动户外/匹克球运动/球',
    brand: 'YVMOVE-鹿肯',
    model: 'V40Pro-03',
    unit: '盒',
    bundle: '-',
    cost: '38.0000',
    headCost: '-',
    createTime: '2026-01-07',
    status: '待售',
    leadTime: 15,
    updateTime: '2026-01-08 14:46:57'
  },
  {
    id: '88-ST08-01',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop',
    pairingStatus: '已配对',
    name: 'YVMOVE Storm008 喷砂 全热压匹克球拍',
    category: '运动户外/匹克球运动/球拍',
    brand: 'YVMOVE-啸林',
    model: 'Storm008',
    unit: '支',
    bundle: '-',
    cost: '55.0000',
    headCost: '-',
    createTime: '2026-01-07',
    status: '待售',
    leadTime: 20,
    updateTime: '2026-01-07 16:59:41'
  }
];

const SortIcon = () => (
    <div className="inline-flex flex-col ml-0.5 opacity-40">
        <ArrowDown size={10} className="text-gray-500" />
    </div>
);

export const ProductList = () => {
  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 1. Tabs Row */}
      <div className="flex border-b border-gray-200 bg-gray-50/50 px-2 pt-2 gap-1">
         <div className="px-4 py-1.5 bg-blue-600 border-t border-l border-r border-blue-600 rounded-t-sm text-xs font-bold text-white cursor-pointer shadow-sm relative -bottom-px z-10">
           全部
         </div>
         <div className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border-t border-transparent hover:bg-gray-100 rounded-t-sm">
           普通商品
         </div>
         <div className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border-t border-transparent hover:bg-gray-100 rounded-t-sm">
           组合商品
         </div>
          <div className="px-4 py-1.5 text-xs text-gray-500 hover:text-gray-800 cursor-pointer border-t border-transparent hover:bg-gray-100 rounded-t-sm">
           加工商品
         </div>
      </div>

      {/* 2. Actions & Tools Row */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2 flex-wrap">
              <ActionButton label="添加商品" primary hasDropdown />
              <ActionButton label="编辑" />
              <ActionButton label="打印" hasDropdown />
              <ActionButton label="同步Listing图片" hasDropdown />
              <ActionButton label="导入" hasDropdown />
              <ActionButton label="更多" hasDropdown />
              <ActionButton label="删除" />
          </div>
          
          <div className="flex items-center gap-2 text-gray-500">
               <button className="flex items-center gap-1 hover:text-blue-600 transition-colors text-xs text-gray-600">
                 <Settings size={14} /> 自定义列
               </button>
               <div className="h-4 w-px bg-gray-200 mx-1"></div>
               <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded text-gray-400"><RefreshCw size={14}/></button>
               <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded text-gray-400"><Download size={14}/></button>
               <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded text-gray-400"><HelpCircle size={14}/></button>
          </div>
      </div>

      {/* 3. Filters Row */}
      <div className="px-3 py-2 bg-white flex flex-wrap items-center gap-2 border-b border-gray-200">
           <FilterSelect label="商品分类" width="100px" />
           <FilterSelect label="商品品牌" width="100px" />
           <FilterSelect label="所有状态" width="90px" />
           <FilterSelect label="开发员" width="90px" />
           <FilterSelect label="CNY" width="70px" />
           <FilterSelect label="更新时间" width="90px" />

           {/* Date Range Picker */}
           <div className="flex items-center border border-gray-200 rounded hover:border-blue-400 transition-colors h-7 bg-white">
             <div className="px-2 h-full flex items-center border-r border-gray-200 bg-gray-50/50">
               <Calendar size={12} className="text-gray-400" />
             </div>
             <input type="text" className="w-20 text-xs px-2 outline-none text-gray-600 bg-transparent h-full placeholder:text-gray-300" placeholder="开始日期" />
             <span className="text-gray-300">~</span>
             <input type="text" className="w-20 text-xs px-2 outline-none text-gray-600 bg-transparent h-full placeholder:text-gray-300" placeholder="结束日期" />
           </div>

           {/* Composite Search Input */}
           <div className="flex items-center border border-gray-200 rounded ml-2 hover:border-blue-400 transition-colors h-7 bg-white">
              <div className="relative h-full border-r border-gray-200 bg-gray-50/50">
                <select className="appearance-none bg-transparent text-xs pl-2 pr-6 focus:outline-none text-gray-600 h-full cursor-pointer w-16">
                  <option>SKU</option>
                </select>
                <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative h-full flex items-center">
                 <Grid size={12} className="ml-2 text-gray-300" />
                 <input type="text" className="w-48 text-xs px-2 outline-none text-gray-600 h-full placeholder:text-gray-300" placeholder="双击可批量搜索内容" />
                 <Search size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <button className="px-3 h-full bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-xs text-gray-600 font-medium" title="精确搜索">精</button>
           </div>
           
           <div className="h-4 w-px bg-gray-200 mx-1"></div>

           <button className="flex items-center justify-center w-7 h-7 rounded border border-gray-200 hover:border-blue-400 text-gray-500 hover:text-blue-600 bg-white">
             <Filter size={12} />
           </button>

           <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 px-3 py-1 rounded hover:bg-gray-50 transition-colors h-7">
              重置
           </button>
      </div>

      {/* 4. Table */}
      <div className="flex-1 overflow-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <table className="w-full text-xs text-left border-collapse min-w-[1600px]">
           <thead className="bg-gray-50 sticky top-0 z-20 text-gray-600 font-medium border-b border-gray-200 shadow-sm">
             <tr>
               <th className="p-3 w-10 text-center whitespace-nowrap bg-gray-50"><input type="checkbox" className="rounded border-gray-300" /></th>
               <th className="p-3 font-medium w-16 whitespace-nowrap bg-gray-50">图片</th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">SKU <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50">listing配对状态 <HelpCircle size={10} className="inline text-gray-400 ml-1" /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">品名 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">分类 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">商品品牌 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">型号 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50">单位</th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50">组合明细</th>
               <th className="p-3 font-medium text-right whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">采购成本(¥) <SortIcon /></th>
               <th className="p-3 font-medium text-right whitespace-nowrap bg-gray-50">默认头程费用(¥)</th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">创建时间 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">状态 <SortIcon /></th>
               <th className="p-3 font-medium text-right whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">采购交期 <SortIcon /></th>
               <th className="p-3 font-medium whitespace-nowrap bg-gray-50 cursor-pointer hover:bg-gray-100">更新时间 <SortIcon /></th>
               <th className="p-3 font-medium text-center sticky right-0 bg-gray-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] whitespace-nowrap z-20">操作</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100 text-gray-700">
             {MOCK_PRODUCTS.map((item, idx) => (
               <tr key={idx} className="hover:bg-blue-50/50 transition-colors group">
                 <td className="p-3 text-center align-middle"><input type="checkbox" className="rounded border-gray-300" /></td>
                 <td className="p-3 align-middle relative">
                   <div className="relative group/img cursor-pointer w-10 h-10">
                      <img src={item.img} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                      {item.source && (
                        <div className="absolute -bottom-1 -right-1 bg-white text-[9px] text-blue-500 border border-gray-200 px-0.5 rounded shadow-sm scale-90 leading-tight">来源</div>
                      )}
                   </div>
                 </td>
                 <td className="p-3 align-middle font-medium text-blue-600 hover:underline cursor-pointer">{item.id}</td>
                 <td className="p-3 align-middle text-gray-600 flex items-center gap-1 cursor-pointer hover:text-blue-600">
                    {item.pairingStatus}
                    <ChevronDown size={10} className="text-gray-400" />
                 </td>
                 <td className="p-3 align-middle max-w-[200px] truncate" title={item.name}>{item.name}</td>
                 <td className="p-3 align-middle text-gray-500">{item.category}</td>
                 <td className="p-3 align-middle">{item.brand}</td>
                 <td className="p-3 align-middle">{item.model}</td>
                 <td className="p-3 align-middle">{item.unit}</td>
                 <td className="p-3 align-middle text-gray-400">{item.bundle}</td>
                 <td className="p-3 align-middle text-right font-medium">{item.cost}</td>
                 <td className="p-3 align-middle text-right text-gray-500">{item.headCost}</td>
                 <td className="p-3 align-middle text-gray-500 text-[11px]">{item.createTime}</td>
                 <td className="p-3 align-middle">
                    <span className={`px-1.5 py-0.5 text-[11px] rounded ${item.status === '待售' ? 'text-blue-600' : 'text-green-500'}`}>
                        {item.status}
                    </span>
                 </td>
                 <td className="p-3 align-middle text-right text-gray-600">{item.leadTime}</td>
                 <td className="p-3 align-middle text-gray-500 text-[11px]">{item.updateTime}</td>
                 <td className="p-3 align-middle text-center sticky right-0 bg-white group-hover:bg-blue-50/50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                   <div className="flex items-center justify-center gap-2">
                     <span className="text-blue-600 hover:underline cursor-pointer whitespace-nowrap">详情</span>
                     <MoreHorizontal size={14} className="text-blue-600 cursor-pointer hover:bg-blue-100 rounded" />
                   </div>
                 </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>

      {/* 5. Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs select-none">
        <div className="text-gray-600">已选 <span className="font-bold text-gray-900">0</span> 条</div>
        <div className="flex items-center gap-4">
          <span className="text-gray-500">共 15 条</span>
          
          <div className="flex items-center gap-1">
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>&lt;</button>
             <button className="w-6 h-6 flex items-center justify-center border border-blue-600 bg-blue-600 text-white rounded">1</button>
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 text-gray-600">&gt;</button>
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
