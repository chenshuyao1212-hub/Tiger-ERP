
import { ReactNode } from 'react';

export interface MenuItem {
  id: string;
  label: string;
  children?: MenuItem[];
  isNew?: boolean; // Label for "New" features
  isHot?: boolean; // Label for "Hot" features (Fire icon)
  icon?: ReactNode;
}

export interface MetricData {
  label: string;
  value: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  subValue?: string; // e.g., "Yesterday: 100"
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}

export interface TaskItem {
  id: string;
  title: string;
  count: number;
  urgentCount?: number;
  type: 'urgent' | 'warning' | 'info';
}

export enum StoreRegion {
  NA = 'North America',
  EU = 'Europe',
  JP = 'Japan'
}

export interface Store {
  id: string;
  name: string;
  region: StoreRegion;
  marketplace: string;
}

// --- Filter Types ---
export interface Salesperson {
  id: string;
  name: string;
}

export interface SiteItem {
    id: string;
    name: string;
    type: 'region' | 'site';
    icon?: string;
    children?: SiteItem[];
}

export interface ShopItem {
    id: string;
    name: string;
    region: string;
}

export interface StatusItem {
    id: string;
    name: string;
}

// --- Table Types ---
export interface ColumnDef {
  id: string;
  label: string;
  width: number;
  minWidth?: number;
  pinned: boolean;
  visible: boolean;
  align?: 'left' | 'center' | 'right';
  hasSort?: boolean;
  hasHelp?: boolean;
}
