import { Bell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"

export function DashboardHeader() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Logout realizado com sucesso",
        duration: 2000,
      })
      
      navigate("/login", { replace: true })
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: "Erro ao fazer logout",
        description: "Por favor, tente novamente",
        variant: "destructive",
      })
    }
  }

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50 w-full animate-in">
      <div className="flex h-16 items-center px-6 gap-6">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <h2 
            className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate("/")}
          >
            IntelliBiz
          </h2>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            className="relative hover:bg-purple-50 transition-colors"
          >
            <Bell className="h-4 w-4 text-purple-600" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="hover:bg-purple-50 transition-colors"
          >
            <LogOut className="h-4 w-4 text-purple-600" />
          </Button>
        </div>
      </div>
    </header>
  )
}