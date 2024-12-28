import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { BarChart, Users, DollarSign, TrendingUp } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value="$45,231"
            change="+20.1%"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Users"
            value="2,420"
            change="+15.1%"
            icon={<Users className="h-4 w-4" />}
          />
          <MetricCard
            title="Conversion Rate"
            value="3.8%"
            change="+4.1%"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <MetricCard
            title="Avg. Order Value"
            value="$235"
            change="+10.3%"
            icon={<BarChart className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Chart component will go here in future iterations */}
            <div className="glass-card h-[400px] rounded-lg animate-in flex items-center justify-center">
              <p className="text-muted-foreground">Chart visualization coming soon</p>
            </div>
          </div>
          <InsightsPanel />
        </div>
      </main>
    </div>
  );
}