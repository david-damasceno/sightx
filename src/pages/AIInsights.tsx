import { DashboardHeader } from "@/components/DashboardHeader"
import { Card } from "@/components/ui/card"
import { Brain } from "lucide-react"

export default function AIInsights() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h1 className="text-2xl font-bold">AI Insights</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">AI insights coming soon</p>
          </div>
        </Card>
      </main>
    </div>
  )
}