import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Employee } from "@/types/dashboard";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
}

export function PerformanceCard({ employee, onClick }: PerformanceCardProps) {
  const getTrendIcon = () => {
    switch (employee.trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPerformanceColor = () => {
    switch (employee.performance) {
      case "high":
        return "border-l-green-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-red-500";
    }
  };

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer hover:shadow-lg transition-all border-l-4",
        getPerformanceColor()
      )}
      onClick={() => onClick(employee)}
    >
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={employee.avatarUrl} alt={employee.name} />
          <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{employee.name}</h3>
          <p className="text-sm text-muted-foreground">{employee.department}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className="font-bold">{employee.score.toFixed(1)}</span>
            {getTrendIcon()}
          </div>
        </div>
      </div>
    </Card>
  );
}