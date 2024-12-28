import { Card } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Users, AlertCircle } from "lucide-react";

export function InsightsPanel() {
  const insights = [
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      text: "Revenue increased by 15% compared to last month, driven by new product launches",
      type: "success"
    },
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      text: "Customer engagement is up 23% this week across all social platforms",
      type: "info"
    },
    {
      icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
      text: "Inventory alert: 3 popular products are running low on stock",
      type: "warning"
    },
    {
      icon: <Lightbulb className="h-4 w-4 text-purple-500" />,
      text: "AI suggests targeting millennials based on recent engagement patterns",
      type: "tip"
    }
  ];

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">Smart Insights</h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 p-3 rounded-lg transition-colors
              ${insight.type === 'success' ? 'bg-green-50 text-green-700' : ''}
              ${insight.type === 'info' ? 'bg-blue-50 text-blue-700' : ''}
              ${insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : ''}
              ${insight.type === 'tip' ? 'bg-purple-50 text-purple-700' : ''}
            `}
          >
            {insight.icon}
            <p className="text-sm">{insight.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}