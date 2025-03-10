
import { Card } from "@/components/ui/card"
import { Settings as SettingsIcon, ChevronLeft, Menu, X } from "lucide-react"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { UsersSettings } from "@/components/settings/UsersSettings"
import { MembersSettings } from "@/components/settings/MembersSettings"
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings"
import { ReportsSettings } from "@/components/settings/ReportsSettings"
import { AlertsSettings } from "@/components/settings/AlertsSettings"
import { LocationsSettings } from "@/components/settings/LocationsSettings"
import { AISettings } from "@/components/settings/AISettings"
import { SecuritySettings } from "@/components/settings/SecuritySettings"
import { SupportSettings } from "@/components/settings/SupportSettings"
import { LocalizationSettings } from "@/components/settings/LocalizationSettings"
import { useState, useEffect } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet"

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [currentPath, setCurrentPath] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Extrair o caminho após /settings/
    const path = location.pathname.split("/settings/")[1] || "general";
    setCurrentPath(path);
  }, [location.pathname]);

  // Mapeamento de caminhos para títulos para o Select móvel
  const pathToTitle: Record<string, string> = {
    "general": "Minha Conta",
    "users": "Usuários & Permissões",
    "members": "Organização",
    "integrations": "Integrações",
    "reports": "Relatórios",
    "alerts": "Alertas",
    "locations": "Localizações",
    "ai": "Configurações de IA",
    "security": "Segurança",
    "support": "Suporte",
    "localization": "Localização"
  };

  const handleMobileNavChange = (value: string) => {
    navigate(`/settings/${value}`);
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <main className="container py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <SettingsIcon className="h-5 w-5 mr-2" />
            <h1 className="text-xl md:text-2xl font-bold">
              {isMobile && currentPath !== "general" ? pathToTitle[currentPath] || "Configurações" : "Configurações"}
            </h1>
          </div>

          {isMobile && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-5 w-5" />
                      <h2 className="font-semibold">Configurações</h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-2">
                    <SettingsSidebar />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {isMobile && (
          <div className="mb-4">
            <Select value={currentPath} onValueChange={handleMobileNavChange}>
              <SelectTrigger className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[45vh] overflow-y-auto">
                {Object.entries(pathToTitle).map(([path, title]) => (
                  <SelectItem key={path} value={path}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {!isMobile && <SettingsSidebar />}
          <Card className={cn(
            "flex-1",
            isMobile ? "p-3 border-none shadow-sm" : "p-6"
          )}>
            <Routes>
              <Route path="/" element={<Navigate to="/settings/general" replace />} />
              <Route path="/general" element={<GeneralSettings />} />
              <Route path="/users" element={<UsersSettings />} />
              <Route path="/members" element={<MembersSettings />} />
              <Route path="/integrations" element={<IntegrationsSettings />} />
              <Route path="/reports" element={<ReportsSettings />} />
              <Route path="/alerts" element={<AlertsSettings />} />
              <Route path="/locations" element={<LocationsSettings />} />
              <Route path="/ai" element={<AISettings />} />
              <Route path="/security" element={<SecuritySettings />} />
              <Route path="/support" element={<SupportSettings />} />
              <Route path="/localization" element={<LocalizationSettings />} />
            </Routes>
          </Card>
        </div>
      </main>
    </div>
  )
}
