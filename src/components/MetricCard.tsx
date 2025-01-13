import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  icon, 
  className,
  isLoading = false 
}: MetricCardProps) {
  const isPositive = change?.startsWith("+");

  if (isLoading) {
    return (
      <Card className={cn(
        "glass-card p-6 animate-in",
        className
      )}>
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "glass-card p-6 animate-in hover:shadow-lg transition-all duration-200",
      "border-l-4",
      isPositive ? "border-l-green-500" : change ? "border-l-red-500" : "border-l-blue-500",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
          {change && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {change}
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}