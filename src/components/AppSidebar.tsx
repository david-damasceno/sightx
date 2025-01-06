import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"

const menuItems = [
  {
    title: "Painel",
    href: "/",
    icon: Home,
    description: "Visão geral do sistema"
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
    description: "Análises com IA"
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare,
    description: "Feedback dos usuários"
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
    description: "Configurações do sistema"
  }
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SightX
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
                  tooltip={item.description}
                  className="group relative flex items-center gap-3 p-3 transition-all duration-300 ease-in-out hover:bg-accent rounded-lg"
                >
                  <a href={item.href} className="flex items-center gap-3 w-full">
                    <Icon className={`h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`} />
                    <span className={`font-medium transition-colors duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                    }`}>
                      {item.title}
                    </span>
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