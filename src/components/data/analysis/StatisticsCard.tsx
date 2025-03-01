
import { Card } from "@/components/ui/card"
import { ColumnStatistics } from "@/types/data-analysis"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Info, ChevronRight, BarChart4 } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatisticsCardProps {
  columnName: string
  statistics: ColumnStatistics
}

export function StatisticsCard({ columnName, statistics }: StatisticsCardProps) {
  const chartData = statistics.distribution ? 
    Object.entries(statistics.distribution).map(([value, count]) => ({
      value,
      count
    })) : []

  // Cores para o gráfico de barras
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];
  const maxCount = Math.max(...chartData.map(item => item.count));

  return (
    <Card className="p-4 space-y-6 overflow-hidden analysis-card">
      <div className="flex items-center gap-2 text-lg font-medium mb-2">
        <BarChart4 className="h-5 w-5 text-primary" />
        <h3>{columnName}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>Métricas Básicas</span>
          </h4>
          <dl className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
              <dt className="text-sm text-muted-foreground">Total de Registros</dt>
              <dd className="text-sm font-medium stat-value">{statistics.count}</dd>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
              <dt className="text-sm text-muted-foreground">Valores Únicos</dt>
              <dd className="text-sm font-medium stat-value">{statistics.distinctCount}</dd>
            </div>
            <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
              <dt className="text-sm text-muted-foreground">Valores Nulos</dt>
              <dd className="text-sm font-medium stat-value">{statistics.nullCount}</dd>
            </div>
            {statistics.mean !== undefined && (
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                <dt className="text-sm text-muted-foreground">Média</dt>
                <dd className="text-sm font-medium stat-value">{statistics.mean.toFixed(2)}</dd>
              </div>
            )}
            {statistics.median !== undefined && (
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                <dt className="text-sm text-muted-foreground">Mediana</dt>
                <dd className="text-sm font-medium stat-value">{statistics.median}</dd>
              </div>
            )}
          </dl>
        </div>

        {statistics.quartiles && statistics.quartiles.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <ChevronRight className="h-4 w-4" />
              <span>Quartis</span>
            </h4>
            <dl className="space-y-3">
              {statistics.quartiles.map((value, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                  <dt className="text-sm text-muted-foreground">Q{index + 1}</dt>
                  <dd className="text-sm font-medium stat-value">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart4 className="h-4 w-4" />
            <span>Distribuição</span>
          </h4>
          <div className="h-[200px] chart-container bg-card/50 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="value" 
                  tick={{ fontSize: 12 }} 
                  tickLine={{ stroke: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  tickLine={{ stroke: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--tooltip-background-color)',
                    color: 'var(--tooltip-text-color)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: 'var(--tooltip-text-color)' }}
                  formatter={(value) => [Number(value).toLocaleString(), 'Contagem']}
                  labelFormatter={(value) => [`Valor: ${value}`]}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]} 
                      fillOpacity={0.8 * (entry.count / maxCount) + 0.2}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
