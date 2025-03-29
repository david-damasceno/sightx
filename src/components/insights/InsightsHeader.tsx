
import { Brain } from "lucide-react"

export function InsightsHeader() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white/30 backdrop-blur-md border p-8 dark:bg-gray-800/30">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-3">
          <Brain className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Insights da Donna
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Análise inteligente dos dados da sua empresa para tomada de decisões estratégicas. 
          Acompanhe métricas em tempo real e receba recomendações personalizadas.
        </p>
      </div>
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
        <Brain className="w-full h-full text-purple-500" />
      </div>
    </div>
  )
}
