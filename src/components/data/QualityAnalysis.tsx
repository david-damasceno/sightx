
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, Loader2, BarChart, AlertTriangle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnMetadata, DataImport, DataAnalysis } from "@/types/data-imports"

interface QualityAnalysisProps {
  fileId: string | null
  onNext: () => void
}

export function QualityAnalysis({ fileId, onNext }: QualityAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [fileInfo, setFileInfo] = useState<DataImport | null>(null)
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [analyses, setAnalyses] = useState<DataAnalysis[]>([])
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  useEffect(() => {
    if (!fileId || !currentOrganization) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar informações do arquivo
        const { data: fileData, error: fileError } = await supabase
          .from('data_imports')
          .select('*')
          .eq('id', fileId)
          .single()

        if (fileError) throw fileError
        setFileInfo(fileData)

        // Buscar metadados das colunas
        const { data: columnsData, error: columnsError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)

        if (columnsError) throw columnsError
        setColumns(columnsData || [])

        // Buscar análises existentes
        const { data: analysesData, error: analysesError } = await supabase
          .from('data_analyses')
          .select('*')
          .eq('import_id', fileId)
          .order('created_at', { ascending: false })

        if (analysesError) throw analysesError
        setAnalyses(analysesData || [])
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados de análise",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fileId, currentOrganization, toast])

  const runQualityAnalysis = async () => {
    if (!fileId || !fileInfo) return

    try {
      setAnalyzing(true)
      
      const { data, error } = await supabase.functions.invoke('analyze-data-quality', {
        body: { 
          fileId,
          tableName: fileInfo.table_name,
          organizationId: currentOrganization?.id
        }
      })

      if (error) throw error

      // Recarregar análises após a execução
      const { data: newAnalyses } = await supabase
        .from('data_analyses')
        .select('*')
        .eq('import_id', fileId)
        .order('created_at', { ascending: false })

      if (newAnalyses) {
        setAnalyses(newAnalyses)
      }

      toast({
        title: "Análise concluída",
        description: "A análise de qualidade dos dados foi concluída com sucesso"
      })
    } catch (error: any) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a análise de qualidade",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getQualityScore = (column: ColumnMetadata) => {
    const statistics = column.statistics || {};
    const completeness = statistics.completeness ? Number(statistics.completeness) * 100 : 0;
    const uniqueness = statistics.uniqueness ? Number(statistics.uniqueness) * 100 : 0;
    
    // Média simples como exemplo
    return (completeness + uniqueness) / 2;
  }

  const getQualityColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  }

  const getLatestAnalysis = () => {
    return analyses.length > 0 ? analyses[0] : null;
  }

  return (
    <Card className="shadow-md border border-border/40 bg-background">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          <CardTitle>Análise de Qualidade dos Dados</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Carregando dados de qualidade...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Qualidade por Coluna</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={runQualityAnalysis}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart className="h-4 w-4" />
                  )}
                  {analyzing ? "Analisando..." : "Executar Análise"}
                </Button>
              </div>

              {analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center border rounded-md p-6 gap-2">
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma análise de qualidade foi executada ainda
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique em "Executar Análise" para avaliar a qualidade dos dados
                  </p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Coluna</TableHead>
                        <TableHead>Completude</TableHead>
                        <TableHead>Unicidade</TableHead>
                        <TableHead className="w-[120px]">Score Geral</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columns.map(column => {
                        const quality = getQualityScore(column);
                        return (
                          <TableRow key={column.id}>
                            <TableCell className="font-medium">
                              {column.display_name || column.original_name}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={column.statistics?.completeness ? Number(column.statistics.completeness) * 100 : 0} 
                                  className="h-2"
                                />
                                <span className="text-xs w-10">
                                  {column.statistics?.completeness ? 
                                    `${Math.round(Number(column.statistics.completeness) * 100)}%` : '0%'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress 
                                  value={column.statistics?.uniqueness ? Number(column.statistics.uniqueness) * 100 : 0} 
                                  className="h-2"
                                />
                                <span className="text-xs w-10">
                                  {column.statistics?.uniqueness ? 
                                    `${Math.round(Number(column.statistics.uniqueness) * 100)}%` : '0%'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className={getQualityColor(quality)}>
                              {Math.round(quality)}%
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {getLatestAnalysis() && (
              <div className="space-y-2">
                <h3 className="text-md font-medium">Resumo da Análise</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="font-medium text-sm">Completude Média</p>
                      <p className="text-2xl font-bold">
                        {getLatestAnalysis()?.results?.overallCompleteness ?
                          `${Math.round(Number(getLatestAnalysis()?.results?.overallCompleteness) * 100)}%` : '0%'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <BarChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="font-medium text-sm">Qualidade Geral</p>
                      <p className="text-2xl font-bold">
                        {getLatestAnalysis()?.results?.overallQuality ?
                          `${Math.round(Number(getLatestAnalysis()?.results?.overallQuality) * 100)}%` : '0%'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-background/50">
                    <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                      <div className="p-2 bg-yellow-100 rounded-full">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <p className="font-medium text-sm">Problemas Detectados</p>
                      <p className="text-2xl font-bold">
                        {getLatestAnalysis()?.results?.issuesCount || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0">
        <div>
          {fileInfo && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Tabela:</span> {fileInfo.table_name}
            </p>
          )}
        </div>
        <Button 
          onClick={onNext} 
          disabled={loading}
          className="gap-1"
        >
          Prosseguir para Visualizações
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
