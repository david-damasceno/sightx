import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export function InsightsPanel() {
  const insights = [
    "Revenue increased by 15% compared to last month",
    "Customer engagement is up 23% this week",
    "New user signups trending higher than usual",
  ];

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">Smart Insights</h3>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm text-muted-foreground">{insight}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}