import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  return (
    <header className="flex items-center justify-between p-6 border-b animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back to your business overview
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}