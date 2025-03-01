
import { useState } from "react"
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
import { 
  Info, 
  ChevronRight, 
  BarChart4, 
  Check, 
  AlertTriangle, 
  X,
  PieChart,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"

interface StatisticsCardProps {
  columnName: string
  statistics: ColumnStatistics
}

export function StatisticsCard({ columnName, statistics }: StatisticsCardProps) {
  const [expanded, setExpanded] = useState(false)
  
  const chartData = statistics.distribution ? 
    Object.entries(statistics.distribution).map(([value, count]) => ({
      value,
      count
    })) : []

  // Cores para o gráfico de barras
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F']
  const maxCount = Math.max(...chartData.map(item => item.count))
  
  // Cálculo de métricas de integridade de dados
  const completeness = statistics.count > 0 
    ? ((statistics.count - statistics.nullCount) / statistics.count) * 100 
    : 0
  
  const uniqueness = statistics.count > 0 
    ? (statistics.distinctCount / statistics.count) * 100 
    : 0
  
  const validity = 100 // Placeholder (em um cenário real, seria calculado com base em regras de validação)
  
  const getQualityStatus = (value: number) => {
    if (value >= 90) return { status: "success", icon: <Check className="h-4 w-4" />, label: "Excelente" }
    if (value >= 70) return { status: "warning", icon: <AlertTriangle className="h-4 w-4" />, label: "Boa" }
    return { status: "error", icon: <X className="h-4 w-4" />, label: "Insuficiente" }
  }
  
  const completenessStatus = getQualityStatus(completeness)
  const uniquenessStatus = getQualityStatus(uniqueness)
  const validityStatus = getQualityStatus(validity)

  return (
    <Card className="p-4 space-y-6 overflow-hidden analysis-card transition-all duration-300 hover:shadow-md">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-lg font-medium">
          <BarChart4 className="h-5 w-5 text-primary" />
          <h3>{columnName}</h3>
        </div>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", 
        expanded ? "opacity-100" : "opacity-100"
      )}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Métricas Básicas</span>
            </h4>
            
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <PieChart className="h-3 w-3" />
                    <span>Estatísticas</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Métricas estatísticas da coluna</p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
          
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
              <dd className="flex items-center gap-2">
                <span className="text-sm font-medium stat-value">{statistics.nullCount}</span>
                {statistics.nullCount > 0 && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Atenção: Existem valores nulos nesta coluna</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )}
              </dd>
            </div>
            {statistics.mean !== undefined && (
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                <dt className="text-sm text-muted-foreground">Média</dt>
                <dd className="text-sm font-medium stat-value">{typeof statistics.mean === 'number' ? statistics.mean.toFixed(2) : statistics.mean}</dd>
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

        <div className="space-y-4">
          <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4" />
            <span>Qualidade dos Dados</span>
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Completude</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Porcentagem de valores não-nulos</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={completenessStatus.status === "success" ? "default" : completenessStatus.status === "warning" ? "outline" : "destructive"} className="flex items-center gap-1">
                  {completenessStatus.icon}
                  <span>{completenessStatus.label}</span>
                </Badge>
              </div>
              <Progress value={completeness} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{completeness.toFixed(1)}%</span>
                <span>{statistics.nullCount} valores ausentes</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Unicidade</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Porcentagem de valores únicos</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={uniquenessStatus.status === "success" ? "default" : uniquenessStatus.status === "warning" ? "outline" : "destructive"} className="flex items-center gap-1">
                  {uniquenessStatus.icon}
                  <span>{uniquenessStatus.label}</span>
                </Badge>
              </div>
              <Progress value={uniqueness} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{uniqueness.toFixed(1)}%</span>
                <span>{statistics.distinctCount} únicos / {statistics.count} total</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Validade</span>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Conformidade com regras de validação</p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </div>
                <Badge variant={validityStatus.status === "success" ? "default" : validityStatus.status === "warning" ? "outline" : "destructive"} className="flex items-center gap-1">
                  {validityStatus.icon}
                  <span>{validityStatus.label}</span>
                </Badge>
              </div>
              <Progress value={validity} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{validity.toFixed(1)}%</span>
                <span>0 erros de validação</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statistics.quartiles && statistics.quartiles.length > 0 && expanded && (
        <div className="space-y-4 pt-2 border-t">
          <h4 className="font-medium my-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronRight className="h-4 w-4" />
            <span>Quartis</span>
          </h4>
          <dl className="grid grid-cols-4 gap-3">
            {statistics.quartiles.map((value, index) => (
              <div key={index} className="flex flex-col items-center p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors">
                <dt className="text-sm text-muted-foreground">Q{index + 1}</dt>
                <dd className="text-sm font-medium stat-value">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {chartData.length > 0 && (
        <div className={cn("pt-4 border-t", expanded ? "block" : "block")}>
          <h4 className="font-medium mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart4 className="h-4 w-4" />
            <span>Distribuição</span>
          </h4>
          <div className="h-[200px] chart-container bg-card/50 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
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
