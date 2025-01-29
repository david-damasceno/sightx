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