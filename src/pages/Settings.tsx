
import { Card } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { Routes, Route, Navigate, useLocation } from "react-router-dom"
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

export default function Settings() {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Extrair o caminho após /settings/
    const path = location.pathname.split("/settings/")[1] || "general";
    setCurrentPath(path);
  }, [location.pathname]);

  // Mapeamento de caminhos para títulos para o Select móvel
  const pathToTitle = {
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
    window.location.href = `/settings/${value}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Configurações</h1>
        </div>

        {isMobile && (
          <div className="mb-4">
            <Select value={currentPath} onValueChange={handleMobileNavChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(pathToTitle).map(([path, title]) => (
                  <SelectItem key={path} value={path}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {!isMobile && <SettingsSidebar />}
          <Card className="flex-1 p-4 md:p-6">
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
