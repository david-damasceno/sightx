import { Home, BarChart2, Users, MapPin, Share2, Brain, MessageSquare, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home
  },
  {
    title: "Social Media",
    href: "/social",
    icon: Share2
  },
  {
    title: "Location Data",
    href: "/location",
    icon: MapPin
  },
  {
    title: "Demographics",
    href: "/demographics",
    icon: Users
  },
  {
    title: "AI Insights",
    href: "/ai-insights",
    icon: Brain
  },
  {
    title: "Feedback",
    href: "/feedback",
    icon: MessageSquare
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
]

export function MainNav() {
  const location = useLocation()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center text-sm font-medium transition-colors hover:text-primary",
              location.pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline-block">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}