
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ChevronDown, 
  Settings, 
  RefreshCw, 
  Download, 
  HelpCircle,
  Filter, 
  ArrowDown, 
  BarChart2, 
  List, 
  Clock,
  ExternalLink,
  ChevronRight,
  PieChart,
  Target,
  Play,
  Calendar as CalendarIcon,
  ChevronLeft
} from 'lucide-react';
import { FilterSelect } from '../../../components/FilterSelect';
import { DateRangePicker } from '../../../components/DateRangePicker';

// --- Mock Data: ASIN View ---
const MOCK_ASIN_SALES_DATA = [
  {
    id: '1',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40',
    asin: 'B0FQV1J5ZR',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GFK4TFSB',
    msku: '20-10X6-01-US-...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA Open Ear Sport Headphones, Wireless Bone...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 1713,
    fbaTotal: 1982,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [20, 35, 45, 30, 60, 50, 40],
    avg: 21,
    subtotal: 210,
    daily: [0, 52, 38, 6, 9, 0, 1, 60, 13, 31, 22, 15, 40, 20]
  },
  {
    id: '2',
    img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=40',
    asin: 'B0FRXHPFWY',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GFK4TFSB',
    msku: '20-10X6-03-US-...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA Open Ear Sport Headphones, Wireless Bone...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 874,
    fbaTotal: 1417,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [15, 20, 25, 10, 5, 5, 20],
    avg: 13.8,
    subtotal: 138,
    daily: [0, 23, 29, 2, 0, 0, 1, 18, 26, 39, 10, 5, 12, 8]
  },
  {
    id: '3',
    img: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=40',
    asin: 'B0FK4Z3RN9',
    site: '东方科技-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GCLVF49T',
    msku: '10-1B17-01-US-FBA...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA True Bone Conduction Headphones,Open-Ear...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 261,
    fbaTotal: 1615,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [40, 30, 20, 15, 10, 15, 20],
    avg: 13.1,
    subtotal: 131,
    daily: [0, 6, 12, 7, 9, 17, 26, 16, 21, 17, 10, 12, 8, 9]
  },
  {
    id: '4',
    img: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=40',
    asin: 'B0DSTPSVTM',
    site: '亿峰林-YVm...',
    siteCode: '美国',
    fatherAsin: 'B0GGHN26N2',
    msku: '66-ST07-01-USF...',
    skuName: 'YVMOVE Storm007 ...',
    tags: '-',
    title: 'YVmove Pickleball Paddle with T700 Raw Carbon Fiber Surfa...',
    salesperson: '-',
    category: '球拍',
    brand: 'YVMOVE-啸林',
    fbaSales: 3353,
    fbaTotal: 3527,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [10, 20, 30, 40, 30, 20, 10],
    avg: 9.5,
    subtotal: 95,
    daily: [0, 15, 3, 9, 12, 9, 3, 5, 19, 20, 15, 18, 22, 10]
  },
  {
    id: '5',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40',
    asin: 'B0FZBRHHFS',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GFJ2S57Y',
    msku: '10-10B8-05-US-FBA...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA True Wireless Bone Conduction Earphones, OWS...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 1745,
    fbaTotal: 2723,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [5, 10, 5, 20, 15, 10, 5],
    avg: 7.5,
    subtotal: 75,
    daily: [0, 1, 1, 1, 3, 0, 2, 22, 12, 33, 5, 4, 3, 8]
  },
  {
    id: '6',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40',
    asin: 'B0FW3ZVN21',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GFJ2S57Y',
    msku: '10-1B19-01-US-F...',
    skuName: '-',
    tags: '-',
    title: 'Open Ear Earbuds, True Wireless Open Ear Headphone...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 261,
    fbaTotal: 513,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [30, 25, 20, 15, 10, 5, 0],
    avg: 6.6,
    subtotal: 66,
    daily: [0, 4, 7, 2, 3, 7, 14, 13, 10, 6, 2, 1, 0, 0]
  },
  {
    id: '7',
    img: 'https://images.unsplash.com/photo-1593341646782-e0b495c9436d?w=40',
    asin: 'B0FF9SN787',
    site: '锦灵jojo-JOJOL...',
    siteCode: '加拿大',
    fatherAsin: 'B0DM5S5BBX',
    msku: 'AMZ10-FBACA-2506...',
    skuName: 'JOJOLEMON Shark0...',
    tags: '-',
    title: 'JOJOLEMON Pickleball Paddles, Raw Carbon Fiber...',
    salesperson: '-',
    category: '球拍',
    brand: 'JOJOLEMON',
    fbaSales: 42,
    fbaTotal: 44,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [5, 10, 15, 5, 20, 10, 15],
    avg: 5.6,
    subtotal: 56,
    daily: [0, 4, 6, 6, 7, 5, 6, 6, 7, 9, 8, 5, 6, 7]
  },
  {
    id: '8',
    img: 'https://images.unsplash.com/photo-1593341646782-e0b495c9436d?w=40',
    asin: 'B0DD7C9WGH',
    site: '山屿dudu-JOJO...',
    siteCode: '美国',
    fatherAsin: 'B0FC4HGB2M',
    msku: 'AM100-USFBA2100-...',
    skuName: '-',
    tags: '-',
    title: 'JOJOLEMON Pickleball Paddles Featuring a Raw Carbon Fiber...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 873,
    fbaTotal: 2550,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [10, 10, 10, 10, 10, 10, 10],
    avg: 4.6,
    subtotal: 46,
    daily: [0, 6, 10, 5, 3, 4, 4, 5, 4, 5, 6, 3, 2, 4]
  },
  {
    id: '9',
    img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=40',
    asin: 'B0F3XJD82S',
    site: '酷澎运动-YV...',
    siteCode: '美国',
    fatherAsin: 'B0GFKBKYRN',
    msku: '66-ST08-01-USA...',
    skuName: 'YVMOVE Storm008 3...',
    tags: '-',
    title: 'YVmove T800+3K Carbon Fiber Pickleball Paddle with 16mm V...',
    salesperson: '-',
    category: '球拍',
    brand: 'YVMOVE-啸林',
    fbaSales: 961,
    fbaTotal: 2059,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [5, 5, 5, 5, 5, 5, 5],
    avg: 4.6,
    subtotal: 46,
    daily: [0, 8, 13, 9, 11, 3, 1, 1, 0, 0, 0, 0, 0, 0]
  },
  {
    id: '10',
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=40',
    asin: 'B0FL7BKRQ9',
    site: '星空世纪-YV...',
    siteCode: '美国',
    fatherAsin: 'B0G391QQJF',
    msku: '66-TI700-01-USF...',
    skuName: 'YVMOVE Titan700-黑...',
    tags: '-',
    title: 'Pickleball Paddles for Advanced Players | Control & Power | Ti-...',
    salesperson: '-',
    category: '球拍',
    brand: 'YVMOVE-鹿肯',
    fbaSales: 2157,
    fbaTotal: 2184,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [10, 8, 6, 4, 2, 4, 6],
    avg: 3.8,
    subtotal: 38,
    daily: [0, 8, 5, 2, 3, 0, 5, 8, 4, 3, 5, 2, 1, 4]
  },
  {
    id: '11',
    img: 'https://images.unsplash.com/photo-1593341646782-e0b495c9436d?w=40',
    asin: 'B0DCJRYYLH',
    site: '锦灵jojo-JOJOL...',
    siteCode: '美国',
    fatherAsin: 'B0FC4HGB2M',
    msku: 'AM002-USFBA1100-...',
    skuName: 'JOJOLEMON Shark0...',
    tags: '-',
    title: 'JOJOLEMON Pickleball Paddles, Hybrid Carbon Fiber ...',
    salesperson: '-',
    category: '球拍',
    brand: 'JOJOLEMON',
    fbaSales: 283,
    fbaTotal: 915,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [1, 2, 3, 4, 3, 2, 1],
    avg: 2.2,
    subtotal: 22,
    daily: [0, 3, 1, 6, 1, 3, 5, 1, 2, 0, 1, 2, 3, 1]
  },
  {
    id: '12',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40',
    asin: 'B0FMRCLTF2',
    site: '欢坊-Demicea-US',
    siteCode: '美国',
    fatherAsin: 'B0G43P9Y35',
    msku: '40-10A9-01-US-...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA Bone Conduction Headphones, Neckband...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 124,
    fbaTotal: 171,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [2, 3, 2, 3, 2, 3, 2],
    avg: 2.2,
    subtotal: 22,
    daily: [0, 2, 1, 2, 5, 2, 1, 4, 2, 3, 2, 1, 2, 3]
  },
  {
    id: '13',
    img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=40',
    asin: 'B0F652JGH4',
    site: '酷澎运动-YV...',
    siteCode: '美国',
    fatherAsin: 'B0GFKBKYRN',
    msku: '66-ST08-14-USA...',
    skuName: 'YVMOVE Storm008 1...',
    tags: '-',
    title: 'YVmove Pickleball Paddle with 18K T800 Raw Carbon Fiber...',
    salesperson: '-',
    category: '球拍',
    brand: 'YVMOVE-啸林',
    fbaSales: 128,
    fbaTotal: 233,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [2, 2, 2, 2, 2, 2, 2],
    avg: 2.1,
    subtotal: 21,
    daily: [0, 7, 7, 0, 2, 2, 1, 0, 0, 2, 1, 0, 0, 0]
  },
  {
    id: '14',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40',
    asin: 'B0CT92CGZP',
    site: '山屿dudu-JOJO...',
    siteCode: '美国',
    fatherAsin: 'B0FC4HGB2M',
    msku: 'AMZ10-USFBA11...',
    skuName: 'JOJOLEMON Shark0...',
    tags: '-',
    title: 'JOJOLEMON Pickleball Paddles, Raw Carbon Fiber...',
    salesperson: '-',
    category: '球拍',
    brand: 'JOJOLEMON',
    fbaSales: 523,
    fbaTotal: 624,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [1, 2, 1, 2, 1, 2, 1],
    avg: 1.7,
    subtotal: 17,
    daily: [0, 1, 4, 1, 3, 0, 4, 0, 1, 3, 2, 1, 0, 1]
  },
  {
    id: '15',
    img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=40',
    asin: 'B0FMRDBZD9',
    site: '冠野-YVmove-鹿...',
    siteCode: '美国',
    fatherAsin: 'B0G391QQJF',
    msku: '66-TI800-01-USF...',
    skuName: '-',
    tags: '-',
    title: 'Pickleball Paddles for Advanced Players | Control & Power | Ti-...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 498,
    fbaTotal: 568,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [1, 1, 1, 1, 1, 1, 1],
    avg: 1.6,
    subtotal: 16,
    daily: [0, 5, 0, 1, 5, 0, 0, 2, 2, 1, 0, 1, 0, 0]
  },
  {
    id: '16',
    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40',
    asin: 'B0FMR8YW4B',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0GFJ2S57Y',
    msku: '10-10B8-05-US-FBA...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA True Wireless Bone Conduction Earphones, OWS...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 926,
    fbaTotal: 1480,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [1, 1, 2, 1, 1, 2, 1],
    avg: 1.4,
    subtotal: 14,
    daily: [0, 2, 0, 0, 0, 1, 4, 3, 2, 2, 1, 0, 1, 0]
  },
  {
    id: '17',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40',
    asin: 'B0DJP9FBNW',
    site: '德米西亚-Demic...',
    siteCode: '美国',
    fatherAsin: 'B0DJP9FBNW',
    msku: '20-1X13-02-US-FBA...',
    skuName: '-',
    tags: '-',
    title: 'DEMICEA Open Ear Sport Headphones, Soft Silic...',
    salesperson: '-',
    category: '-',
    brand: '-',
    fbaSales: 0,
    fbaTotal: 2,
    awdInv: 0,
    awdOnWay: 0,
    trendData: [0, 0, 0, 0, 0, 0, 10],
    avg: 1.3,
    subtotal: 13,
    daily: [0, 0, 0, 0, 0, 0, 0, 0, 0, 13, 0, 0, 0, 0]
  }
];

