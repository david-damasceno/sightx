
import { MetricsGrid } from "@/components/dashboard/MetricsGrid"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { CustomerChart } from "@/components/dashboard/CustomerChart"
import { CategoryChart } from "@/components/dashboard/CategoryChart"
import { HourlyChart } from "@/components/dashboard/HourlyChart"
import { StockChart } from "@/components/dashboard/StockChart"
import { InsightsPanel } from "@/components/InsightsPanel"
import { IntegrationsPanel } from "@/components/integrations/IntegrationsPanel"

export default function Index() {
  return (
    <div className="container py-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho do seu negócio em tempo real com métricas e insights personalizados.
        </p>
      </div>
      
      <MetricsGrid />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesChart />
        <CustomerChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryChart />
        <HourlyChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockChart />
        <IntegrationsPanel />
      </div>

      <InsightsPanel />
    </div>
  )
}
