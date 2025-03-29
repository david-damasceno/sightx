
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
    <div className="grid grid-cols-1 gap-6">
      <Card className="overflow-hidden border-purple-100/20 dark:border-purple-900/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50/50 to-white/50 dark:from-purple-900/20 dark:to-gray-800/50 border-b border-purple-100/20 dark:border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-md">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Tendência de Vendas</CardTitle>
                <CardDescription>
                  Comparativo de vendas realizadas vs. meta
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1 border-purple-100/30 dark:border-purple-900/30">
              <ChartLine className="h-4 w-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" className="fill-gray-600 dark:fill-gray-300 text-xs" />
                <YAxis className="fill-gray-600 dark:fill-gray-300 text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(147, 51, 234, 0.2)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#22c55e" 
                  name="Vendas"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#22c55e' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="#94a3b8" 
                  name="Meta"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={{ r: 3, strokeWidth: 1, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-purple-100/20 dark:border-purple-900/20 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50/50 to-white/50 dark:from-blue-900/20 dark:to-gray-800/50 border-b border-purple-100/20 dark:border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Evolução de Clientes</CardTitle>
                <CardDescription>
                  Novos clientes vs. recorrentes por mês
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1 border-purple-100/30 dark:border-purple-900/30">
              <ChartLine className="h-4 w-4" />
              <span className="hidden sm:inline">Detalhes</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="mes" className="fill-gray-600 dark:fill-gray-300 text-xs" />
                <YAxis className="fill-gray-600 dark:fill-gray-300 text-xs" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="novos" 
                  name="Novos Clientes" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="recorrentes" 
                  name="Clientes Recorrentes" 
                  fill="#93c5fd"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
