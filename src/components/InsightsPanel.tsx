import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users } from "lucide-react";

export function InsightsPanel() {
  const insights = [
    {
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "Mih sugere: Aumente o estoque dos produtos eletrônicos. As vendas desta categoria cresceram 25% este mês",
      type: "ai"
    },
    {
      icon: <Package className="h-4 w-4 text-orange-500" />,
      text: "Mih alerta: Produto B e E estão com estoque abaixo do mínimo. Necessário reposição urgente",
      type: "warning"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Vendas superaram a meta em 12.5% este mês. Principal motivo: promoção de eletrônicos",
      type: "success"
    },
    {
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      text: "Mih identificou: 65% das vendas ocorrem entre 18h e 22h. Considere estender o horário de atendimento",
      type: "ai"
    },
    {
      icon: <Users className="h-4 w-4 text-indigo-500" />,
      text: "Mih observou: Clientes que compram eletrônicos têm 70% mais chance de retornar em 30 dias",
      type: "ai"
    }
  ];

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-500" />
        <h3 className="font-semibold">Insights da Mih</h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors
              ${insight.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : ''}
              ${insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : ''}
              ${insight.type === 'ai' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : ''}
            `}
          >
            {insight.icon}
            <p className="text-sm">{insight.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}