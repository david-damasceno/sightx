import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"

export default function Location() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Location Data</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Location analytics coming soon</p>
          </div>
        </Card>
      </main>
    </div>
  )
}