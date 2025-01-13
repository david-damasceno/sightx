import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockNPSData = [
  { category: "Detratores", value: 15, color: "#ef4444" },
  { category: "Neutros", value: 25, color: "#f59e0b" },
  { category: "Promotores", value: 60, color: "#22c55e" }
];

export function NPSBreakdownChart() {
  return (
    <Card className="p-6 glass-card">
      <div className="mb-4">
        <h3 className="font-semibold">Distribuição de NPS</h3>
        <p className="text-sm text-muted-foreground">Análise por categoria de respondentes</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={mockNPSData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}