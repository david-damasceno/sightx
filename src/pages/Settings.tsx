import { DashboardHeader } from "@/components/DashboardHeader"
import { Card } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Settings configuration coming soon</p>
          </div>
        </Card>
      </main>
    </div>
  )
}