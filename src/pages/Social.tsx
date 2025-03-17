
import { Card } from "@/components/ui/card"
import { Share2 } from "lucide-react"

export default function Social() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Análise de Redes Sociais</h1>
        </div>
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-center h-[300px] md:h-[400px]">
            <p className="text-muted-foreground text-center">
              Análise de redes sociais estará disponível em breve
            </p>
          </div>
        </Card>
      </main>
    </div>
  )
}
