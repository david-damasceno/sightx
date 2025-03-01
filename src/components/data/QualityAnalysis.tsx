
import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  FileWarning,
  BarChart3
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ColumnMetadata } from "@/types/data-import-flow"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface QualityAnalysisProps {
  fileId: string
  tableName: string
  onComplete: () => void
}

export function QualityAnalysis({ fileId, tableName, onComplete }: QualityAnalysisProps) {
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [overallQuality, setOverallQuality] = useState<{
    completeness: number;
    uniqueness: number;
  }>({ completeness: 0, uniqueness: 0 })
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar metadados das colunas
        const { data: columnsData, error: columnsError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)
        
        if (columnsError) throw columnsError
        
        // Buscar qualidade geral dos dados
        const { data: importData, error: importError } = await supabase
          .from('data_imports')
          .select('data_quality')
          .eq('id', fileId)
          .single()
        
        if (importError) throw importError
        
        setColumns(columnsData || [])
        
        if (importData?.data_quality) {
          setOverallQuality({
            completeness: importData.data_quality.completeness || 0,
            uniqueness: importData.data_quality.uniqueness || 0
          })
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados de qualidade:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os metadados de qualidade",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [fileId, toast])

  const analyzeQuality = async () => {
    try {
      setAnalyzing(true)
      
      // Chamar a função serverless para análise de qualidade
      const { error: analysisError } = await supabase.functions.invoke('analyze-data-quality', {
        body: { 
          fileId,
          tableName 
        }
      })
      
      if (analysisError) throw analysisError
      
      // Recarregar os dados atualizados
      const { data: updatedColumns, error: columnsError } = await supabase
        .from('column_metadata')
        .select('*')
        .eq('import_id', fileId)
      
      if (columnsError) throw columnsError
      
      // Buscar qualidade geral atualizada
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .select('data_quality')
        .eq('id', fileId)
        .single()
      
      if (importError) throw importError
      
      setColumns(updatedColumns || [])
      
      if (importData?.data_quality) {
        setOverallQuality({
          completeness: importData.data_quality.completeness || 0,
          uniqueness: importData.data_quality.uniqueness || 0
        })
      }
      
      toast({
        title: "Análise Completa",
        description: "A análise de qualidade dos dados foi concluída",
      })
    } catch (error: any) {
      console.error('Erro na análise de qualidade:', error)
      toast({
        title: "Erro",
        description: "Não foi possível realizar a análise de qualidade",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getQualityColor = (value: number) => {
    if (value >= 90) return "bg-green-500"
    if (value >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getQualityBadge = (value: number) => {
    if (value >= 90) return "success"
    if (value >= 70) return "warning"
    return "destructive"
  }

  if (loading) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando análise de qualidade...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <FileWarning className="h-5 w-5" />
              Análise de Qualidade dos Dados
            </CardTitle>
            <CardDescription>
              Verifique a qualidade e integridade dos dados importados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={analyzeQuality}
              disabled={analyzing}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              {analyzing ? "Analisando..." : "Analisar Qualidade"}
            </Button>
            <Button onClick={onComplete}>
              Continuar para Visualizações
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Completude dos Dados</CardTitle>
              <CardDescription>
                Porcentagem de dados não nulos na tabela
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {overallQuality.completeness.toFixed(1)}%
                  </span>
                  <Badge variant={getQualityBadge(overallQuality.completeness) as any}>
                    {overallQuality.completeness >= 90 ? "Excelente" : 
                     overallQuality.completeness >= 70 ? "Bom" : "Precisa Melhorar"}
                  </Badge>
                </div>
                <Progress 
                  value={overallQuality.completeness} 
                  className="h-2"
                  indicatorClassName={getQualityColor(overallQuality.completeness)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unicidade dos Dados</CardTitle>
              <CardDescription>
                Porcentagem de valores únicos nas colunas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {overallQuality.uniqueness.toFixed(1)}%
                  </span>
                  <Badge variant={getQualityBadge(overallQuality.uniqueness) as any}>
                    {overallQuality.uniqueness >= 90 ? "Excelente" : 
                     overallQuality.uniqueness >= 70 ? "Bom" : "Precisa Melhorar"}
                  </Badge>
                </div>
                <Progress 
                  value={overallQuality.uniqueness} 
                  className="h-2"
                  indicatorClassName={getQualityColor(overallQuality.uniqueness)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {!columns.some(col => col.statistics) && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Análise pendente</AlertTitle>
            <AlertDescription>
              Clique em "Analisar Qualidade" para verificar a integridade dos seus dados.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coluna</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Completude</TableHead>
                <TableHead>Unicidade</TableHead>
                <TableHead>Valores Nulos</TableHead>
                <TableHead>Valores Duplicados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column) => (
                <TableRow key={column.id}>
                  <TableCell className="font-medium">
                    {column.display_name || column.original_name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {column.data_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {column.statistics?.completeness !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={column.statistics.completeness} 
                          className="h-2 w-24"
                          indicatorClassName={getQualityColor(column.statistics.completeness)}
                        />
                        <span className="text-sm">
                          {column.statistics.completeness.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não analisado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {column.statistics?.uniqueness !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={column.statistics.uniqueness} 
                          className="h-2 w-24"
                          indicatorClassName={getQualityColor(column.statistics.uniqueness)}
                        />
                        <span className="text-sm">
                          {column.statistics.uniqueness.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não analisado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {column.statistics?.null_count !== undefined ? (
                      <span className="text-sm">
                        {column.statistics.null_count}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não analisado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {column.statistics?.duplicate_count !== undefined ? (
                      <span className="text-sm">
                        {column.statistics.duplicate_count}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não analisado</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="flex items-center gap-2">
          {overallQuality.completeness >= 70 && overallQuality.uniqueness >= 70 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Qualidade geral dos dados é boa
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                Alguns problemas de qualidade foram identificados
              </span>
            </>
          )}
        </div>
        <Button onClick={onComplete}>
          Continuar para Visualizações
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
