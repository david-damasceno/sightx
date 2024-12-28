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
  Users, 
  DollarSign, 
  ShoppingCart,
  Target,
  ArrowUpRight,
  Percent,
  Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";

const revenueData = [
  { name: 'Jan', receita: 135000, custos: 85000 },
  { name: 'Fev', receita: 148000, custos: 88000 },
  { name: 'Mar', receita: 162000, custos: 92000 },
  { name: 'Abr', receita: 175231, custos: 95000 },
  { name: 'Mai', receita: 188000, custos: 98000 },
  { name: 'Jun', receita: 202000, custos: 102000 },
];

const conversionData = [
  { hora: '08:00', taxa: 2.4 },
  { hora: '10:00', taxa: 3.1 },
  { hora: '12:00', taxa: 4.3 },
  { hora: '14:00', taxa: 3.8 },
  { hora: '16:00', taxa: 4.1 },
  { hora: '18:00', taxa: 4.8 },
  { hora: '20:00', taxa: 5.2 },
  { hora: '22:00', taxa: 3.9 },
];

const customerSegments = [
  { name: 'Jan', novos: 840, recorrentes: 580 },
  { name: 'Fev', novos: 920, recorrentes: 650 },
  { name: 'Mar', novos: 880, recorrentes: 720 },
  { name: 'Abr', novos: 960, recorrentes: 780 },
  { name: 'Mai', novos: 1020, recorrentes: 850 },
  { name: 'Jun', novos: 1150, recorrentes: 920 },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Receita Total"
            value="R$ 202.000"
            change="+20.1%"
            icon={<DollarSign className="h-4 w-4 text-green-500" />}
          />
          <MetricCard
            title="Clientes Ativos"
            value="2.070"
            change="+15.1%"
            icon={<Users className="h-4 w-4 text-blue-500" />}
          />
          <MetricCard
            title="Taxa de Conversão"
            value="5.2%"
            change="+1.4%"
            icon={<Percent className="h-4 w-4 text-purple-500" />}
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 235"
            change="+10.3%"
            icon={<ShoppingCart className="h-4 w-4 text-orange-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Receita vs Custos</h3>
              <div className="flex items-center text-sm text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>Margem de lucro: 48%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stackId="1"
                  stroke="#4f46e5" 
                  fill="#4f46e5"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="custos" 
                  stackId="1"
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
              <h3 className="font-semibold">Taxa de Conversão por Hora</h3>
              <div className="flex items-center text-sm text-purple-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Melhor horário: 20h</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="taxa" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Segmentação de Clientes</h3>
              <div className="flex items-center text-sm text-blue-500">
                <Target className="h-4 w-4 mr-1" />
                <span>+25% novos clientes</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerSegments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="novos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recorrentes" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}