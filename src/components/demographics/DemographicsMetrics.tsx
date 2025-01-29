import { Card } from "@/components/ui/card"
import { MetricCard } from "@/components/MetricCard"
import { Users, Target, TrendingUp, Map } from "lucide-react"

export function DemographicsMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="População Total"
        value="1.2M"
        change="+5.2%"
        icon={<Users className="h-4 w-4 text-blue-500" />}
      />
      <MetricCard
        title="Idade Média"
        value="32 anos"
        change="-2.1%"
        icon={<Target className="h-4 w-4 text-green-500" />}
      />
      <MetricCard
        title="Renda Média"
        value="R$ 4.500"
        change="+8.3%"
        icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
      />
      <MetricCard
        title="Regiões Atendidas"
        value="12"
        change="+2"
        icon={<Map className="h-4 w-4 text-orange-500" />}
      />
    </div>
  )
}