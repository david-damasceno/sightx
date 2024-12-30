import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const categoryData = [
  { categoria: 'Eletrônicos', vendas: 85000 },
  { categoria: 'Móveis', vendas: 65000 },
  { categoria: 'Decoração', vendas: 45000 },
  { categoria: 'Utensílios', vendas: 35000 },
  { categoria: 'Outros', vendas: 25000 },
];

export function CategoryChart() {
  return (
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
  );
}