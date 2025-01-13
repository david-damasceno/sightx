import { Card } from "@/components/ui/card"
import { Star, Users, BarChart3 } from "lucide-react"

interface NPSMetricsCardProps {
  npsScore: number
  totalResponses: number
  responseRate: number
}

export function NPSMetricsCard({ npsScore, totalResponses, responseRate }: NPSMetricsCardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-4 glass-card">
        <div className="flex items-center gap-2 text-green-500">
          <Star className="h-5 w-5" />
          <div>
            <p className="text-sm text-muted-foreground">NPS Médio</p>
            <p className="text-2xl font-bold">{npsScore}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 glass-card">
        <div className="flex items-center gap-2 text-blue-500">
          <Users className="h-5 w-5" />
          <div>
            <p className="text-sm text-muted-foreground">Total de Respostas</p>
            <p className="text-2xl font-bold">{totalResponses}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 glass-card">
        <div className="flex items-center gap-2 text-purple-500">
          <BarChart3 className="h-5 w-5" />
          <div>
            <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
            <p className="text-2xl font-bold">{responseRate}%</p>
          </div>
        </div>
      </Card>
    </div>
  )
}