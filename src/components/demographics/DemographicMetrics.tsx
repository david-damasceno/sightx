import { Card } from "@/components/ui/card"
import { MetricCard } from "@/components/MetricCard"
import { Users, GraduationCap, DollarSign, Building } from "lucide-react"

interface DemographicMetricsProps {
  totalPopulation: number
  averageIncome: number
  educationLevel: number
  customerCount: number
  isLoading?: boolean
}

export function DemographicMetrics({
  totalPopulation,
  averageIncome,
  educationLevel,
  customerCount,
  isLoading = false
}: DemographicMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="População Total"
        value={totalPopulation.toLocaleString()}
        icon={<Users className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Renda Média"
        value={`R$ ${averageIncome.toLocaleString()}`}
        icon={<DollarSign className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Nível Superior"
        value={`${educationLevel}%`}
        icon={<GraduationCap className="h-4 w-4" />}
        isLoading={isLoading}
      />
      <MetricCard
        title="Total de Clientes"
        value={customerCount.toLocaleString()}
        icon={<Building className="h-4 w-4" />}
        isLoading={isLoading}
      />
    </div>
  )
}