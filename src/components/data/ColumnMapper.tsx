
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Column {
  name: string
  type: string
  sample: any
}

interface ColumnMapperProps {
  fileId: string
  columns: Column[]
  onMappingComplete: () => void
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error'
  tableName?: string
  errorMessage?: string
}

export function ColumnMapper({
  fileId,
  columns,
  onMappingComplete,
  processingStatus = 'pending',
  tableName,
  errorMessage
}: ColumnMapperProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (processingStatus === 'completed') {
      onMappingComplete()
    }
  }, [processingStatus, onMappingComplete])

  if (loading || processingStatus === 'processing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processando dados</CardTitle>
          <CardDescription>
            Aguarde enquanto processamos seus dados...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            Isso pode levar alguns minutos dependendo do tamanho do arquivo
          </p>
        </CardContent>
      </Card>
    )
  }

  if (processingStatus === 'error') {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Erro no processamento</CardTitle>
          <CardDescription>
            Ocorreu um erro durante o processamento dos dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {errorMessage || "Não foi possível processar os dados. Tente novamente."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (processingStatus === 'completed') {
    return (
      <Card className="border-success">
        <CardHeader>
          <CardTitle className="text-success">Processamento concluído</CardTitle>
          <CardDescription>
            Seus dados foram processados com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 space-y-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <p className="text-muted-foreground">
            Sua tabela {tableName} está pronta para uso
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure suas colunas</CardTitle>
        <CardDescription>
          Revise e ajuste as configurações das colunas antes de processar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{column.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Tipo: {column.type}
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                Exemplo: {String(column.sample)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
