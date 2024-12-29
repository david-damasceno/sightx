import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

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

export function MainNav() {
  const location = useLocation()

  return (
    <nav className="flex items-center space-x-6">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary relative group",
              location.pathname === item.href
                ? "text-purple-600"
                : "text-muted-foreground"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline-block">{item.title}</span>
            {location.pathname === item.href && (
              <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-purple-600 animate-fade-in" />
            )}
            <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        )
      })}
    </nav>
  )
}