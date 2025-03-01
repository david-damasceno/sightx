
import { Card, CardContent } from "@/components/ui/card"
import { DataQualityMetrics } from "@/types/data-analysis"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Check, Info, Shield, ShieldAlert, X } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface DataQualityCardProps {
  metrics: DataQualityMetrics
}

export function DataQualityCard({ metrics }: DataQualityCardProps) {
  const getQualityStatus = (value: number) => {
    if (value >= 0.9) return { status: "success", icon: <Check className="h-4 w-4" />, label: "Excelente", color: "bg-green-100 dark:bg-green-900/20" }
    if (value >= 0.7) return { status: "warning", icon: <AlertTriangle className="h-4 w-4" />, label: "Razoável", color: "bg-yellow-100 dark:bg-yellow-900/20" }
    return { status: "error", icon: <X className="h-4 w-4" />, label: "Insuficiente", color: "bg-red-100 dark:bg-red-900/20" }
  }

  const completenessStatus = getQualityStatus(metrics.completeness)
  const uniquenessStatus = getQualityStatus(metrics.uniqueness)
  const consistencyStatus = getQualityStatus(metrics.consistency)

  // Cálculo de pontuação geral de qualidade como média ponderada
  const overallQuality = (
    (metrics.completeness * 0.4) + 
    (metrics.uniqueness * 0.3) + 
    (metrics.consistency * 0.3)
  ).toFixed(2)

  const overallStatus = getQualityStatus(Number(overallQuality))

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Qualidade dos Dados</h3>
          </div>
          <Badge className="flex items-center gap-1.5" variant={
            overallStatus.status === "success" ? "default" : 
            overallStatus.status === "warning" ? "outline" : "destructive"
          }>
            {overallStatus.icon}
            <span>Score: {(Number(overallQuality) * 100).toFixed(0)}%</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={cn("p-4 rounded-lg", completenessStatus.color)}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Completude</h4>
              <Badge variant={completenessStatus.status === "success" ? "default" : completenessStatus.status === "warning" ? "outline" : "destructive"}>
                {(metrics.completeness * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.completeness * 100} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Dados sem valores ausentes</p>
          </div>

          <div className={cn("p-4 rounded-lg", uniquenessStatus.color)}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Unicidade</h4>
              <Badge variant={uniquenessStatus.status === "success" ? "default" : uniquenessStatus.status === "warning" ? "outline" : "destructive"}>
                {(metrics.uniqueness * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.uniqueness * 100} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Dados sem duplicações</p>
          </div>

          <div className={cn("p-4 rounded-lg", consistencyStatus.color)}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Consistência</h4>
              <Badge variant={consistencyStatus.status === "success" ? "default" : consistencyStatus.status === "warning" ? "outline" : "destructive"}>
                {(metrics.consistency * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={metrics.consistency * 100} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">Dados coerentes entre si</p>
          </div>
        </div>

        {metrics.issues.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-medium">Problemas Detectados</h4>
            </div>
            <ul className="space-y-2 text-sm">
              {metrics.issues.map((issue, index) => (
                <li key={index} className="flex items-start gap-2 p-2 rounded bg-muted/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{issue.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Afeta {issue.rowCount} registros • Tipo: {issue.type}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Análise baseada nos dados carregados</p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="cursor-help">
                  <Info className="h-3 w-3 mr-1" />
                  <span className="text-xs">Como melhorar?</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Dicas para melhorar a qualidade:</p>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    <li>Preencha valores ausentes</li>
                    <li>Remova duplicações desnecessárias</li>
                    <li>Padronize formatos dos dados</li>
                    <li>Valide valores fora do padrão</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}
