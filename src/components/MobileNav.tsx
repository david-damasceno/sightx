
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Home, 
  Share2, 
  Users, 
  Brain, 
  MessageSquare, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Database,
  Settings,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./navbar/Logo";

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
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings
  }
];

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("/");

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  return (
    <>
      {/* Menu de navegação bottom bar para telas pequenas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <nav className="grid grid-cols-5 h-16">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-xs font-medium transition-colors",
                activeItem === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Menu de navegação lateral por slide */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden fixed top-4 right-4 z-50 bg-background/60 backdrop-blur-md border border-border hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Logo />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fechar</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <div className="space-y-1 px-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                      activeItem === item.href
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                SightX - Transforme Dados em Decisões Inteligentes
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
