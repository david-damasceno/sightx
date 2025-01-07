import { Card } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export default function Feedback() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Feedback</h1>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Feedback system coming soon</p>
          </div>
        </Card>
      </main>
    </div>
  )
}