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
  return (
    <Card className={cn("glass-card p-6 animate-in", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {change && (
            <p className={cn("text-sm mt-1", 
              change.startsWith("+") ? "text-green-600" : "text-red-600"
            )}>
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </Card>
  );
}