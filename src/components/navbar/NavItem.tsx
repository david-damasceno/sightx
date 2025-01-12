import { Link } from "react-router-dom"
import { LucideIcon } from "lucide-react"

interface NavItemProps {
  href: string
  icon: LucideIcon
  title: string
  isActive: boolean
}

export function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent ${
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className={`h-4 w-4 ${
        isActive 
          ? 'text-foreground' 
          : 'text-muted-foreground'
      }`} />
      <span>{title}</span>
    </Link>
  )
}