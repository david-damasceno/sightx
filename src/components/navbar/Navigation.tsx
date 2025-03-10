
import { useLocation } from "react-router-dom"
import { Home, Share2, Users, Brain, MessageSquare, FileText, DollarSign, TrendingUp } from "lucide-react"
import { NavItem } from "./NavItem"
import { useMobile } from "@/hooks/use-mobile"

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
  }
]

export function Navigation() {
  const location = useLocation()
  const isMobile = useMobile()
  
  // Filtra os itens mais importantes para a versão mobile
  const importantItems = isMobile 
    ? menuItems.filter(item => ["/", "/sales", "/ai-insights", "/reports"].includes(item.href))
    : menuItems
  
  return (
    <div className="hidden md:flex items-center space-x-1 overflow-x-auto">
      {importantItems.map((item) => (
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
