import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Users, AlertCircle, Brain, Target, DollarSign, ShoppingCart } from "lucide-react";

export function InsightsPanel() {
  const insights = [
    {
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "Mih sugere: Aumente o engajamento nas redes sociais com posts entre 18h-21h, período de maior atividade do seu público",
      type: "ai"
    },
    {
      icon: <Target className="h-4 w-4 text-blue-500" />,
      text: "Mih identificou: Seu público-alvo está mais ativo em Instagram e LinkedIn. Considere aumentar investimentos nestas plataformas",
      type: "ai"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Crescimento de 23% nas vendas online comparado ao mês anterior",
      type: "success"
    },
    {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: "Mih alerta: 5 produtos populares estão com estoque baixo. Recomendo reposição em 7 dias",
      type: "warning"
    },
    {
      icon: <Users className="h-4 w-4 text-indigo-500" />,
      text: "Mih observou: 78% dos clientes são millennials. Sugestão de campanhas focadas em sustentabilidade e tecnologia",
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
              ${insight.type === 'success' ? 'bg-green-50 text-green-700' : ''}
              ${insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : ''}
              ${insight.type === 'ai' ? 'bg-purple-50 text-purple-700' : ''}
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