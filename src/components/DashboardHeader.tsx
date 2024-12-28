import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MainNav } from "./MainNav"
import { useNavigate } from "react-router-dom"

export function DashboardHeader() {
  const navigate = useNavigate()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-8">
          <h2 className="text-2xl font-bold">IntelliBiz</h2>
        </div>
        <MainNav />
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/login")}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}