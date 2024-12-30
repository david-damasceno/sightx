import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Users,
  ArrowUpRight,
  Percent,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";

const salesData = [
  { name: 'Jan', vendas: 135000, meta: 130000 },
  { name: 'Fev', vendas: 148000, meta: 140000 },
  { name: 'Mar', vendas: 162000, meta: 150000 },
  { name: 'Abr', vendas: 175231, meta: 160000 },
  { name: 'Mai', vendas: 188000, meta: 170000 },
  { name: 'Jun', vendas: 202000, meta: 180000 },
];

const stockData = [
  { produto: 'Produto A', estoque: 45, minimo: 20 },
  { produto: 'Produto B', estoque: 15, minimo: 30 },
  { produto: 'Produto C', estoque: 78, minimo: 25 },
  { produto: 'Produto D', estoque: 23, minimo: 20 },
  { produto: 'Produto E', estoque: 8, minimo: 15 },
];

const categoryData = [
  { categoria: 'Eletrônicos', vendas: 85000 },
  { categoria: 'Móveis', vendas: 65000 },
  { categoria: 'Decoração', vendas: 45000 },
  { categoria: 'Utensílios', vendas: 35000 },
  { categoria: 'Outros', vendas: 25000 },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Vendas do Mês"
            value="R$ 202.000"
            change="+12.5%"
            icon={<DollarSign className="h-4 w-4 text-green-500" />}
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 350"
            change="+8.3%"
            icon={<ShoppingCart className="h-4 w-4 text-blue-500" />}
          />
          <MetricCard
            title="Taxa de Conversão"
            value="4.8%"
            change="+1.2%"
            icon={<Percent className="h-4 w-4 text-purple-500" />}
          />
          <MetricCard
            title="Produtos em Baixa"
            value="5"
            change="-2"
            icon={<Package className="h-4 w-4 text-orange-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vendas vs Meta</h3>
              <div className="flex items-center text-sm text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>12.5% acima da meta</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  name="Vendas"
                  stroke="#4f46e5" 
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="meta" 
                  name="Meta"
                  stroke="#ef4444" 
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <InsightsPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Alerta de Estoque</h3>
              <div className="flex items-center text-sm text-orange-500">
                <Package className="h-4 w-4 mr-1" />
                <span>2 produtos críticos</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="produto" type="category" />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="estoque" 
                  name="Estoque Atual"
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey="minimo" 
                  name="Estoque Mínimo"
                  fill="#ef4444" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vendas por Categoria</h3>
              <div className="flex items-center text-sm text-blue-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>Eletrônicos em alta</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="vendas" 
                  name="Vendas (R$)"
                  fill="#22c55e" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}