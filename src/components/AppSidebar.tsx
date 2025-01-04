import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLocation, Link } from "react-router-dom"
import { useSidebar } from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Redes Sociais",
    href: "/social",
    icon: Share2
  },
  {
    title: "Localização",
    href: "/location",
    icon: MapPin
  },
  {
    title: "Demografia",
    href: "/demographics",
    icon: Users
  },
  {
    title: "IA Insights",
    href: "/ai-insights",
    icon: Brain
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings
  }
]

export function AppSidebar() {
  const location = useLocation()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Não mostrar a sidebar na página de login
  if (location.pathname === "/login") {
    return null
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">
          {!isCollapsed ? "SightX" : "SX"}
        </h2>
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
                  tooltip={isCollapsed ? item.title : undefined}
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
    </Sidebar>
  )
}