import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { name: 'Até R$ 2.000', value: 30 },
  { name: 'R$ 2.001 - R$ 4.000', value: 35 },
  { name: 'R$ 4.001 - R$ 6.000', value: 20 },
  { name: 'R$ 6.001+', value: 15 },
]

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#f43f5e']

export function IncomeDistributionChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Distribuição por Renda</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}