
import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  AlertTriangle, 
  Check, 
  Database, 
  FileSpreadsheet,
  Info,
  Shield, 
  ShieldAlert, 
  X, 
  BarChart, 
  LineChart
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface IntegrityStats {
  totalColumns: number
  analyzedColumns: number
  validationRules: number
  columnsWithIssues: number
  completeness: number
  accuracy: number
  consistency: number
  validityScore: number
  timelinessScore: number
}

interface DataIntegrityAnalysisProps {
  fileId: string
  stats?: IntegrityStats
}

export function DataIntegrityAnalysis({ fileId, stats }: DataIntegrityAnalysisProps) {
  // Dados de exemplo para demonstração
  const defaultStats: IntegrityStats = {
    totalColumns: 12,
    analyzedColumns: 12,
    validationRules: 8,
    columnsWithIssues: 3,
    completeness: 0.92,
    accuracy: 0.87,
    consistency: 0.95,
    validityScore: 0.89,
    timelinessScore: 1.0
  }

  const data = stats || defaultStats
  
  // Cálculo de pontuação geral como média ponderada
  const overallScore = (
    (data.completeness * 0.25) + 
    (data.accuracy * 0.25) + 
    (data.consistency * 0.2) +
    (data.validityScore * 0.2) +
    (data.timelinessScore * 0.1)
  )

  const getScoreStatus = (score: number) => {
    if (score >= 0.9) return { status: "success", label: "Excelente", icon: <Check className="h-4 w-4" />, color: "text-green-500" }
    if (score >= 0.7) return { status: "warning", label: "Razoável", icon: <AlertTriangle className="h-4 w-4" />, color: "text-yellow-500" }
    return { status: "error", label: "Insuficiente", icon: <X className="h-4 w-4" />, color: "text-red-500" }
  }

  const overallStatus = getScoreStatus(overallScore)
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Integridade dos Dados</CardTitle>
              <CardDescription>Análise completa da qualidade dos dados</CardDescription>
            </div>
          </div>
          <Badge 
            variant={
              overallStatus.status === "success" ? "default" :
              overallStatus.status === "warning" ? "secondary" : "destructive"
            }
            className="px-3 py-1.5 text-sm gap-1.5 flex items-center"
          >
            {overallStatus.icon}
            <span>Score: {(overallScore * 100).toFixed(0)}%</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resumo da Integridade */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Resumo da Integridade</span>
            </h3>
            
            <div className="bg-card rounded-lg shadow-sm p-4 border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Colunas Analisadas</p>
                  <p className="text-lg font-medium">{data.analyzedColumns}/{data.totalColumns}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Colunas com Problemas</p>
                  <p className="text-lg font-medium">
                    <span className={cn(
                      data.columnsWithIssues > 0 ? "text-yellow-500" : "text-green-500"
                    )}>
                      {data.columnsWithIssues}
                    </span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Regras de Validação</p>
                  <p className="text-lg font-medium">{data.validationRules}</p>
                </div>
                <div className="space-y-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left w-full">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>Pontuação Geral</span>
                            <Info className="h-3 w-3" />
                          </p>
                          <p className={cn("text-lg font-medium", overallStatus.color)}>
                            {(overallScore * 100).toFixed(0)}%
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Média ponderada de todas as métricas de qualidade</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4 border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-yellow-500" />
                <span>Problemas Comuns</span>
              </h4>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Valores ausentes em campos importantes</p>
                    <p className="text-xs text-muted-foreground">Encontrado em 3 colunas</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Inconsistências de formato</p>
                    <p className="text-xs text-muted-foreground">Datas em múltiplos formatos</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Valores atípicos (outliers)</p>
                    <p className="text-xs text-muted-foreground">Encontrados em 2 colunas numéricas</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Métricas Detalhadas */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              <span>Métricas Detalhadas</span>
            </h3>
            
            <div className="space-y-5 bg-card rounded-lg shadow-sm p-4 border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Completude</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Porcentagem de valores não ausentes nos dados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge variant={getScoreStatus(data.completeness).status === "success" ? "default" : getScoreStatus(data.completeness).status === "warning" ? "outline" : "destructive"}>
                    {(data.completeness * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={data.completeness * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Acurácia</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Precisão e exatidão dos valores registrados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge variant={getScoreStatus(data.accuracy).status === "success" ? "default" : getScoreStatus(data.accuracy).status === "warning" ? "outline" : "destructive"}>
                    {(data.accuracy * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={data.accuracy * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Consistência</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Uniformidade e coerência entre valores relacionados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge variant={getScoreStatus(data.consistency).status === "success" ? "default" : getScoreStatus(data.consistency).status === "warning" ? "outline" : "destructive"}>
                    {(data.consistency * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={data.consistency * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Validade</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Conformidade com regras de negócio e formatos esperados</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge variant={getScoreStatus(data.validityScore).status === "success" ? "default" : getScoreStatus(data.validityScore).status === "warning" ? "outline" : "destructive"}>
                    {(data.validityScore * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={data.validityScore * 100} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Atualidade</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Frescor dos dados em relação ao tempo esperado</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Badge variant={getScoreStatus(data.timelinessScore).status === "success" ? "default" : getScoreStatus(data.timelinessScore).status === "warning" ? "outline" : "destructive"}>
                    {(data.timelinessScore * 100).toFixed(0)}%
                  </Badge>
                </div>
                <Progress value={data.timelinessScore * 100} className="h-2" />
              </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-sm p-4 border">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-primary" />
                <span>Recomendações</span>
              </h4>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Padronizar formatos de dados entre as colunas</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Preencher dados ausentes nas colunas principais</p>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <p>Validar e corrigir valores extremos identificados</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          <span>Análise gerada com base nos dados carregados</span>
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exportar Relatório</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
