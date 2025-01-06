import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"

const menuItems = [
  {
    title: "Painel",
    href: "/",
    icon: Home,
    description: "Visão geral e métricas principais"
  },
  {
    title: "Redes Sociais",
    href: "/social",
    icon: Share2,
    description: "Gestão de mídias sociais"
  },
  {
    title: "Localização",
    href: "/location",
    icon: MapPin,
    description: "Análise geográfica"
  },
  {
    title: "Demografia",
    href: "/demographics",
    icon: Users,
    description: "Dados demográficos"
  },
  {
    title: "IA Insights",
    href: "/ai-insights",
    icon: Brain,
    description: "Análises com inteligência artificial"
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
    description: "Avaliações e comentários"
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
    description: "Relatórios e análises"
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Preferências do sistema"
  }
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          <span className="font-semibold text-lg">SightX</span>
        </div>
        <SidebarTrigger />
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
                  tooltip={item.description}
                >
                  <a 
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent"
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}