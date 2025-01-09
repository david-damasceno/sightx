import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Seller } from "@/types/dashboard";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesCardProps {
  seller: Seller;
  onClick: (seller: Seller) => void;
}

export function SalesCard({ seller, onClick }: SalesCardProps) {
  const getPerformanceColor = () => {
    switch (seller.performance) {
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
      onClick={() => onClick(seller)}
    >
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={seller.avatarUrl} alt={seller.name} />
          <AvatarFallback>{seller.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{seller.name}</h3>
          <p className="text-sm text-muted-foreground">{seller.region}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="font-bold">{seller.targetCompletion}%</span>
          </div>
          <p className="text-sm text-muted-foreground">
            R$ {seller.salesVolume.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
}