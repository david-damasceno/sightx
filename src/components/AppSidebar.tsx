import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Painel",
    href: "/",
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
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
                  tooltip={item.title}
                >
                  <Link 
                    to={item.href} 
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950 ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-medium shadow-sm' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                    <span className="font-medium">{item.title}</span>
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