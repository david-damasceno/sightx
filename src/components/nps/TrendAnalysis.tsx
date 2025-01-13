import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowUpRight } from "lucide-react";

const mockTrendData = [
  { month: "Jan", nps: 65 },
  { month: "Fev", nps: 68 },
  { month: "Mar", nps: 72 },
  { month: "Abr", nps: 70 },
  { month: "Mai", nps: 75 },
  { month: "Jun", nps: 78 }
];

export function TrendAnalysis() {
  return (
    <Card className="p-6 glass-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Evolução do NPS</h3>
          <p className="text-sm text-muted-foreground">Tendência dos últimos 6 meses</p>
        </div>
        <div className="flex items-center text-sm text-green-500">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          <span>+13 pontos</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockTrendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="nps" 
            stroke="#4f46e5" 
            strokeWidth={2}
            dot={{ fill: "#4f46e5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}