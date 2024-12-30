import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const customerData = [
  { tipo: 'Novos', valor: 30 },
  { tipo: 'Recorrentes', valor: 70 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function CustomerChart() {
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Perfil dos Clientes</h3>
        <div className="flex items-center text-sm text-teal-500">
          <Users className="h-4 w-4 mr-1" />
          <span>70% recorrentes</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={customerData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="valor"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {customerData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}