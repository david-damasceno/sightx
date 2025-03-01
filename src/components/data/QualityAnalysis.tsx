
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { DataQuality } from "@/types/data-imports"

interface QualityAnalysisProps {
  fileId: string
  onComplete: () => void
}

export function QualityAnalysis({ fileId, onComplete }: QualityAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [dataQuality, setDataQuality] = useState<DataQuality | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchQualityData = async () => {
      try {
        setLoading(true)
        
        // Buscar análise de qualidade existente
        const { data: importData, error: importError } = await supabase
          .from('data_imports')
          .select('data_quality')
          .eq('id', fileId)
          .single()
        
        if (importError) throw importError

        if (importData && importData.data_quality && 
            typeof importData.data_quality === 'object' && 
            Object.keys(importData.data_quality).length > 0) {
          // Já existe análise de qualidade
          setDataQuality(importData.data_quality as unknown as DataQuality)
        } else {
          // Não tem análise, iniciar nova
          await analyzeDataQuality()
        }
      } catch (error: any) {
        console.error('Erro ao buscar análise de qualidade:', error)
        toast({
          title: "Erro",
          description: "Não foi possível recuperar a análise de qualidade",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchQualityData()
  }, [fileId, toast])

  const analyzeDataQuality = async () => {
    try {
      setAnalyzing(true)
      toast({
        title: "Analisando dados",
        description: "Iniciando análise de qualidade dos dados...",
      })

      const { data, error } = await supabase.functions.invoke('analyze-data-quality', {
        body: { fileId }
      })

      if (error) throw error
      
      // Verifica se data é um objeto e tem a forma esperada
      if (data && typeof data === 'object') {
        const qualityData = data as DataQuality
        setDataQuality(qualityData)
        
        // Salvar resultados na tabela data_imports
        await supabase
          .from('data_imports')
          .update({
            data_quality: qualityData
          })
          .eq('id', fileId)
        
        toast({
          title: "Análise concluída",
          description: "A análise de qualidade dos dados foi concluída com sucesso",
        })
      } else {
        throw new Error('Formato de resposta inválido')
      }
    } catch (error: any) {
      console.error('Erro na análise de qualidade:', error)
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a qualidade dos dados",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading || analyzing) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <div className="text-center">
              <p className="text-lg font-medium">Analisando Qualidade dos Dados</p>
              <p className="text-muted-foreground">
                {analyzing ? "Executando análises avançadas..." : "Carregando análises existentes..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!dataQuality) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma Análise Disponível</p>
              <p className="text-muted-foreground">
                Não foi possível recuperar ou gerar análises de qualidade para este arquivo.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Obter colunas com problemas
  const columnsWithIssues = Object.entries(dataQuality.columnQuality || {})
    .filter(([_, metrics]) => metrics.issues && metrics.issues.length > 0)
    .sort((a, b) => {
      // Ordenar por completude (menor primeiro)
      return (a[1].completeness || 0) - (b[1].completeness || 0)
    })

  // Obter colunas de melhor qualidade
  const bestColumns = Object.entries(dataQuality.columnQuality || {})
    .filter(([_, metrics]) => (!metrics.issues || metrics.issues.length === 0) && 
                             (metrics.completeness || 0) > 0.9 && 
                             (metrics.uniqueness || 0) > 0.1)
    .sort((a, b) => {
      // Ordenar por completude (maior primeiro)
      return (b[1].completeness || 0) - (a[1].completeness || 0)
    })

  return (
    <Card className="shadow-md border border-border/40">
      <CardHeader>
        <CardTitle>Análise de Qualidade dos Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="columns">Colunas</TabsTrigger>
            <TabsTrigger value="issues">Problemas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completude Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {Math.round((dataQuality.overallCompleteness || 0) * 100)}%
                      </span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={(dataQuality.overallCompleteness || 0) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Porcentagem de dados preenchidos em todas as colunas
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Qualidade Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {Math.round((dataQuality.overallQuality || 0) * 100)}%
                      </span>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={(dataQuality.overallQuality || 0) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Índice geral de qualidade baseado em múltiplos fatores
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Problemas Encontrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {dataQuality.issuesCount || 0}
                      </span>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Total de problemas identificados nos dados
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Colunas com Problemas
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  {columnsWithIssues.length > 0 ? (
                    <ul className="space-y-2">
                      {columnsWithIssues.slice(0, 5).map(([colName, metrics]) => (
                        <li key={colName} className="flex items-start justify-between p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{colName}</p>
                            <p className="text-xs text-muted-foreground">
                              {metrics.issues && metrics.issues.length > 0 ? 
                                metrics.issues[0] : 'Problemas de qualidade'}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                              {Math.round((metrics.completeness || 0) * 100)}% Completo
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span>Nenhum problema grave encontrado</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Melhores Colunas
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  {bestColumns.length > 0 ? (
                    <ul className="space-y-2">
                      {bestColumns.slice(0, 5).map(([colName, metrics]) => (
                        <li key={colName} className="flex items-start justify-between p-2 border rounded-md">
                          <div>
                            <p className="font-medium">{colName}</p>
                            <p className="text-xs text-muted-foreground">
                              Alta qualidade
                            </p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                              {Math.round((metrics.completeness || 0) * 100)}% Completo
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Nenhuma coluna com alta qualidade identificada</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="columns" className="pt-4">
            <div className="grid grid-cols-1 gap-4">
              {Object.entries(dataQuality.columnQuality || {}).map(([colName, metrics]) => (
                <Card key={colName}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="mb-2 md:mb-0">
                        <h3 className="font-medium">{colName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {metrics.issues && metrics.issues.length > 0 
                            ? `${metrics.issues.length} problema(s) encontrado(s)` 
                            : 'Sem problemas detectados'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">Completude</span>
                          <span className={`text-sm font-medium ${(metrics.completeness || 0) > 0.7 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.round((metrics.completeness || 0) * 100)}%
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-muted-foreground">Unicidade</span>
                          <span className="text-sm font-medium">
                            {Math.round((metrics.uniqueness || 0) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {metrics.issues && metrics.issues.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="text-xs font-medium mb-1">Problemas:</h4>
                        <ul className="text-xs text-muted-foreground">
                          {metrics.issues.map((issue, i) => (
                            <li key={i} className="flex items-start mt-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-500 mr-1 mt-0.5" />
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="issues" className="pt-4">
            {(dataQuality.issuesCount || 0) > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Resumo dos Problemas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Foram encontrados {dataQuality.issuesCount} problemas em seus dados.
                      Abaixo estão os principais pontos que precisam de atenção:
                    </p>
                    
                    <div className="mt-4 space-y-3">
                      {Object.entries(dataQuality.columnQuality || {})
                        .filter(([_, metrics]) => metrics.issues && metrics.issues.length > 0)
                        .map(([colName, metrics]) => (
                          <div key={colName} className="border rounded-md p-3">
                            <h3 className="font-medium text-sm flex items-center">
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                              Coluna: {colName}
                            </h3>
                            <ul className="mt-2 space-y-1 text-sm">
                              {metrics.issues && metrics.issues.map((issue, i) => (
                                <li key={i} className="text-muted-foreground">• {issue}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">
                          Verifique os valores ausentes nas colunas com baixa completude
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">
                          Corrija os formatos inconsistentes nas colunas indicadas
                        </span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                        <span className="text-sm">
                          Verifique valores extremos que parecem ser erros de entrada
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-medium">Parabéns!</h3>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Não foram encontrados problemas significativos nos seus dados.
                  Os dados parecem estar completos e com boa qualidade.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
