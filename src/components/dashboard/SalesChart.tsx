import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const salesData = [
  { name: 'Jan', vendas: 135000, meta: 130000 },
  { name: 'Fev', vendas: 148000, meta: 140000 },
  { name: 'Mar', vendas: 162000, meta: 150000 },
  { name: 'Abr', vendas: 175231, meta: 160000 },
  { name: 'Mai', vendas: 188000, meta: 170000 },
  { name: 'Jun', vendas: 202000, meta: 180000 },
];

export function SalesChart() {
  return (
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
  );
}