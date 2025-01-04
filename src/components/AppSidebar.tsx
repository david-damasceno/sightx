import { Home, Share2, MapPin, Users, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLocation, Link } from "react-router-dom"
import { useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    tooltip: "Dashboard"
  },
  {
    title: "Redes Sociais",
    href: "/social",
    icon: Share2,
    tooltip: "Redes Sociais"
  },
  {
    title: "Localização",
    href: "/location",
    icon: MapPin,
    tooltip: "Localização"
  },
  {
    title: "Demografia",
    href: "/demographics",
    icon: Users,
    tooltip: "Demografia"
  },
  {
    title: "IA Insights",
    href: "/ai-insights",
    icon: Brain,
    tooltip: "IA Insights"
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
    tooltip: "Feedback"
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
    tooltip: "Relatórios"
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    tooltip: "Configurações"
  }
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session && location.pathname !== '/login') {
        navigate('/login')
      }
    }
    checkSession()
  }, [location, navigate])

  if (location.pathname === '/login') {
    return null
  }

  return (
    <div className="h-screen bg-background border-r">
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">SightX</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.tooltip}
                >
                  <Link to={item.href} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </div>
  )
}