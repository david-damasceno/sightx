
import { MetricCard } from "@/components/MetricCard"
import { Brain, TrendingUp, Users, ShoppingCart, LineChart, BarChart3, BarChart } from "lucide-react"

export function InsightsMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Vendas Previstas"
        value="R$ 125.000"
        change="+12.5%"
        icon={<TrendingUp className="h-6 w-6 text-emerald-500" />}
        className="hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-800 dark:to-emerald-900/10"
      />
      <MetricCard
        title="Clientes Ativos"
        value="1.234"
        change="+5.2%"
        icon={<Users className="h-6 w-6 text-blue-500" />}
        className="hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-blue-900/10"
      />
      <MetricCard
        title="Ticket Médio"
        value="R$ 350"
        change="+8.7%"
        icon={<BarChart className="h-6 w-6 text-purple-500" />}
        className="hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800 dark:to-purple-900/10"
      />
      <MetricCard
        title="Insights Gerados"
        value="28"
        change="+15"
        icon={<Brain className="h-6 w-6 text-indigo-500" />}
        className="hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-white to-indigo-50/50 dark:from-gray-800 dark:to-indigo-900/10"
      />
    </div>
  )
}
