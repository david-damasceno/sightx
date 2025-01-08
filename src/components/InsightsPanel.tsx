import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users, Clock, Repeat, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Insight {
  id: string;
  content: string;
  type: 'ai' | 'warning' | 'success' | 'info';
  icon: string;
  priority: number;
  category: string;
  action_taken: boolean;
}

const iconMap = {
  Brain,
  TrendingUp,
  Package,
  AlertCircle,
  ShoppingCart,
  Users,
  Clock,
  Repeat,
  Leaf
};

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Erro ao carregar insights",
        description: "Não foi possível carregar as sugestões da Mih",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsActioned = async (id: string) => {
    try {
      const { error } = await supabase
        .from('insights')
        .update({ action_taken: true })
        .eq('id', id);

      if (error) throw error;

      setInsights(prev => 
        prev.map(insight => 
          insight.id === id ? { ...insight, action_taken: true } : insight
        )
      );

      toast({
        title: "Ação registrada",
        description: "O insight foi marcado como tratado",
      });
    } catch (error) {
      console.error('Error marking insight as actioned:', error);
      toast({
        title: "Erro ao registrar ação",
        description: "Não foi possível atualizar o status do insight",
        variant: "destructive"
      });
    }
  };

  const getTypeStyles = (type: Insight['type']) => {
    const baseStyles = "flex items-start gap-3 p-4 rounded-lg transition-colors";
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300`;
      case 'ai':
        return `${baseStyles} bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300`;
      case 'info':
        return `${baseStyles} bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300`;
      default:
        return baseStyles;
    }
  };

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <h3 className="font-semibold">Insights da Mih</h3>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:Vou ajudar a melhorar o painel com mais análises e sugestões mais relevantes da Mih. Vamos reorganizar os componentes e adicionar mais insights valiosos.

<lov-code>
Primeiro, vamos atualizar o InsightsPanel.tsx com sugestões mais estratégicas:

<lov-write file_path="src/components/InsightsPanel.tsx">
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users, Clock, Repeat, Target, DollarSign, Zap, LineChart } from "lucide-react";

export function InsightsPanel() {
  const insights = [
    {
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "Mih sugere: Aumente o estoque de smartphones e notebooks. A análise preditiva indica aumento de 35% na demanda para o próximo mês",
      type: "ai"
    },
    {
      icon: <Target className="h-4 w-4 text-orange-500" />,
      text: "Mih alerta: 3 produtos premium estão com margens abaixo do ideal. Sugestão de reajuste de 8-12% nos preços",
      type: "warning"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Análise de tendência: Produtos sustentáveis tiveram crescimento de 45% nas vendas. Considere expandir esta categoria",
      type: "success"
    },
    {
      icon: <ShoppingCart className="h-4 w-4 text-blue-500" />,
      text: "Mih identificou: Clientes que compram pela manhã têm ticket médio 25% maior. Sugestão de promoções especiais neste período",
      type: "ai"
    },
    {
      icon: <Users className="h-4 w-4 text-indigo-500" />,
      text: "Segmentação: 40% dos clientes premium não fizeram compras este mês. Recomendo campanha de reativação personalizada",
      type: "ai"
    },
    {
      icon: <Clock className="h-4 w-4 text-teal-500" />,
      text: "Mih observou: Tempo médio de entrega aumentou 15%. Necessário otimizar rotas e processos logísticos",
      type: "warning"
    },
    {
      icon: <Repeat className="h-4 w-4 text-pink-500" />,
      text: "Oportunidade: Clientes que compram produtos da categoria 'Casa' têm 60% mais chances de retornar em 15 dias",
      type: "success"
    },
    {
      icon: <DollarSign className="h-4 w-4 text-yellow-500" />,
      text: "Mih sugere: Implementar programa de cashback pode aumentar retenção em 28% com base em análise histórica",
      type: "ai"
    },
    {
      icon: <Zap className="h-4 w-4 text-cyan-500" />,
      text: "Análise competitiva: Seus preços estão em média 12% acima do mercado em 5 categorias principais",
      type: "warning"
    },
    {
      icon: <LineChart className="h-4 w-4 text-violet-500" />,
      text: "Previsão: Com base nos dados atuais, podemos atingir 115% da meta mensal otimizando o mix de produtos",
      type: "ai"
    }
  ];

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-purple-500" />
        <h3 className="font-semibold">Insights da Mih</h3>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors hover:scale-[1.02] transform duration-200
              ${insight.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : ''}
              ${insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300' : ''}
              ${insight.type === 'ai' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : ''}
            `}
          >
            {insight.icon}
            <p className="text-sm leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}