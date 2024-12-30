import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const hourlyData = [
  { hora: '8h', vendas: 12 },
  { hora: '10h', vendas: 18 },
  { hora: '12h', vendas: 25 },
  { hora: '14h', vendas: 20 },
  { hora: '16h', vendas: 28 },
  { hora: '18h', vendas: 35 },
  { hora: '20h', vendas: 42 },
  { hora: '22h', vendas: 30 },
];

export function HourlyChart() {
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Vendas por Hora</h3>
        <div className="flex items-center text-sm text-indigo-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Pico às 20h</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={hourlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="vendas" 
            name="Vendas"
            stroke="#8884d8" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}