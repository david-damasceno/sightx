import { Card } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"
import { SettingsSidebar } from "@/components/settings/SettingsSidebar"
import { Routes, Route, Navigate } from "react-router-dom"
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

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <div className="flex gap-6">
          <SettingsSidebar />
          <Card className="flex-1 p-6">
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