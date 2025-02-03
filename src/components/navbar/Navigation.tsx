import { useLocation } from "react-router-dom"
import { Home, Share2, Users, Brain, MessageSquare, FileText, DollarSign, TrendingUp, Database } from "lucide-react"
import { NavItem } from "./NavItem"

const menuItems = [
  {
    title: "Painel",
    href: "/",
    icon: Home
  },
  {
    title: "Vendas",
    href: "/sales",
    icon: DollarSign
  },
  {
    title: "Desempenho",
    href: "/performance",
    icon: TrendingUp
  },
  {
    title: "Redes Sociais",
    href: "/social",
    icon: Share2
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
    title: "NPS",
    href: "/feedback",
    icon: MessageSquare
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText
  },
  {
    title: "Dados",
    href: "/reports/data-context",
    icon: Database
  }
]

export function Navigation() {
  const location = useLocation()
  
  return (
    <div className="hidden md:flex items-center space-x-1">
      {menuItems.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          title={item.title}
          isActive={location.pathname === item.href}
        />
      ))}
    </div>
  )
}