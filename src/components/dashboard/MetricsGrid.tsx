import { DollarSign, ShoppingCart, Percent, Package, Users, Repeat, ShoppingBag, Target } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

export function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Vendas do Mês"
        value="R$ 202.000"
        change="+12.5%"
        icon={<DollarSign className="h-4 w-4 text-green-500" />}
      />
      <MetricCard
        title="Ticket Médio"
        value="R$ 350"
        change="+8.3%"
        icon={<ShoppingCart className="h-4 w-4 text-blue-500" />}
      />
      <MetricCard
        title="Taxa de Conversão"
        value="4.8%"
        change="+1.2%"
        icon={<Percent className="h-4 w-4 text-purple-500" />}
      />
      <MetricCard
        title="Produtos em Baixa"
        value="5"
        change="-2"
        icon={<Package className="h-4 w-4 text-orange-500" />}
      />
      <MetricCard
        title="Clientes Ativos"
        value="1.250"
        change="+15%"
        icon={<Users className="h-4 w-4 text-indigo-500" />}
      />
      <MetricCard
        title="Taxa de Recompra"
        value="70%"
        change="+5%"
        icon={<Repeat className="h-4 w-4 text-teal-500" />}
      />
      <MetricCard
        title="Produtos Vendidos"
        value="856"
        change="+23%"
        icon={<ShoppingBag className="h-4 w-4 text-pink-500" />}
      />
      <MetricCard
        title="Meta Mensal"
        value="89%"
        change="+4%"
        icon={<Target className="h-4 w-4 text-yellow-500" />}
      />
    </div>
  );
}