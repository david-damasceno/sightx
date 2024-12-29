import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import {
  Settings, Users, Link as LinkIcon, FileText, Bell, 
  MapPin, Brain, Shield, HelpCircle, Globe
} from "lucide-react"

const settingsMenuItems = [
  {
    title: "General Settings",
    href: "/settings/general",
    icon: Settings,
    description: "System preferences, language, and appearance"
  },
  {
    title: "Users & Permissions",
    href: "/settings/users",
    icon: Users,
    description: "Manage users, roles, and access control"
  },
  {
    title: "Integrations",
    href: "/settings/integrations",
    icon: LinkIcon,
    description: "Connect with external platforms and services"
  },
  {
    title: "Reports",
    href: "/settings/reports",
    icon: FileText,
    description: "Customize reports and export preferences"
  },
  {
    title: "Alerts",
    href: "/settings/alerts",
    icon: Bell,
    description: "Configure notifications and alert rules"
  },
  {
    title: "Locations",
    href: "/settings/locations",
    icon: MapPin,
    description: "Manage business locations and geography settings"
  },
  {
    title: "AI Settings",
    href: "/settings/ai",
    icon: Brain,
    description: "Configure AI analysis and predictions"
  },
  {
    title: "Security",
    href: "/settings/security",
    icon: Shield,
    description: "Security settings and audit logs"
  },
  {
    title: "Support",
    href: "/settings/support",
    icon: HelpCircle,
    description: "Get help and access resources"
  },
  {
    title: "Localization",
    href: "/settings/localization",
    icon: Globe,
    description: "Language and regional settings"
  }
]

export function SettingsSidebar() {
  const location = useLocation()

  return (
    <nav className="w-64 space-y-2">
      {settingsMenuItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.href
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col space-y-1 rounded-lg px-3 py-2 transition-colors hover:bg-accent",
              isActive && "bg-accent"
            )}
          >
            <div className="flex items-center">
              <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.title}</span>
            </div>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {item.description}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}