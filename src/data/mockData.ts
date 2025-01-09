import { Seller, Employee, SalesMetrics, PerformanceMetrics } from "@/types/dashboard";

export const mockSellers: Seller[] = [
  {
    id: "1",
    name: "João Silva",
    region: "Sul",
    avatarUrl: "/placeholder.svg",
    salesVolume: 150000,
    targetCompletion: 95,
    performance: "high",
  },
  {
    id: "2",
    name: "Maria Santos",
    region: "Sudeste",
    avatarUrl: "/placeholder.svg",
    salesVolume: 120000,
    targetCompletion: 85,
    performance: "medium",
  },
  {
    id: "3",
    name: "Pedro Costa",
    region: "Norte",
    avatarUrl: "/placeholder.svg",
    salesVolume: 90000,
    targetCompletion: 70,
    performance: "low",
  },
];

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Ana Oliveira",
    department: "Marketing",
    avatarUrl: "/placeholder.svg",
    score: 9.2,
    trend: "up",
    performance: "high",
  },
  {
    id: "2",
    name: "Carlos Souza",
    department: "Vendas",
    avatarUrl: "/placeholder.svg",
    score: 7.5,
    trend: "stable",
    performance: "medium",
  },
  {
    id: "3",
    name: "Lucia Ferreira",
    department: "TI",
    avatarUrl: "/placeholder.svg",
    score: 6.8,
    trend: "down",
    performance: "low",
  },
];

export const mockSalesMetrics: SalesMetrics = {
  totalRevenue: 1500000,
  totalSales: 450,
  averageTicket: 3333.33,
  conversionRate: 28,
  targetCompletion: 85,
};

export const mockPerformanceMetrics: PerformanceMetrics = {
  totalEmployees: 150,
  averageScore: 7.8,
  topPerformers: 25,
  improvementRate: 15,
  departmentScore: 8.2,
};