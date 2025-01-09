export interface Seller {
  id: string;
  name: string;
  region: string;
  avatarUrl: string;
  salesVolume: number;
  targetCompletion: number;
  performance: 'low' | 'medium' | 'high';
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  avatarUrl: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  performance: 'low' | 'medium' | 'high';
}

export interface SalesMetrics {
  totalRevenue: number;
  totalSales: number;
  averageTicket: number;
  conversionRate: number;
  targetCompletion: number;
}

export interface PerformanceMetrics {
  totalEmployees: number;
  averageScore: number;
  topPerformers: number;
  improvementRate: number;
  departmentScore: number;
}