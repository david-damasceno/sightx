
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTitle, Chart, Line, Bar, Area, Pie } from "@/components/ui/chart"
import { Loader2, BarChart, PieChart, LineChart, LayoutDashboard, Sparkles, Share, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { DataImport, DataAnalysis, DataVisualization } from "@/types/data-imports"

interface VisualizationBuilderProps {
  fileId: string | null
  onComplete: () => void
}

export function VisualizationBuilder({ fileId, onComplete }: VisualizationBuilderProps) {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [fileInfo, setFileInfo] = useState<DataImport | null>(null)
  const [analyses, setAnalyses] = useState<DataAnalysis[]>([])
  const [visualizations, setVisualizations] = useState<DataVisualization[]>([])
  const [activeTab, setActiveTab] = useState('suggested')
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

        // Buscar análises existentes
        const { data: analysesData, error: analysesError } = await supabase
          .from('data_analyses')
          .select('*')
          .eq('import_id', fileId)
          .order('created_at', { ascending: false })

        if (analysesError) throw analysesError
        setAnalyses(analysesData || [])

        // Buscar visualizações existentes
        const { data: visData, error: visError } = await supabase
          .from('data_visualizations')
          .select('*')
          .eq('analysis_id', analysesData?.[0]?.id || '')
          .order('created_at', { ascending: false })

        if (visError && analysesData?.[0]?.id) throw visError
        setVisualizations(visData || [])
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados de visualização",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fileId, currentOrganization, toast])

  const generateVisualizations = async () => {
    if (!fileId || !fileInfo) return

    try {
      setAnalyzing(true)
      
      const { data, error } = await supabase.functions.invoke('generate-visualizations', {
        body: { 
          fileId,
          tableName: fileInfo.table_name,
          organizationId: currentOrganization?.id
        }
      })

      if (error) throw error

      // Recarregar visualizações após a geração
      const { data: analysesData } = await supabase
        .from('data_analyses')
        .select('*')
        .eq('import_id', fileId)
        .order('created_at', { ascending: false })

      if (analysesData && analysesData.length > 0) {
        setAnalyses(analysesData)
        
        const { data: visData } = await supabase
          .from('data_visualizations')
          .select('*')
          .eq('analysis_id', analysesData[0].id)
          .order('created_at', { ascending: false })
          
        setVisualizations(visData || [])
      }

      toast({
        title: "Visualizações geradas",
        description: "As visualizações foram geradas com sucesso baseadas na análise dos dados"
      })
    } catch (error: any) {
      console.error('Erro na geração:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar as visualizações",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const renderVisualization = (visualization: DataVisualization) => {
    const config = visualization.configuration
    
    if (!config || !config.type) {
      return (
        <div className="flex items-center justify-center h-72 bg-muted/20 rounded-md">
          <p className="text-muted-foreground">Configuração inválida</p>
        </div>
      )
    }
    
    switch (config.type) {
      case 'bar':
        return (
          <ChartContainer className="h-72">
            <ChartTitle>{config.title}</ChartTitle>
            <Chart>
              <Bar 
                data={config.data}
                dataKey={config.dataKey}
                fill={config.color || "#7c3aed"}
                name={config.name}
              />
            </Chart>
          </ChartContainer>
        )
        
      case 'line':
        return (
          <ChartContainer className="h-72">
            <ChartTitle>{config.title}</ChartTitle>
            <Chart>
              <Line 
                data={config.data} 
                dataKey={config.dataKey}
                stroke={config.color || "#0ea5e9"}
                name={config.name}
              />
            </Chart>
          </ChartContainer>
        )
        
      case 'area':
        return (
          <ChartContainer className="h-72">
            <ChartTitle>{config.title}</ChartTitle>
            <Chart>
              <Area 
                data={config.data} 
                dataKey={config.dataKey}
                fill={config.color || "#10b981"}
                stroke={config.color || "#10b981"}
                name={config.name}
              />
            </Chart>
          </ChartContainer>
        )
        
      case 'pie':
        return (
          <ChartContainer className="h-72">
            <ChartTitle>{config.title}</ChartTitle>
            <Chart>
              <Pie 
                data={config.data}
                dataKey={config.dataKey}
                nameKey={config.nameKey}
                fill={config.color || "#8b5cf6"}
                name={config.name}
              />
            </Chart>
          </ChartContainer>
        )
        
      default:
        return (
          <div className="flex items-center justify-center h-72 bg-muted/20 rounded-md">
            <p className="text-muted-foreground">Tipo de visualização não suportado</p>
          </div>
        )
    }
  }

  return (
    <Card className="shadow-md border border-border/40 bg-background">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <CardTitle>Visualização e Análise</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Carregando visualizações...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-md font-medium">Visualizações Disponíveis</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize os dados ou gere novas análises com IA
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={generateVisualizations}
                disabled={analyzing}
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {analyzing ? "Gerando..." : "Gerar Visualizações com IA"}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="suggested" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Sugeridos</span>
                  {visualizations.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {visualizations.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="bar" className="gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Barras</span>
                </TabsTrigger>
                <TabsTrigger value="line" className="gap-1">
                  <LineChart className="h-4 w-4" />
                  <span>Linhas</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="suggested" className="space-y-4 mt-2">
                {visualizations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center border rounded-md p-10 gap-2">
                    <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Nenhuma visualização disponível
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Clique em "Gerar Visualizações com IA" para criar visualizações automáticas baseadas nos seus dados
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visualizations.map(visualization => (
                      <Card key={visualization.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {renderVisualization(visualization)}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center">
                          <p className="text-xs font-medium">
                            {visualization.configuration?.description || visualization.type}
                          </p>
                          <Button variant="ghost" size="icon">
                            <Share className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bar" className="space-y-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visualizations
                    .filter(v => v.configuration?.type === 'bar')
                    .map(visualization => (
                      <Card key={visualization.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {renderVisualization(visualization)}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center">
                          <p className="text-xs font-medium">
                            {visualization.configuration?.description || visualization.type}
                          </p>
                          <Button variant="ghost" size="icon">
                            <Share className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  
                  {visualizations.filter(v => v.configuration?.type === 'bar').length === 0 && (
                    <div className="flex flex-col items-center justify-center border rounded-md p-10 gap-2 col-span-2">
                      <BarChart className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum gráfico de barras disponível
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="line" className="space-y-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visualizations
                    .filter(v => v.configuration?.type === 'line')
                    .map(visualization => (
                      <Card key={visualization.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          {renderVisualization(visualization)}
                        </CardContent>
                        <CardFooter className="p-3 flex justify-between items-center">
                          <p className="text-xs font-medium">
                            {visualization.configuration?.description || visualization.type}
                          </p>
                          <Button variant="ghost" size="icon">
                            <Share className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  
                  {visualizations.filter(v => v.configuration?.type === 'line').length === 0 && (
                    <div className="flex flex-col items-center justify-center border rounded-md p-10 gap-2 col-span-2">
                      <LineChart className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nenhum gráfico de linha disponível
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
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
          onClick={onComplete} 
          disabled={loading}
          className="gap-1"
        >
          Concluir Importação
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