const MOCK_ASIN_ORDER_DATA = MOCK_ASIN_SALES_DATA.map(item => ({
    ...item,
    avg: 20.3,
    subtotal: 203,
    trendData: [5, 10, 15, 20, 25, 30, 35],
    daily: [0, 50, 35, 6, 9, 0, 1, 58, 13, 31, 25, 40, 10, 5]
}));

const MOCK_ASIN_REVENUE_DATA = MOCK_ASIN_SALES_DATA.map(item => ({
    ...item, 
    avg: 775.87, 
    subtotal: 7758.70,
    trendData: [100, 200, 150, 300, 250, 400, 350],
    daily: [0, 479.94, 695.88, 511.93, 695.91, 951.83, 1455.74, 839.85, 1175.79, 951.83, 500.55, 600.20, 750.00, 300.10]
})); 

// --- Mock Data: Father ASIN View ---
const MOCK_FATHER_SALES_DATA = [
  { id: '1', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40', fatherAsin: 'B0GFK4TFSB', asin: 'B0FQV1J5ZR', msku: '20-10X6-01-US-FBA-DEM...', shop: '德米西亚-Demicea-US', fbaSellable: 2589, fbaTotal: 3394, avg: 34.8, subtotal: 348, daily: [0, 75, 67, 8, 9, 0, 2, 78, 39, 70, 50, 60, 40, 30], trendData: [10, 40, 30, 5, 5, 0, 1, 40, 20, 35] },
  { id: '2', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40', fatherAsin: 'B0GFJ2S57Y', asin: 'B0FZBRHHFS', msku: '10-10B8-05-US-FBA-DEM...', shop: '德米西亚-Demicea-US', fbaSellable: 2934, fbaTotal: 4738, avg: 15.6, subtotal: 156, daily: [0, 8, 8, 3, 6, 8, 20, 38, 24, 41, 15, 12, 18, 20], trendData: [0, 5, 5, 2, 3, 4, 10, 20, 12, 20] },
];
const MOCK_FATHER_ORDER_DATA = MOCK_FATHER_SALES_DATA.map(item => ({...item, avg: 33.4, subtotal: 334})); 
const MOCK_FATHER_REVENUE_DATA = MOCK_FATHER_SALES_DATA.map(item => ({...item, avg: 1087.65, subtotal: 10876.54}));

// --- Mock Data: MSKU View ---
const MOCK_MSKU_SALES_DATA = [
  { id: '1', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40', msku: '20-10X6-01-US-FBA-DEMI-31', asin: 'B0FQV1J5ZR', shop: '德米西亚-Demicea-US', title: 'DEMICEA Open Ear Sport Headphones, Wireless Bone Conduction Earphones...', skuName: '-', salesperson: '-', category: '-', brand: '-', fbaSellable: 1714, fbaTotal: 1981, awdInv: 0, awdOnWay: 0, avg: 17.2, subtotal: 172, daily: [0, 52, 37, 6, 9, 0, 1, 60, 7, 0, 10, 12, 5, 8], trendData: [5, 40, 30, 5, 8, 0, 2, 50, 10, 0] },
  { id: '2', img: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=40', msku: '10-1817-01-US-FBA-DONG-03', asin: 'B0GCLVF49T', shop: '东方科技-Demicea-US', title: 'DEMICEA True Bone Conduction Headphones,Open-Ear Headphones,Up t...', skuName: '-', salesperson: '-', category: '-', brand: '-', fbaSellable: 259, fbaTotal: 1616, awdInv: 0, awdOnWay: 0, avg: 15.6, subtotal: 156, daily: [0, 8, 8, 3, 6, 8, 20, 38, 24, 41, 15, 20, 25, 30], trendData: [0, 10, 10, 5, 8, 10, 25, 40, 25, 45] },
];
const MOCK_MSKU_ORDER_DATA = [
  { id: '1', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40', msku: '20-10X6-01-US-FBA-DEMI-31', asin: 'B0FQV1J5ZR', shop: '德米西亚-Demicea-US', title: 'DEMICEA Open Ear Sport Headphones, Wireless Bone Conduction Earphones...', skuName: '-', salesperson: '-', category: '-', brand: '-', fbaSellable: 1714, fbaTotal: 1981, awdInv: 0, awdOnWay: 0, avg: 16.5, subtotal: 165, daily: [0, 50, 34, 6, 9, 0, 1, 58, 7, 0, 10, 15, 8, 6], trendData: [5, 40, 30, 5, 8, 0, 2, 50, 10, 0] },
];
const MOCK_MSKU_REVENUE_DATA = [
  { id: '1', img: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=40', msku: '10-1B17-01-US-FBA-DONG-03', asin: 'B0GCLVF49T', fatherAsin: 'B0GCLVF49T', shop: '东方科技-Demicea-US', title: 'DEMICEA True Bone Conduction Headphones,Open-Ear...', skuName: '-', salesperson: '-', category: '-', brand: '-', fbaSellable: 259, fbaTotal: 1616, awdInv: 0, awdOnWay: 0, avg: 775.87, subtotal: 7758.70, daily: [0, 479.94, 695.88, 511.93, 695.91, 951.83, 1455.74, 839.85, 1175.79, 951.83, 500.20, 600.50, 450.30, 700.10], trendData: [0, 40, 60, 45, 60, 80, 100, 70, 90, 80] },
];

const Sparkline = ({ data }: { data: number[] }) => {
    const height = 24;
    const width = 60;
    const max = Math.max(...data, 1);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (d / max) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="overflow-visible">
            <path d={`M${points}`} fill="none" stroke="#3b82f6" strokeWidth="1" />
            <path d={`M0,${height} L${points} L${width},${height} Z`} fill="#eff6ff" opacity="0.5" />
        </svg>
    );
};

const formatCurrency = (val: number) => `US$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Date Utilities ---
const getDaysArray = (start: Date, end: Date) => {
  const arr = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

export const SalesStat = () => {
  const [activeTab, setActiveTab] = useState('ASIN');
  const [activeMetric, setActiveMetric] = useState<'sales' | 'orders' | 'revenue'>('sales'); // Default to sales
  
  // Initialize date range: Default to 2026-01-05 to 2026-01-07 as per screenshot example logic (short range) or mock data range
  // Setting default to a 10 day range for better visualization with mock data
  const [startDate, setStartDate] = useState(new Date(2026, 0, 5)); // Jan 5, 2026
  const [endDate, setEndDate] = useState(new Date(2026, 0, 14));   // Jan 14, 2026

  // Updated Data Retrieval Logic
  const getData = () => {
    if (activeTab === '父ASIN') {
        switch (activeMetric) {
            case 'orders': return MOCK_FATHER_ORDER_DATA;
            case 'revenue': return MOCK_FATHER_REVENUE_DATA;
            default: return MOCK_FATHER_SALES_DATA;
        }
    }
    if (activeTab === 'MSKU') {
        switch (activeMetric) {
            case 'orders': return MOCK_MSKU_ORDER_DATA;
            case 'revenue': return MOCK_MSKU_REVENUE_DATA;
            default: return MOCK_MSKU_SALES_DATA;
        }
    }
    // Fallback for ASIN tab
    if (activeMetric === 'revenue') return MOCK_ASIN_REVENUE_DATA;
    return activeMetric === 'orders' ? MOCK_ASIN_ORDER_DATA : MOCK_ASIN_SALES_DATA;
  };

  const data = getData();

  // Dynamic Date Columns based on selected range
  const getDateColumns = () => {
      const dates = getDaysArray(startDate, endDate);
      // Reverse order to match screenshot (Newest first? No, screenshot shows 01-05 to 01-07 left to right?
      // Wait, screenshot shows 2026-01-05 ~ 2026-01-07 in picker.
      // Table screenshot shows 01-14 down to 01-05. So it's descending order (newest on left).
      // Let's stick to descending order for the table columns as per previous mock.
      return dates.reverse().map(d => {
          const days = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
          return {
              d: `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
              w: days[d.getDay()]
          };
      });
  };

  const dateColumns = getDateColumns();

  return (
    <div className="flex flex-col h-full bg-white shadow-sm border border-slate-200 rounded-sm">
      {/* 1. Top Sub-Navigation Row */}
      <div className="px-6 py-3 bg-white flex items-center gap-6 border-b border-gray-100 text-sm font-bold">
          {['ASIN', '父ASIN', 'MSKU', 'SKU', '店铺', '开发员', '业务员'].map((tab) => (
              <div 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-gray-800 hover:text-blue-600'}`}
              >
                  {tab}
              </div>
          ))}
      </div>

      {/* 2. Main Action & Filter Bar */}
      <div className="px-3 py-2 bg-white border-b border-gray-200 flex flex-wrap items-center gap-2">
         {/* Toggle Group */}
         <div className="flex rounded border border-blue-600 overflow-hidden h-7 text-xs font-medium cursor-pointer">
             <div 
                onClick={() => setActiveMetric('sales')}
                className={`px-3 flex items-center ${activeMetric === 'sales' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-50'}`}
             >
                销量
             </div>
             <div 
                onClick={() => setActiveMetric('orders')}
                className={`px-3 flex items-center border-l border-blue-600 ${activeMetric === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-50'}`}
             >
                订单量
             </div>
             <div 
                onClick={() => setActiveMetric('revenue')}
                className={`px-3 flex items-center border-l border-blue-600 ${activeMetric === 'revenue' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-gray-50'}`}
             >
                销售额
             </div>
         </div>

         <div className="h-4 w-px bg-gray-200 mx-1"></div>
         
         <FilterSelect label="全部站点" width="90px" />
         <FilterSelect label="全部店铺" width="100px" />
         <FilterSelect label="发货方式" width="90px" />
         <FilterSelect label="请选择产品标签" width="120px" />
         <FilterSelect label="请选择业务员" width="110px" />

         <DateRangePicker 
            startDate={startDate} 
            endDate={endDate} 
            onApply={(start, end) => {
                setStartDate(start);
                setEndDate(end);
            }} 
         />

         <FilterSelect label={activeTab === '父ASIN' ? 'USD' : '原币种'} width="80px" />
         <FilterSelect label={activeTab === '父ASIN' ? 'ASIN' : '按日'} width="70px" />
         
         {activeTab === '父ASIN' && <div className="flex items-center gap-2 ml-1 text-xs text-gray-500 border border-gray-200 rounded px-2 h-7 bg-white"><input type="checkbox" /> 聚合可能变体</div>}

         <div className="flex items-center border border-gray-200 rounded ml-1 hover:border-blue-400 transition-colors h-7 bg-white">
            <div className="relative h-full border-r border-gray-200 bg-gray-50/50">
                <select className="appearance-none bg-transparent text-xs pl-2 pr-6 focus:outline-none text-gray-600 h-full cursor-pointer w-16">
                    <option>{activeTab === '父ASIN' ? 'ASIN' : (activeTab === 'MSKU' ? 'MSKU' : 'ASIN')}</option>
                </select>
                <ChevronDown size={10} className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative h-full flex items-center">
                <input type="text" className="w-32 text-xs px-2 outline-none text-gray-600 h-full placeholder:text-gray-300" placeholder="双击可批量搜索内容" />
            </div>
            <button className="px-2 h-full bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-xs text-gray-600 font-medium" title="精确搜索">精</button>
         </div>

         <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><Filter size={14}/></button>
         <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500"><RefreshCw size={14}/></button>
         
         {/* Checkboxes Group (Common) */}
         <div className="flex items-center gap-3 ml-auto text-xs text-gray-600 hidden 2xl:flex">
             {activeTab === 'ASIN' && (
                 <>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" defaultChecked /> 按ASIN汇总
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" defaultChecked /> 实时统计 <HelpCircle size={10} className="text-gray-400" />
                    </label>
                 </>
             )}
             {activeTab === '父ASIN' && (
                 <>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked /> 按ASIN汇总
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked /> 实时统计 <HelpCircle size={10} className="text-gray-400" />
                    </label>
                 </>
             )}
             {activeTab === 'MSKU' && (
                 <>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked /> 实时统计 <HelpCircle size={10} className="text-gray-400" />
                    </label>
                 </>
             )}
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" checked /> 隐藏销量为0的产品 <HelpCircle size={10} className="text-gray-400" />
             </label>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" /> 测算产品
             </label>
             <label className="flex items-center gap-1 cursor-pointer">
                 <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3.5 h-3.5" /> 去除换货销量
             </label>
         </div>
         
         <div className="flex items-center gap-1 ml-2 text-gray-400 border-l border-gray-200 pl-2">
            <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><Settings size={14} /> <span className="text-xs ml-1 text-gray-600">自定义列</span></button>
            <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><RefreshCw size={14}/></button>
            <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><Download size={14}/></button>
            <button className="p-1 hover:text-blue-600 hover:bg-gray-100 rounded"><HelpCircle size={14}/></button>
         </div>
      </div>

      {/* 3. Table */}
      <div className="flex-1 overflow-auto bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent relative">
        <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[3200px]">
           <thead className="bg-gray-50 sticky top-0 z-40 text-gray-600 font-medium shadow-sm">
             <tr>
               {/* --- Fixed Columns Logic --- */}
               {activeTab === 'ASIN' ? (
                   <>
                       <th className="p-2 w-8 text-center bg-gray-50 sticky left-0 z-50 border-r border-b border-gray-100">
                           <Play size={8} className="rotate-90 text-gray-400 mx-auto" />
                       </th>
                       <th className="p-2 w-10 text-center bg-gray-50 sticky left-8 z-50 border-r border-b border-gray-100">图片</th>
                       <th className="p-2 font-medium bg-gray-50 sticky left-[72px] z-50 w-24 border-r border-b border-gray-100">ASIN</th>
                       <th className="p-2 font-medium bg-gray-50 sticky left-[168px] z-50 w-32 border-b border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">店铺/站点</th>
                   </>
               ) : activeTab === 'MSKU' && activeMetric === 'revenue' ? (
                   // ... (MSKU Revenue logic)
                   <>
                       <th className="p-2 w-8 text-center bg-gray-50 sticky left-0 z-50 border-r border-b border-gray-100"></th>
                       <th className="p-2 w-10 text-center bg-gray-50 sticky left-8 z-50 border-r border-b border-gray-100">图片</th>
                       <th className="p-2 font-medium bg-gray-50 sticky left-[72px] z-50 w-40 border-r border-b border-gray-100">MSKU <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 sticky left-[232px] z-50 w-32 border-b border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">店铺/站点</th>
                   </>
               ) : (
                   // Fallback
                   <>
                       <th className="p-2 w-8 text-center bg-gray-50 border-b border-gray-100"></th>
                       <th className="p-2 w-10 text-center bg-gray-50 border-b border-gray-100">图片</th>
                       {activeTab === 'MSKU' && <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">MSKU</th>}
                       {activeTab === '父ASIN' && <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">父ASIN</th>}
                       {activeTab !== 'ASIN' && <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">店铺/站点</th>}
                   </>
               )}

               {/* --- Scrollable Columns --- */}
               {activeTab === 'ASIN' && (activeMetric === 'orders' || activeMetric === 'revenue') ? (
                   // Specific Combined View for Orders AND Revenue based on user request (Both have same columns now per images)
                   <>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">分析</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">运营</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">销量洞察</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">父ASIN <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">MSKU <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">品名/SKU <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">产品标签 <HelpCircle size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">标题</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">业务员</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">分类</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">商品品牌 <HelpCircle size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right cursor-pointer hover:bg-gray-100 border-b border-gray-100">FBA可售 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right cursor-pointer hover:bg-gray-100 border-b border-gray-100">FBA总库存 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right border-b border-gray-100">AWD库存 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right border-b border-gray-100">AWD在途 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                   </>
               ) : activeTab === 'ASIN' ? (
                   <>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">分析</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">运营</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">销量洞察</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">父ASIN <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">MSKU <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">品名/SKU <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">产品标签 <HelpCircle size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">标题</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">业务员</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">分类</th>
                       <th className="p-2 font-medium bg-gray-50 text-center border-b border-gray-100">商品品牌 <HelpCircle size={10} className="inline text-gray-400"/></th>
                   </>
               ) : activeTab === '父ASIN' ? (
                   <>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">分析</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">运营</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">ASIN <List size={10} className="inline ml-1 opacity-50"/></th>
                   </>
               ) : activeTab === 'MSKU' ? (
                   <>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">分析</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">父ASIN <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">ASIN</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">品名/SKU <List size={10} className="inline ml-1 opacity-50"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">产品标签 <HelpCircle size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">标题</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">业务员</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">分类</th>
                       <th className="p-2 font-medium bg-gray-50 border-b border-gray-100">商品品牌 <HelpCircle size={10} className="inline text-gray-400"/></th>
                   </>
               ) : null}
               
               {!(activeTab === 'ASIN' && (activeMetric === 'orders' || activeMetric === 'revenue')) && (
                   <>
                       <th className="p-2 font-medium bg-gray-50 text-right cursor-pointer hover:bg-gray-100 border-b border-gray-100">FBA可售 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right cursor-pointer hover:bg-gray-100 border-b border-gray-100">FBA总库存 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right border-b border-gray-100">AWD库存 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                       <th className="p-2 font-medium bg-gray-50 text-right border-b border-gray-100">AWD在途 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
                   </>
               )}
               
               <th className="p-2 font-medium bg-gray-50 w-24 border-b border-gray-100">近7天{activeMetric === 'sales' ? '销量' : (activeMetric === 'revenue' ? '销售额' : '订单量')}趋势/均值 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
               <th className="p-2 font-medium bg-gray-50 text-right border-b border-gray-100">均值 <HelpCircle size={10} className="inline text-gray-400"/> <ArrowDown size={10} className="inline text-gray-400"/></th>
               <th className="p-2 font-medium bg-gray-50 text-right cursor-pointer hover:bg-gray-100 border-b border-gray-100">小计 <ArrowDown size={10} className="inline text-gray-400"/></th>
               
               {/* Date Columns */}
               {dateColumns.map((date, i) => (
                   <th key={i} className="p-2 font-medium text-center bg-gray-50 cursor-pointer hover:bg-gray-100 min-w-[50px] border-b border-gray-100">
                       <div className="font-bold text-gray-700">{date.d}</div>
                       <div className="text-[10px] text-gray-400 font-normal">{date.w}</div>
                       <ArrowDown size={10} className="inline text-gray-400 mx-auto opacity-30"/>
                   </th>
               ))}
             </tr>
           </thead>
           <tbody className="text-gray-700">
             {data.map((item: any, idx: number) => (
               <tr key={idx} className="hover:bg-blue-50 transition-colors group">
                 {/* --- Fixed Columns Logic --- */}
                 {activeTab === 'ASIN' ? (
                     <>
                        <td className="p-2 text-center text-gray-400 cursor-pointer sticky left-0 bg-white z-20 border-r border-b border-gray-100 group-hover:bg-blue-50">
                            <Play size={8} className="rotate-0 text-gray-400 mx-auto" />
                        </td>
                        <td className="p-2 sticky left-8 bg-white z-20 border-r border-b border-gray-100 group-hover:bg-blue-50">
                            <img src={item.img} className="w-8 h-8 object-cover rounded border border-gray-200" alt="" />
                        </td>
                        <td className="p-2 sticky left-[72px] bg-white z-20 w-24 border-r border-b border-gray-100 group-hover:bg-blue-50">
                            <div className="text-blue-600 hover:underline cursor-pointer font-bold">{item.asin}</div>
                        </td>
                        <td className="p-2 sticky left-[168px] bg-white z-20 w-32 border-b border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-blue-50">
                            <div className="text-blue-600 hover:underline cursor-pointer truncate max-w-[100px]" title={item.site}>{item.site}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <img src={`https://picsum.photos/20/20?random=${idx}`} className="w-3 h-3 rounded-full" />
                                <span className="text-gray-400 scale-90">{item.siteCode}</span>
                            </div>
                        </td>
                     </>
                 ) : activeTab === 'MSKU' && activeMetric === 'revenue' ? (
                     <>
                        <td className="p-2 text-center text-gray-400 cursor-pointer sticky left-0 bg-white z-20 border-r border-b border-gray-100 group-hover:bg-blue-50"><ChevronRight size={14} className="text-gray-400"/></td>
                        <td className="p-2 sticky left-8 bg-white z-20 border-r border-b border-gray-100 group-hover:bg-blue-50">
                            <img src={item.img} className="w-8 h-8 object-cover rounded border border-gray-200" alt="" />
                        </td>
                        <td className="p-2 sticky left-[72px] bg-white z-20 w-40 border-r border-b border-gray-100 group-hover:bg-blue-50">
                            <div className="text-blue-600 hover:underline cursor-pointer font-medium truncate max-w-[150px]" title={item.msku}>{item.msku}</div>
                        </td>
                        <td className="p-2 sticky left-[232px] bg-white z-20 w-32 border-b border-gray-100 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-blue-50">
                            <div className="text-blue-600 hover:underline cursor-pointer truncate max-w-[100px]" title={item.shop}>{item.shop}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                                <img src={`https://picsum.photos/20/20?random=${idx}`} className="w-3 h-3 rounded-full" />
                                <span className="text-gray-400 scale-90">美国</span>
                            </div>
                        </td>
                     </>
                 ) : (
                     // Fallback for standard tables
                     <>
                        <td className="p-2 text-center text-gray-400 cursor-pointer border-b border-gray-100"><ChevronRight size={14} className="text-gray-400"/></td>
                        <td className="p-2 border-b border-gray-100">
                            <img src={item.img} className="w-8 h-8 object-cover rounded border border-gray-200" alt="" />
                        </td>
                        {activeTab === '父ASIN' ? (
                            <>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer font-medium">{item.fatherAsin}</div>
                                </td>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer truncate max-w-[100px]" title={item.shop}>{item.shop}</div>
                                </td>
                            </>
                        ) : activeTab === 'MSKU' ? (
                            <>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer font-medium truncate max-w-[150px]" title={item.msku}>{item.msku}</div>
                                </td>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer font-medium">{item.asin}</div>
                                    <ExternalLink size={10} className="inline text-gray-400 ml-1"/>
                                </td>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer truncate max-w-[100px]" title={item.shop}>{item.shop}</div>
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer font-medium">{item.asin}</div>
                                    <ExternalLink size={10} className="inline text-gray-400 ml-1"/>
                                </td>
                                <td className="p-2 border-b border-gray-100">
                                    <div className="text-blue-600 hover:underline cursor-pointer truncate max-w-[100px]" title={item.site}>{item.site}</div>
                                </td>
                            </>
                        )}
                     </>
                 )}

                 {/* --- Scrollable Columns --- */}
                 {activeTab === 'ASIN' && (activeMetric === 'orders' || activeMetric === 'revenue') ? (
                     <>
                        <td className="p-2 text-center border-b border-gray-100"><BarChart2 size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-center border-b border-gray-100"><List size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-center border-b border-gray-100"><Target size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-gray-600 border-b border-gray-100">{item.fatherAsin}</td>
                        <td className="p-2 border-b border-gray-100">
                            <div className="text-gray-600 truncate max-w-[150px]" title={item.msku}>{item.msku}</div>
                        </td>
                        <td className="p-2 border-b border-gray-100">
                            {item.skuName && item.skuName !== '-' ? (
                                <div className="truncate max-w-[120px]" title={item.skuName}>{item.skuName}</div>
                            ) : '-'}
                        </td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.tags || '-'}</td>
                        <td className="p-2 truncate max-w-[180px] text-gray-500 border-b border-gray-100" title={item.title}>{item.title}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.salesperson}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.category}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.brand}</td>
                        <td className="p-2 text-right border-b border-gray-100">{item.fbaSellable} <ChevronDown size={10} className="inline text-gray-400"/></td>
                        <td className="p-2 text-right border-b border-gray-100">{item.fbaTotal}</td>
                        <td className="p-2 text-right border-b border-gray-100">{item.awdInv} <ChevronDown size={10} className="inline text-gray-400"/></td>
                        <td className="p-2 text-right border-b border-gray-100">{item.awdOnWay} <ChevronDown size={10} className="inline text-gray-400"/></td>
                     </>
                 ) : activeTab === 'ASIN' ? (
                     <>
                        <td className="p-2 text-center border-b border-gray-100"><BarChart2 size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-center border-b border-gray-100"><List size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-center border-b border-gray-100"><Target size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-gray-600 border-b border-gray-100">{item.fatherAsin}</td>
                        <td className="p-2 border-b border-gray-100">
                            <div className="text-gray-600 truncate max-w-[150px]" title={item.msku}>{item.msku}</div>
                        </td>
                        <td className="p-2 border-b border-gray-100">
                            {item.skuName && item.skuName !== '-' ? (
                                <div className="truncate max-w-[120px]" title={item.skuName}>{item.skuName}</div>
                            ) : '-'}
                        </td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.tags || '-'}</td>
                        <td className="p-2 truncate max-w-[180px] text-gray-500 border-b border-gray-100" title={item.title}>{item.title}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.salesperson}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.category}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.brand}</td>
                     </>
                 ) : activeTab === 'MSKU' ? (
                     <>
                        <td className="p-2 text-center border-b border-gray-100"><BarChart2 size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-gray-600 border-b border-gray-100">{item.fatherAsin}</td>
                        <td className="p-2 border-b border-gray-100">
                            <div className="text-blue-600 hover:underline cursor-pointer font-medium">{item.asin}</div>
                            <ExternalLink size={10} className="inline text-gray-400 ml-1"/>
                        </td>
                        <td className="p-2 border-b border-gray-100">
                            {item.skuName && item.skuName !== '-' ? (
                                <div className="truncate max-w-[120px]" title={item.skuName}>{item.skuName}</div>
                            ) : '-'}
                        </td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.tags || '-'}</td>
                        <td className="p-2 truncate max-w-[150px] text-gray-500 border-b border-gray-100" title={item.title}>{item.title}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.salesperson}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.category}</td>
                        <td className="p-2 text-center text-gray-400 border-b border-gray-100">{item.brand}</td>
                     </>
                 ) : (
                     <>
                        <td className="p-2 text-center border-b border-gray-100"><BarChart2 size={14} className="text-blue-600 cursor-pointer"/></td>
                        <td className="p-2 text-center border-b border-gray-100"><List size={14} className="text-blue-600 cursor-pointer"/></td>
                        {activeTab === '父ASIN' ? (
                            <td className="p-2 border-b border-gray-100">
                                <div className="text-blue-600 hover:underline cursor-pointer font-medium">{item.asin}</div>
                            </td>
                        ) : (
                            <>
                                <td className="p-2 text-center border-b border-gray-100"><Clock size={14} className="text-blue-600 cursor-pointer"/></td>
                                <td className="p-2 text-gray-600 border-b border-gray-100">{item.fatherAsin}</td>
                            </>
                        )}
                     </>
                 )}

                 {!(activeTab === 'ASIN' && (activeMetric === 'orders' || activeMetric === 'revenue')) && (
                     <>
                        <td className="p-2 text-right border-b border-gray-100">{item.fbaSellable} <ChevronDown size={10} className="inline text-gray-400"/></td>
                        <td className="p-2 text-right border-b border-gray-100">{item.fbaTotal}</td>
                        <td className="p-2 text-right border-b border-gray-100">{item.awdInv} <ChevronDown size={10} className="inline text-gray-400"/></td>
                        <td className="p-2 text-right border-b border-gray-100">{item.awdOnWay} <ChevronDown size={10} className="inline text-gray-400"/></td>
                     </>
                 )}

                 <td className="p-2 border-b border-gray-100">
                    <Sparkline data={item.trendData} />
                 </td>
                 <td className="p-2 text-right border-b border-gray-100">{activeMetric === 'revenue' ? formatCurrency(item.avg) : item.avg}</td>
                 <td className="p-2 text-right font-bold border-b border-gray-100">{activeMetric === 'revenue' ? formatCurrency(item.subtotal) : item.subtotal}</td>
                 
                 {/* Dynamic Daily Columns Loop */}
                 {dateColumns.map((_, i) => {
                     // We use modulo to cycle through the mock data array if the selected range is larger than available mock points
                     const val = item.daily[i % item.daily.length] || 0; 
                     return (
                        <td key={i} className="p-2 text-right border-b border-gray-100">
                            {activeMetric === 'revenue' ? formatCurrency(val) : val}
                        </td>
                     );
                 })}
               </tr>
             ))}
           </tbody>
           <tfoot className="bg-white sticky bottom-0 z-40 border-t border-gray-200 font-bold text-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-xs">
              <tr>
                 {/* Footer Sticky Columns */}
                 {activeTab === 'ASIN' ? (
                     <>
                        <td className="p-3 sticky left-0 bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 sticky left-8 bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 sticky left-[72px] bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 text-left pl-4 sticky left-[168px] bg-white z-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">汇总</td>
                        <td colSpan={11}></td>
                     </>
                 ) : activeTab === 'MSKU' && activeMetric === 'revenue' ? (
                     <>
                        <td className="p-3 sticky left-0 bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 sticky left-8 bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 sticky left-[72px] bg-white z-50 border-r border-gray-100"></td>
                        <td className="p-3 text-left pl-4 sticky left-[232px] bg-white z-50 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">汇总</td>
                        <td colSpan={9}></td>
                     </>
                 ) : (
                     <>
                        <td colSpan={15} className="p-3 text-left pl-4">汇总</td>
                     </>
                 )}
                 
                 {activeTab === 'ASIN' ? (
                     <>
                        <td className="p-3 text-right font-bold text-gray-900">{activeMetric === 'orders' ? '17887' : (activeMetric === 'revenue' ? '17887' : '20221')}</td>
                        <td className="p-3 text-right font-bold text-gray-900">{activeMetric === 'orders' ? '26629' : (activeMetric === 'revenue' ? '26629' : '29088')}</td>
                        <td className="p-3 text-right font-bold text-gray-900">0</td>
                        <td className="p-3 text-right font-bold text-gray-900">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right font-bold text-gray-900">{activeMetric === 'revenue' ? formatCurrency(6349.35) : (activeMetric === 'orders' ? '80.6' : '108.1')}</td>
                        <td className="p-3 text-right font-bold text-gray-900">{activeMetric === 'revenue' ? formatCurrency(63493.55) : (activeMetric === 'orders' ? '564' : '1,081')}</td>
                        
                        {/* Dynamic Footer Sums */}
                        {dateColumns.map((_, i) => {
                            // Cycle through a mock set of total values
                            const mockTotals = [155, 147, 64, 80, 56, 86, 168, 133, 192, 120, 110];
                            const orderTotals = [1, 150, 136, 62, 78, 54, 83];
                            
                            const val = activeMetric === 'orders' ? orderTotals[i % orderTotals.length] : mockTotals[i % mockTotals.length];
                            
                            return (
                                <td key={i} className="p-3 text-right font-bold text-gray-900">
                                    {activeMetric === 'revenue' ? formatCurrency(val * 58.5) : val}
                                </td>
                            );
                        })}
                     </>
                 ) : activeTab === '父ASIN' ? (
                    // ... Existing footer logic for Parent ASIN
                    activeMetric === 'orders' ? (
                     <>
                        <td className="p-3 text-right">20219</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">104.7</td>
                        <td className="p-3 text-right">1,047</td>
                        <td className="p-3 text-right">0</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{150 - (i*5)}</td>
                        ))}
                     </>
                    ) : activeMetric === 'revenue' ? (
                     <>
                        <td className="p-3 text-right">20219</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">{formatCurrency(6384.35)}</td>
                        <td className="p-3 text-right">{formatCurrency(63843.52)}</td>
                        <td className="p-3 text-right">{formatCurrency(0.00)}</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{formatCurrency(9000 - (i*200))}</td>
                        ))}
                     </>
                    ) : (
                     // Sales (default)
                     <>
                        <td className="p-3 text-right">20219</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">108.1</td>
                        <td className="p-3 text-right">1,081</td>
                        <td className="p-3 text-right">0</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{155 - (i*3)}</td>
                        ))}
                     </>
                    )
                 ) : activeTab === 'MSKU' ? (
                    // ... Existing footer logic for MSKU
                    activeMetric === 'orders' ? (
                     <>
                        <td className="p-3 text-right">20222</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">104.7</td>
                        <td className="p-3 text-right">1,047</td>
                        <td className="p-3 text-right">0</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{151 - (i*4)}</td>
                        ))}
                     </>
                    ) : activeMetric === 'revenue' ? (
                     <>
                        <td className="p-3 text-right">20222</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">{formatCurrency(6384.35)}</td>
                        <td className="p-3 text-right">{formatCurrency(63843.52)}</td>
                        <td className="p-3 text-right">{formatCurrency(0.00)}</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{formatCurrency(9254 - (i*150))}</td>
                        ))}
                     </>
                    ) : (
                     // MSKU Sales (default)
                     <>
                        <td className="p-3 text-right">20222</td>
                        <td className="p-3 text-right">29088</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3 text-right">0</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right">108.1</td>
                        <td className="p-3 text-right">1,081</td>
                        <td className="p-3 text-right">0</td>
                        {dateColumns.map((_, i) => (
                            <td key={i} className="p-3 text-right">{155 - (i*2)}</td>
                        ))}
                     </>
                    )
                 ) : null}
              </tr>
           </tfoot>
        </table>
      </div>

      {/* 4. Pagination Footer */}
      <div className="px-4 py-2 border-t border-gray-200 bg-white flex justify-between items-center text-xs select-none">
         <div></div> {/* Spacer */}
         <div className="flex items-center gap-4">
          <span className="text-gray-500">共 {activeTab === 'ASIN' && activeMetric === 'orders' ? '28' : (activeTab === 'MSKU' ? '43' : (activeTab === 'ASIN' ? '32' : (activeTab === '父ASIN' ? '25' : '32')))} 条</span>
          
          <div className="flex items-center gap-1">
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>&lt;</button>
             <button className="w-6 h-6 flex items-center justify-center border border-blue-600 bg-blue-600 text-white rounded">1</button>
             <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50 hover:text-blue-600 text-gray-600">2</button>
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
