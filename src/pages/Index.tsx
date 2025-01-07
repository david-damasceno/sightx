import { InsightsPanel } from "@/components/InsightsPanel";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { StockChart } from "@/components/dashboard/StockChart";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { HourlyChart } from "@/components/dashboard/HourlyChart";
import { CustomerChart } from "@/components/dashboard/CustomerChart";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <MetricsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SalesChart />
          <InsightsPanel />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart />
          <CategoryChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HourlyChart />
          <CustomerChart />
        </div>
      </main>
    </div>
  );
}