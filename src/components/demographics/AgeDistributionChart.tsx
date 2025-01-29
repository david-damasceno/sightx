import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { faixa: '18-24', quantidade: 1200 },
  { faixa: '25-34', quantidade: 2800 },
  { faixa: '35-44', quantidade: 2200 },
  { faixa: '45-54', quantidade: 1800 },
  { faixa: '55-64', quantidade: 1500 },
  { faixa: '65+', quantidade: 900 },
]

export function AgeDistributionChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Distribuição por Idade</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="faixa" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="quantidade" 
            name="Quantidade"
            fill="#4f46e5" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}