import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, change, icon, className }: MetricCardProps) {
  const isPositive = change?.startsWith("+");

  return (
    <Card className={cn("glass-card p-6 animate-in hover:shadow-lg transition-all duration-200", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {change}
              <span className="text-xs">vs last period</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}