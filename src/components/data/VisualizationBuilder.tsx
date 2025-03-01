
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BarChart, PieChart, LineChart, AreaChart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { DataAnalysis, ChartConfig, DataVisualization } from "@/types/data-imports"
import { AreaChart as RechartsAreaChart, BarChart as RechartsBarChart, LineChart as RechartsLineChart, PieChart as RechartsPieChart, 
  Area, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts'

interface VisualizationBuilderProps {
  fileId: string
  analysisId: string
}

export function VisualizationBuilder({ fileId, analysisId }: VisualizationBuilderProps) {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analysis, setAnalysis] = useState<DataAnalysis | null>(null)
  const [visualizations, setVisualizations] = useState<DataVisualization[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisDetails()
    }
  }, [analysisId])

  const fetchAnalysisDetails = async () => {
    try {
      setLoading(true)
      
      // Buscar detalhes da análise
      const { data: analysisData, error: analysisError } = await supabase
        .from('data_analyses')
        .select('*')
        .eq('id', analysisId)
        .single()

      if (analysisError) throw analysisError
      setAnalysis(analysisData)
      
      // Buscar visualizações existentes
      const { data: visData, error: visError } = await supabase
        .from('data_visualizations')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: true })

      if (visError) throw visError
      setVisualizations(visData || [])
    } catch (error: any) {
      console.error('Erro ao buscar detalhes da análise:', error)
      setError(error.message)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da análise.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateVisualizations = async () => {
    if (!fileId || !analysisId) return
    
    try {
      setGenerating(true)
      toast({
        title: "Processando",
        description: "Gerando visualizações baseadas nos dados...",
      })
      
      const { data, error } = await supabase.functions.invoke('generate-visualizations', {
        body: { 
          fileId,
          analysisId,
        }
      })

      if (error) throw error
      
      if (data?.success) {
        toast({
          title: "Concluído",
          description: "Visualizações geradas com sucesso!",
        })
        
        // Atualizar lista de visualizações
        await fetchAnalysisDetails()
      } else {
        throw new Error(data?.message || 'Falha ao gerar visualizações')
      }
    } catch (error: any) {
      console.error('Erro ao gerar visualizações:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar as visualizações.",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const renderChart = (visualization: DataVisualization) => {
    const config = visualization.configuration as any
    
    if (!config || !config.type) {
      return <div>Configuração de gráfico inválida</div>
    }
    
    switch (config.type) {
      case 'line':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={config.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.nameKey || "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={config.dataKey} stroke={config.color} name={config.name} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )
      case 'bar':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={config.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.nameKey || "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={config.dataKey} fill={config.color} name={config.name} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )
      case 'area':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsAreaChart data={config.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.nameKey || "name"} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey={config.dataKey} stroke={config.color} fill={config.color} name={config.name} />
              </RechartsAreaChart>
            </ResponsiveContainer>
          </div>
        )
      case 'pie':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <Pie 
                  data={config.data} 
                  dataKey={config.dataKey} 
                  nameKey={config.nameKey || "name"}
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  fill={config.color}
                  label
                  name={config.name}
                >
                  {config.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )
      default:
        return <div>Tipo de gráfico não suportado: {config.type}</div>
    }
  }

  const handleSaveVisualization = async (chartConfig: any) => {
    if (!analysisId) return
    
    try {
      setLoading(true)
      
      // Converter para formato adequado para JSON
      const configForStorage = {
        type: chartConfig.type,
        title: chartConfig.title,
        description: chartConfig.description || '',
        data: chartConfig.data,
        dataKey: chartConfig.dataKey,
        nameKey: chartConfig.nameKey || 'name',
        color: chartConfig.color,
        name: chartConfig.name
      }
      
      const { data, error } = await supabase
        .from('data_visualizations')
        .insert({
          analysis_id: analysisId,
          type: chartConfig.type,
          configuration: configForStorage
        })
        .select()

      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Visualização salva com sucesso!",
      })
      
      // Atualizar lista de visualizações
      await fetchAnalysisDetails()
    } catch (error: any) {
      console.error('Erro ao salvar visualização:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a visualização.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center p-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchAnalysisDetails}>Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading && !analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando detalhes da análise...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <BarChart className="h-5 w-5 text-primary" />
          Visualizações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visualizations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhuma visualização gerada. Gere visualizações baseadas nos dados analisados.
            </p>
            <Button 
              onClick={generateVisualizations} 
              disabled={generating}
              className="flex items-center gap-2"
            >
              {generating && <Loader2 className="h-4 w-4 animate-spin" />}
              Gerar Visualizações
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-md font-medium">Visualizações Geradas</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateVisualizations} 
                disabled={generating}
                className="flex items-center gap-2"
              >
                {generating && <Loader2 className="h-3 w-3 animate-spin" />}
                Regenerar
              </Button>
            </div>
            
            <Tabs defaultValue={visualizations[0]?.id.toString() || "0"} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                {visualizations.map((vis) => (
                  <TabsTrigger key={vis.id} value={vis.id.toString()} className="flex-shrink-0">
                    {(vis.configuration as any)?.title || `Gráfico ${vis.id.substring(0, 6)}`}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {visualizations.map((vis) => (
                <TabsContent key={vis.id} value={vis.id.toString()} className="pt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">
                        {(vis.configuration as any)?.title || "Visualização"}
                      </CardTitle>
                      {(vis.configuration as any)?.description && (
                        <p className="text-sm text-muted-foreground">
                          {(vis.configuration as any).description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-md p-4 bg-background">
                        {renderChart(vis)}
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        <p>Tipo: <span className="font-medium capitalize">{(vis.configuration as any)?.type}</span></p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
