
import { Brain, LightbulbIcon } from "lucide-react"

export function InsightsHeader() {
  return (
    <div className="relative overflow-hidden rounded-lg insights-header">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Insights da DONA
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Análise inteligente dos dados da sua empresa para tomada de decisões estratégicas. 
          Acompanhe métricas em tempo real e receba recomendações personalizadas.
        </p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-full text-sm border border-purple-100/20 dark:border-purple-900/20">
            <LightbulbIcon className="h-4 w-4 text-amber-500" />
            <span className="text-purple-800 dark:text-purple-200">Insights automáticos</span>
          </div>
          <div className="flex items-center gap-2 bg-white/40 dark:bg-gray-800/40 px-3 py-1.5 rounded-full text-sm border border-purple-100/20 dark:border-purple-900/20">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="text-purple-800 dark:text-purple-200">Análise de dados</span>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
        <Brain className="w-full h-full text-purple-500" />
      </div>
    </div>
  )
}
