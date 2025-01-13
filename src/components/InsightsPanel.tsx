import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users, Clock, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"

export function InsightsPanel() {
  const insights = [
    {
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "DONA sugere: Aumente o estoque dos produtos eletrônicos. As vendas desta categoria cresceram 25% este mês",
      type: "ai",
      priority: "high"
    },
    {
      icon: <Package className="h-4 w-4 text-orange-500" />,
      text: "DONA alerta: Produto B e E estão com estoque abaixo do mínimo. Necessário reposição urgente",
      type: "warning",
      priority: "high"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Vendas superaram a meta em 12.5% este mês. Principal motivo: promoção de eletrônicos",
      type: "success",
      priority: "medium"
    },
    {
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      text: "DONA identificou: 65% das vendas ocorrem entre 18h e 22h. Considere estender o horário de atendimento",
      type: "ai",
      priority: "medium"
    },
    {
      icon: <Users className="h-4 w-4 text-indigo-500" />,
      text: "DONA observou: Clientes que compram eletrônicos têm 70% mais chance de retornar em 30 dias",
      type: "ai",
      priority: "low"
    },
    {
      icon: <Clock className="h-4 w-4 text-teal-500" />,
      text: "DONA sugere: Aumente a equipe no período das 18h às 22h para melhor atendimento",
      type: "ai",
      priority: "medium"
    },
    {
      icon: <Repeat className="h-4 w-4 text-pink-500" />,
      text: "Taxa de recompra aumentou 5% após implementação do programa de fidelidade",
      type: "success",
      priority: "low"
    }
  ]

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Insights da DONA</h3>
        </div>
        <span className="text-xs text-muted-foreground">Atualizado há 5 min</span>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer animate-fade-in",
              {
                'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300': insight.type === 'ai',
                'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300': insight.type === 'warning',
                'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300': insight.type === 'success',
                'border-l-4': true,
                'border-l-red-500': insight.priority === 'high',
                'border-l-yellow-500': insight.priority === 'medium',
                'border-l-blue-500': insight.priority === 'low',
              }
            )}
          >
            <div className="flex-shrink-0 mt-1">{insight.icon}</div>
            <div className="flex-1">
              <p className="text-sm">{insight.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  {
                    'bg-red-100 text-red-700': insight.priority === 'high',
                    'bg-yellow-100 text-yellow-700': insight.priority === 'medium',
                    'bg-blue-100 text-blue-700': insight.priority === 'low',
                  }
                )}>
                  {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}