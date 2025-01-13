import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Brain, TrendingUp, Users, Target, ChartLine } from "lucide-react"
import { Button } from "@/components/ui/button"

const salesData = [
  { month: 'Jan', vendas: 4000, meta: 3000 },
  { month: 'Fev', vendas: 3000, meta: 3000 },
  { month: 'Mar', vendas: 5000, meta: 3000 },
  { month: 'Abr', vendas: 2780, meta: 3000 },
  { month: 'Mai', vendas: 4890, meta: 3000 },
  { month: 'Jun', vendas: 3390, meta: 3000 },
]

const customerData = [
  { mes: 'Jan', novos: 120, recorrentes: 200 },
  { mes: 'Fev', novos: 150, recorrentes: 220 },
  { mes: 'Mar', novos: 180, recorrentes: 250 },
  { mes: 'Abr', novos: 170, recorrentes: 280 },
  { mes: 'Mai', novos: 200, recorrentes: 300 },
  { mes: 'Jun', novos: 220, recorrentes: 320 },
]

export function InsightsTrends() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Tendência de Vendas
              </CardTitle>
              <CardDescription>
                Comparativo de vendas realizadas vs. meta
              </CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <ChartLine className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#22c55e" 
                  name="Vendas"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="#94a3b8" 
                  name="Meta"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Evolução de Clientes
              </CardTitle>
              <CardDescription>
                Novos clientes vs. recorrentes por mês
              </CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <ChartLine className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="novos" 
                  name="Novos Clientes" 
                  fill="#3b82f6"
                />
                <Bar 
                  dataKey="recorrentes" 
                  name="Clientes Recorrentes" 
                  fill="#93c5fd"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}