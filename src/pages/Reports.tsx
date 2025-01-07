import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function Reports() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Reports</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Reports generation coming soon</p>
          </div>
        </Card>
      </main>
    </div>
  )
}