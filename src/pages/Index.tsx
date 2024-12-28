import { DashboardHeader } from "@/components/DashboardHeader";
import { MetricCard } from "@/components/MetricCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { 
  BarChart as BarChartIcon, 
  Users, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";

const revenueData = [
  { name: 'Jan', value: 35000 },
  { name: 'Feb', value: 38000 },
  { name: 'Mar', value: 42000 },
  { name: 'Apr', value: 45231 },
  { name: 'May', value: 48000 },
  { name: 'Jun', value: 52000 },
];

const socialEngagementData = [
  { name: 'Mon', instagram: 2400, facebook: 1800, twitter: 1200 },
  { name: 'Tue', instagram: 3200, facebook: 2100, twitter: 1600 },
  { name: 'Wed', instagram: 2800, facebook: 1900, twitter: 1400 },
  { name: 'Thu', instagram: 3600, facebook: 2400, twitter: 1800 },
  { name: 'Fri', instagram: 3100, facebook: 2200, twitter: 1500 },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Revenue"
            value="$45,231"
            change="+20.1%"
            icon={<DollarSign className="h-4 w-4 text-green-500" />}
          />
          <MetricCard
            title="Active Users"
            value="2,420"
            change="+15.1%"
            icon={<Users className="h-4 w-4 text-blue-500" />}
          />
          <MetricCard
            title="Conversion Rate"
            value="3.8%"
            change="+4.1%"
            icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          />
          <MetricCard
            title="Avg. Order Value"
            value="$235"
            change="+10.3%"
            icon={<ShoppingCart className="h-4 w-4 text-orange-500" />}
          />
        </div>

        {/* Charts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 p-6 glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Revenue Trend</h3>
              <div className="flex items-center text-sm text-green-500">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>12.5% from last month</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Smart Insights Panel */}
          <InsightsPanel />
        </div>

        {/* Social Media Engagement */}
        <Card className="p-6 glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Social Media Engagement</h3>
            <div className="flex items-center text-sm text-blue-500">
              <Star className="h-4 w-4 mr-1" />
              <span>High engagement today</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={socialEngagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="instagram" 
                stroke="#E1306C" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="facebook" 
                stroke="#4267B2" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="twitter" 
                stroke="#1DA1F2" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </div>
  );
}