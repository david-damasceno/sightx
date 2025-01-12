import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"
import {
  Settings, Users, Link as LinkIcon, FileText, Bell, 
  MapPin, Brain, Shield, HelpCircle, Globe
} from "lucide-react"

const settingsMenuItems = [
  {
    title: "Minha Conta",
    href: "/settings/general",
    icon: Settings,
    description: "Preferências do sistema, idioma e aparência"
  },
  {
    title: "Usuários & Permissões",
    href: "/settings/users",
    icon: Users,
    description: "Gerenciar usuários, funções e controle de acesso"
  },
  {
    title: "Integrações",
    href: "/settings/integrations",
    icon: LinkIcon,
    description: "Conectar com plataformas e serviços externos"
  },
  {
    title: "Relatórios",
    href: "/settings/reports",
    icon: FileText,
    description: "Personalizar relatórios e preferências de exportação"
  },
  {
    title: "Alertas",
    href: "/settings/alerts",
    icon: Bell,
    description: "Configurar notificações e regras de alerta"
  },
  {
    title: "Localizações",
    href: "/settings/locations",
    icon: MapPin,
    description: "Gerenciar localizações e configurações geográficas"
  },
  {
    title: "Configurações de IA",
    href: "/settings/ai",
    icon: Brain,
    description: "Configurar análise e previsões de IA"
  },
  {
    title: "Segurança",
    href: "/settings/security",
    icon: Shield,
    description: "Configurações de segurança e logs de auditoria"
  },
  {
    title: "Suporte",
    href: "/settings/support",
    icon: HelpCircle,
    description: "Obter ajuda e acessar recursos"
  },
  {
    title: "Localização",
    href: "/settings/localization",
    icon: Globe,
    description: "Configurações de idioma e região"
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