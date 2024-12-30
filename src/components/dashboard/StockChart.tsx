import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const stockData = [
  { produto: 'Produto A', estoque: 45, minimo: 20 },
  { produto: 'Produto B', estoque: 15, minimo: 30 },
  { produto: 'Produto C', estoque: 78, minimo: 25 },
  { produto: 'Produto D', estoque: 23, minimo: 20 },
  { produto: 'Produto E', estoque: 8, minimo: 15 },
];

export function StockChart() {
  return (
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
  );
}