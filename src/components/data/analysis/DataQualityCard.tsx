
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { DataQualityMetrics } from "@/types/data-analysis"

interface DataQualityCardProps {
  metrics: DataQualityMetrics
}

export function DataQualityCard({ metrics }: DataQualityCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">Completude dos Dados</h4>
        <Progress value={metrics.completeness * 100} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {(metrics.completeness * 100).toFixed(1)}% dos campos preenchidos
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Unicidade</h4>
        <Progress value={metrics.uniqueness * 100} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {(metrics.uniqueness * 100).toFixed(1)}% de valores únicos
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Consistência</h4>
        <Progress value={metrics.consistency * 100} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {(metrics.consistency * 100).toFixed(1)}% de dados consistentes
        </p>
      </div>

      {metrics.issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Problemas Encontrados</h4>
          {metrics.issues.map((issue, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {issue.description} ({issue.rowCount} linhas afetadas)
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </Card>
  )
}
