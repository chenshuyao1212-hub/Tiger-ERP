
import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Download, 
  RefreshCw, 
  Filter,
  ChevronDown,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { FilterSelect } from '../../../components/FilterSelect';

// Mock data for the table
const MOCK_DATA = [
  {
    id: 1,
    date: '2026-01-14',
    marketplace: 'US',
    shop: 'Tiger Flagship US',
    currency: 'USD',
    sales: 12500.50,
    orders: 342,
    units: 350,
    adSales: 4500.00,
    adSpend: 1200.00,
    profit: 3500.00,
    margin: '28.0%'
  },
  {
    id: 2,
    date: '2026-01-13',
    marketplace: 'US',
    shop: 'Tiger Flagship US',
    currency: 'USD',
    sales: 11200.00,
    orders: 310,
    units: 315,
    adSales: 4000.00,
    adSpend: 1100.00,
    profit: 3100.00,
    margin: '27.6%'
  },
  {
    id: 3,
    date: '2026-01-12',
    marketplace: 'US',
    shop: 'Tiger Flagship US',
    currency: 'USD',
    sales: 13800.25,
    orders: 380,
    units: 390,
    adSales: 5000.00,
    adSpend: 1350.00,
    profit: 3800.00,
    margin: '27.5%'
  }
];

export const ShopPerformance = () => {
  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 1. Header & Filters */}
      <div className="p-4 border-b border-gray-200 bg-white space-y-3">
        <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base">
                店铺表现按天查询
                <HelpCircle size={14} className="text-gray-400" />
            </h2>
            <div className="text-xs text-gray-500">
                数据更新时间：2026-01-14 12:00:00
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded hover:border-blue-400 transition-colors h-7 bg-white">
                <div className="px-2 h-full flex items-center border-r border-gray-200 bg-gray-50/50">
                    <Calendar size={12} className="text-gray-400" />
                </div>
                <input type="text" className="w-24 text-xs px-2 outline-none text-gray-600 bg-transparent h-full" placeholder="2026-01-01" />
                <span className="text-gray-300">~</span>
                <input type="text" className="w-24 text-xs px-2 outline-none text-gray-600 bg-transparent h-full" placeholder="2026-01-14" />
            </div>

            <FilterSelect label="全部站点" width="100px" />
            <FilterSelect label="全部店铺" width="120px" />
            <FilterSelect label="USD" width="80px" />

            <button className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 h-7 transition-colors ml-2">
                <Search size={12} /> 查询
            </button>
            <button className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 px-3 py-1 rounded hover:bg-gray-50 h-7 transition-colors">
                <RefreshCw size={12} /> 重置
            </button>
        </div>
      </div>

      {/* 2. Toolbar */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 border border-gray-200 bg-white px-3 py-1 rounded hover:border-blue-400 transition-colors">
                  <Download size={12} /> 导出
              </button>
          </div>
          <div className="text-xs text-gray-500">
              共 {MOCK_DATA.length} 条记录
          </div>
      </div>

      {/* 3. Table */}
      <div className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
            <thead className="bg-gray-100 text-gray-600 font-medium border-b border-gray-200 sticky top-0 z-10">
                <tr>
                    <th className="p-3">日期</th>
                    <th className="p-3">站点</th>
                    <th className="p-3">店铺</th>
                    <th className="p-3 text-center">币种</th>
                    <th className="p-3 text-right">销售额</th>
                    <th className="p-3 text-right">订单量</th>
                    <th className="p-3 text-right">销量(Units)</th>
                    <th className="p-3 text-right">广告销售额</th>
                    <th className="p-3 text-right">广告花费</th>
                    <th className="p-3 text-right">毛利润</th>
                    <th className="p-3 text-right">毛利率</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
                {MOCK_DATA.map((row) => (
                    <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                        <td className="p-3">{row.date}</td>
                        <td className="p-3">{row.marketplace}</td>
                        <td className="p-3">{row.shop}</td>
                        <td className="p-3 text-center">{row.currency}</td>
                        <td className="p-3 text-right font-medium">{row.sales.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right">{row.orders}</td>
                        <td className="p-3 text-right">{row.units}</td>
                        <td className="p-3 text-right">{row.adSales.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right">{row.adSpend.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right font-medium text-green-600">{row.profit.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                        <td className="p-3 text-right text-green-600">{row.margin}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-gray-800">
                <tr>
                    <td colSpan={4} className="p-3 text-center">汇总</td>
                    <td className="p-3 text-right">37,500.75</td>
                    <td className="p-3 text-right">1,032</td>
                    <td className="p-3 text-right">1,055</td>
                    <td className="p-3 text-right">13,500.00</td>
                    <td className="p-3 text-right">3,650.00</td>
                    <td className="p-3 text-right text-green-600">10,400.00</td>
                    <td className="p-3 text-right text-green-600">27.7%</td>
                </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
};
