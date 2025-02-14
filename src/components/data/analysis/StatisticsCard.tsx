
import { Card } from "@/components/ui/card"
import { ColumnStatistics } from "@/types/data-analysis"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

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

  return (
    <Card className="p-4 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-4">Métricas Básicas</h4>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Total de Registros</dt>
              <dd className="text-sm font-medium">{statistics.count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Valores Únicos</dt>
              <dd className="text-sm font-medium">{statistics.distinctCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-muted-foreground">Valores Nulos</dt>
              <dd className="text-sm font-medium">{statistics.nullCount}</dd>
            </div>
            {statistics.mean !== undefined && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Média</dt>
                <dd className="text-sm font-medium">{statistics.mean.toFixed(2)}</dd>
              </div>
            )}
            {statistics.median !== undefined && (
              <div className="flex justify-between">
                <dt className="text-sm text-muted-foreground">Mediana</dt>
                <dd className="text-sm font-medium">{statistics.median}</dd>
              </div>
            )}
          </dl>
        </div>

        {statistics.quartiles && (
          <div>
            <h4 className="font-medium mb-4">Quartis</h4>
            <dl className="space-y-2">
              {statistics.quartiles.map((value, index) => (
                <div key={index} className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Q{index + 1}</dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {chartData.length > 0 && (
        <div>
          <h4 className="font-medium mb-4">Distribuição</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="value" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  )
}
