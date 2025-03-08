
import { Card } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [currentPath, setCurrentPath] = useState("");

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
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="mr-1">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-xl md:text-2xl font-bold">
            {isMobile && currentPath !== "general" ? pathToTitle[currentPath] || "Configurações" : "Configurações"}
          </h1>
        </div>

        {isMobile && (
          <div className="mb-4">
            <Select value={currentPath} onValueChange={handleMobileNavChange}>
              <SelectTrigger className="w-full">
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
          <Card className="flex-1 p-3 md:p-6">
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
