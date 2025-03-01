
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartConfig, DataAnalysis, DataVisualization } from "@/types/data-imports"
import { LineChart, BarChart, PieChart, AreaChart, Line, Bar, Area, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { AlertTriangle, BarChart2, CheckCircle, Loader2, PieChart as PieChartIcon, TrendingUp } from "lucide-react"

interface VisualizationBuilderProps {
  fileId: string
  onComplete: () => void
}

export function VisualizationBuilder({ fileId, onComplete }: VisualizationBuilderProps) {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [analyses, setAnalyses] = useState<DataAnalysis[]>([])
  const [visualizations, setVisualizations] = useState<DataVisualization[]>([])
  const { toast } = useToast()
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A259FF', '#4CAF50', '#F44336', '#3F51B5']

  useEffect(() => {
    const loadVisualizations = async () => {
      try {
        setLoading(true)
        
        // Buscar análises
        const { data: analysesData, error: analysesError } = await supabase
          .from('data_analyses')
          .select('*')
          .eq('import_id', fileId)
        
        if (analysesError) throw analysesError
        
        if (analysesData && analysesData.length > 0) {
          setAnalyses(analysesData as unknown as DataAnalysis[])
          
          // Definir a primeira análise como selecionada
          setSelectedAnalysis(analysesData[0].id)
          
          // Buscar visualizações associadas
          const { data: visData, error: visError } = await supabase
            .from('data_visualizations')
            .select('*')
            .in('analysis_id', analysesData.map(a => a.id))
          
          if (visError) throw visError
          
          if (visData) {
            setVisualizations(visData as unknown as DataVisualization[])
          } else {
            // Se não tem visualizações, gerar
            await generateVisualizations()
          }
        } else {
          // Se não tem análises, gerar
          await generateAnalyses()
        }
      } catch (error: any) {
        console.error('Erro ao carregar visualizações:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar as visualizações",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadVisualizations()
  }, [fileId, toast])
  
  const generateAnalyses = async () => {
    try {
      setGenerating(true)
      
      toast({
        title: "Analisando dados",
        description: "Gerando análises de dados...",
      })
      
      const { data, error } = await supabase.functions.invoke('analyze-table-context', {
        body: { fileId }
      })
      
      if (error) throw error
      
      if (data && Array.isArray(data)) {
        // Atualizar lista de análises
        setAnalyses(data as unknown as DataAnalysis[])
        
        if (data.length > 0) {
          setSelectedAnalysis(data[0].id)
          await generateVisualizations()
        }
      }
    } catch (error: any) {
      console.error('Erro ao gerar análises:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar análises",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }
  
  const generateVisualizations = async () => {
    try {
      setGenerating(true)
      
      toast({
        title: "Gerando visualizações",
        description: "Criando visualizações para os dados...",
      })
      
      const { data, error } = await supabase.functions.invoke('generate-visualizations', {
        body: { fileId, analysisIds: analyses.map(a => a.id) }
      })
      
      if (error) throw error
      
      if (data && Array.isArray(data)) {
        setVisualizations(data as unknown as DataVisualization[])
        
        toast({
          title: "Sucesso",
          description: "Visualizações geradas com sucesso!",
        })
      }
    } catch (error: any) {
      console.error('Erro ao gerar visualizações:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar visualizações",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }
  
  const renderVisualization = (visualization: DataVisualization) => {
    if (!visualization.configuration || typeof visualization.configuration !== 'object') {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-2" />
          <span>Configuração de visualização inválida</span>
        </div>
      )
    }
    
    const config = visualization.configuration as unknown as ChartConfig
    
    if (!config || !config.data || !Array.isArray(config.data) || config.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[300px]">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-2" />
          <span>Dados insuficientes para visualização</span>
        </div>
      )
    }
    
    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300} className="mt-4">
            <LineChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.dataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.name} 
                stroke={config.color} 
                name={config.name} 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300} className="mt-4">
            <BarChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.dataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={config.name} 
                fill={config.color} 
                name={config.name}
              />
            </BarChart>
          </ResponsiveContainer>
        )
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300} className="mt-4">
            <AreaChart data={config.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.dataKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={config.name} 
                fill={config.color} 
                stroke={config.color} 
                name={config.name}
              />
            </AreaChart>
          </ResponsiveContainer>
        )
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300} className="mt-4">
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey={config.name}
                nameKey={config.dataKey}
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {config.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
        
      default:
        return (
          <div className="flex items-center justify-center h-[300px]">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-2" />
            <span>Tipo de visualização não suportado: {config.type}</span>
          </div>
        )
    }
  }
  
  if (loading || generating) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-lg font-medium">
                {generating ? "Gerando Visualizações" : "Carregando Visualizações"}
              </p>
              <p className="text-muted-foreground">
                {generating 
                  ? "Analisando padrões nos dados e criando gráficos..."
                  : "Buscando visualizações existentes..."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
            <div className="text-center">
              <p className="text-lg font-medium">Nenhuma Análise Disponível</p>
              <p className="text-muted-foreground">
                Não foi possível encontrar ou gerar análises para este conjunto de dados.
              </p>
            </div>
            <Button onClick={generateAnalyses}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Filtrar visualizações para a análise selecionada
  const visualizationsForSelectedAnalysis = visualizations.filter(
    v => v.analysis_id === selectedAnalysis
  )
  
  const selectedAnalysisData = analyses.find(a => a.id === selectedAnalysis)
  
  return (
    <Card className="shadow-md border border-border/40">
      <CardHeader>
        <CardTitle>Visualizações e Insights</CardTitle>
        <CardDescription>
          Visualize padrões e tendências em seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Tabs 
            value={selectedAnalysis || analyses[0]?.id || ''} 
            onValueChange={setSelectedAnalysis}
          >
            <TabsList className="mb-4 w-full flex overflow-x-auto">
              {analyses.map(analysis => (
                <TabsTrigger 
                  key={analysis.id} 
                  value={analysis.id}
                  className="flex-shrink-0"
                >
                  {analysis.analysis_type === 'time_series' ? (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  ) : analysis.analysis_type === 'distribution' ? (
                    <BarChart2 className="h-4 w-4 mr-2" />
                  ) : (
                    <PieChartIcon className="h-4 w-4 mr-2" />
                  )}
                  {analysis.analysis_type.charAt(0).toUpperCase() + analysis.analysis_type.slice(1).replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {analyses.map(analysis => (
              <TabsContent key={analysis.id} value={analysis.id}>
                <div className="mb-4">
                  <Card>
                    <CardContent className="pt-4">
                      <h3 className="text-lg font-semibold">
                        {analysis.configuration && typeof analysis.configuration === 'object' 
                          ? (analysis.configuration as any).description || 'Análise dos Dados'
                          : 'Análise dos Dados'}
                      </h3>
                      
                      <div className="flex gap-2 mt-2">
                        {analysis.analysis_type === 'time_series' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Série Temporal
                          </span>
                        ) : analysis.analysis_type === 'distribution' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Distribuição
                          </span>
                        ) : analysis.analysis_type === 'correlation' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Correlação
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {analysis.analysis_type.charAt(0).toUpperCase() + analysis.analysis_type.slice(1).replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      <p className="mt-3 text-sm text-muted-foreground">
                        {analysis.results && typeof analysis.results === 'object' 
                          ? (analysis.results as any).description || 'Análise detalhada dos dados com base em algoritmos estatísticos.'
                          : 'Análise detalhada dos dados com base em algoritmos estatísticos.'}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                
                {visualizationsForSelectedAnalysis.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visualizationsForSelectedAnalysis.map(vis => (
                      <Card key={vis.id}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">
                            {vis.configuration && typeof vis.configuration === 'object' 
                              ? (vis.configuration as any).title || 'Visualização'
                              : 'Visualização'}
                          </CardTitle>
                          {vis.configuration && typeof vis.configuration === 'object' && (vis.configuration as any).description && (
                            <CardDescription>
                              {(vis.configuration as any).description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {renderVisualization(vis)}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="pt-4 flex flex-col items-center justify-center py-8">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                      <p className="text-center">
                        Nenhuma visualização disponível para esta análise.
                      </p>
                      <Button onClick={generateVisualizations} className="mt-4">
                        Gerar Visualizações
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t">
          <div>
            {analyses.length > 0 && visualizations.length > 0 && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                {visualizations.length} visualizações geradas
              </div>
            )}
          </div>
          <Button onClick={onComplete}>
            Concluir
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
