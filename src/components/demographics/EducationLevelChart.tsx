import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { nivel: 'Fundamental', quantidade: 800 },
  { nivel: 'Médio', quantidade: 2500 },
  { nivel: 'Superior', quantidade: 1800 },
  { nivel: 'Pós-graduação', quantidade: 900 },
]

export function EducationLevelChart() {
  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Nível de Escolaridade</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="nivel" type="category" />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="quantidade" 
            name="Quantidade"
            fill="#8b5cf6" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}