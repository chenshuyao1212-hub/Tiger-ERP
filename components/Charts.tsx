
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const SALES_DATA = [
  { name: '00:00', sales: 400, orders: 24 },
  { name: '04:00', sales: 300, orders: 18 },
  { name: '08:00', sales: 550, orders: 35 },
  { name: '12:00', sales: 900, orders: 60 },
  { name: '16:00', sales: 850, orders: 55 },
  { name: '20:00', sales: 1200, orders: 80 },
  { name: '23:59', sales: 1100, orders: 75 },
];

const AD_DATA = [
  { name: 'Campaign A', spend: 400, sales: 2400 },
  { name: 'Campaign B', spend: 300, sales: 1398 },
  { name: 'Campaign C', spend: 200, sales: 9800 },
  { name: 'Campaign D', spend: 278, sales: 3908 },
  { name: 'Campaign E', spend: 189, sales: 4800 },
];

export const SalesTrendChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={SALES_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
  );
};

export const AdPerformanceChart: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '200px', marginTop: '1rem' }}>
       <ResponsiveContainer width="100%" height="100%">
        <BarChart data={AD_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
          <Tooltip cursor={{fill: 'transparent'}} />
          <Bar dataKey="spend" stackId="a" fill="#f87171" radius={[0, 4, 4, 0]} barSize={10} />
          <Bar dataKey="sales" stackId="a" fill="#34d399" radius={[0, 4, 4, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
