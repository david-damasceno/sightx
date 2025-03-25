
import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users, Clock, Repeat, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function InsightsPanel() {
  const insights = [
    {
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "DONA sugere: Aumente o estoque dos produtos eletrônicos. As vendas desta categoria cresceram 25% este mês",
      type: "ai",
      priority: "high",
      category: "Estoque",
      impact: "Alto",
      timeToImplement: "1-2 dias"
    },
    {
      icon: <Package className="h-4 w-4 text-orange-500" />,
      text: "DONA alerta: Produto B e E estão com estoque abaixo do mínimo. Necessário reposição urgente",
      type: "warning",
      priority: "high",
      category: "Estoque",
      impact: "Alto",
      timeToImplement: "Imediato"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Vendas superaram a meta em 12.5% este mês. Principal motivo: promoção de eletrônicos",
      type: "success",
      priority: "medium",
      category: "Vendas",
      impact: "Médio",
      timeToImplement: "N/A"
    },
    {
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      text: "DONA identificou: 65% das vendas ocorrem entre 18h e 22h. Considere estender o horário de atendimento",
      type: "ai",
      priority: "medium",
      category: "Operacional",
      impact: "Alto",
      timeToImplement: "1 semana"
    },
    {
      icon: <Users className="h-4 w-4 text-indigo-500" />,
      text: "DONA observou: Clientes que compram eletrônicos têm 70% mais chance de retornar em 30 dias",
      type: "ai",
      priority: "low",
      category: "Clientes",
      impact: "Médio",
      timeToImplement: "N/A"
    },
    {
      icon: <Clock className="h-4 w-4 text-teal-500" />,
      text: "DONA sugere: Aumente a equipe no período das 18h às 22h para melhor atendimento",
      type: "ai",
      priority: "medium",
      category: "RH",
      impact: "Alto",
      timeToImplement: "2 semanas"
    },
    {
      icon: <Repeat className="h-4 w-4 text-pink-500" />,
      text: "Taxa de recompra aumentou 5% após implementação do programa de fidelidade",
      type: "success",
      priority: "low",
      category: "Fidelização",
      impact: "Médio",
      timeToImplement: "N/A"
    }
  ]

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="font-semibold">Insights da DONA</h3>
            <p className="text-sm text-muted-foreground">7 insights ativos</p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Exportar
        </Button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={cn(
              "group relative flex flex-col gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer animate-fade-in",
              {
                'bg-purple-50 dark:bg-purple-950': insight.type === 'ai',
                'bg-yellow-50 dark:bg-yellow-950': insight.type === 'warning',
                'bg-green-50 dark:bg-green-950': insight.type === 'success',
                'border-l-4': true,
                'border-l-red-500': insight.priority === 'high',
                'border-l-yellow-500': insight.priority === 'medium',
                'border-l-blue-500': insight.priority === 'low',
              }
            )}
          >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">{insight.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.text}</p>
                
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                    {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                  </Badge>
                  <Badge variant="outline">{insight.category}</Badge>
                  <Badge variant="outline">Impacto: {insight.impact}</Badge>
                  {insight.timeToImplement !== 'N/A' && (
                    <Badge variant="outline">Tempo: {insight.timeToImplement}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
