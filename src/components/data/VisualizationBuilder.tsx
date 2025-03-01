
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, LineChart as LineChartIcon, BarChart as BarChartIcon, AreaChart as AreaChartIcon, PieChart as PieChartIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { ChartConfig, DataVisualization } from '@/types/data-imports';

interface VisualizationBuilderProps {
  fileId: string;
  tableName: string;
  onComplete: () => void;
}

const CHART_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6", "#84cc16"
];

export function VisualizationBuilder({ fileId, tableName, onComplete }: VisualizationBuilderProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [visualizations, setVisualizations] = useState<DataVisualization[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedChart, setSelectedChart] = useState<string>('line');
  const [newChartConfig, setNewChartConfig] = useState<ChartConfig>({
    type: 'line',
    title: '',
    data: [],
    dataKey: '',
    name: '',
    color: CHART_COLORS[0],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchVisualizations = async () => {
      try {
        setLoading(true);
        // Buscar visualizações existentes
        const { data: analysisData, error: analysisError } = await supabase
          .from('data_analyses')
          .select('id')
          .eq('import_id', fileId)
          .eq('analysis_type', 'data_visualization')
          .single();

        if (!analysisError && analysisData) {
          const { data: visData, error: visError } = await supabase
            .from('data_visualizations')
            .select('*')
            .eq('analysis_id', analysisData.id);

          if (!visError && visData) {
            setVisualizations(visData);
          }
        }

        // Buscar dados da tabela
        const { data: tableResult, error: tableError } = await supabase
          .rpc('get_table_data', { 
            table_name: tableName,
            row_limit: 100
          });

        if (tableError) throw tableError;

        // Converter o resultado JSONB para array
        const dataArray = Array.isArray(tableResult) ? tableResult : 
                          typeof tableResult === 'object' ? Object.values(tableResult) : [];
                          
        if (dataArray && dataArray.length > 0) {
          setTableData(dataArray);
          
          // Extrair colunas
          const columns = Object.keys(dataArray[0])
            .filter(key => key !== 'id' && key !== 'organization_id' && key !== 'created_at');
          setTableColumns(columns);
          
          // Definir valores iniciais para o novo gráfico
          if (columns.length > 0) {
            setNewChartConfig(prev => ({
              ...prev,
              dataKey: columns[0]
            }));
          }
        }
      } catch (error: any) {
        console.error('Erro ao carregar visualizações:', error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar as visualizações",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (fileId && tableName) {
      fetchVisualizations();
    }
  }, [fileId, tableName, toast]);

  const generateVisualizations = async () => {
    try {
      setGenerating(true);
      toast({
        title: "Gerando visualizações...",
        description: "Isso pode levar alguns segundos",
      });

      const { data, error } = await supabase.functions.invoke('generate-visualizations', {
        body: { 
          fileId,
          tableName
        }
      });

      if (error) throw error;

      if (data && data.visualizations) {
        toast({
          title: "Visualizações geradas com sucesso!",
          description: `${data.visualizations.length} visualizações foram criadas`,
        });
        
        // Buscar visualizações atualizadas
        const { data: analysisData } = await supabase
          .from('data_analyses')
          .select('id')
          .eq('import_id', fileId)
          .eq('analysis_type', 'data_visualization')
          .single();

        if (analysisData) {
          const { data: visData } = await supabase
            .from('data_visualizations')
            .select('*')
            .eq('analysis_id', analysisData.id);

          if (visData) {
            setVisualizations(visData);
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao gerar visualizações:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar as visualizações",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const addCustomVisualization = async () => {
    try {
      if (!newChartConfig.title || !newChartConfig.dataKey) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha o título e selecione uma coluna de dados",
          variant: "destructive"
        });
        return;
      }

      let analysisId: string;
      
      // Verificar se já existe uma análise do tipo data_visualization
      const { data: existingAnalysis, error: analysisError } = await supabase
        .from('data_analyses')
        .select('id')
        .eq('import_id', fileId)
        .eq('analysis_type', 'data_visualization')
        .single();

      if (analysisError && analysisError.code === 'PGRST116') {
        // Criar nova análise se não existir
        const { data: newAnalysis, error: newAnalysisError } = await supabase
          .from('data_analyses')
          .insert({
            import_id: fileId,
            analysis_type: 'data_visualization',
            configuration: {},
            results: {}
          })
          .select('id')
          .single();

        if (newAnalysisError) throw newAnalysisError;
        analysisId = newAnalysis.id;
      } else if (analysisError) {
        throw analysisError;
      } else {
        analysisId = existingAnalysis.id;
      }

      // Criar nova visualização
      const chartConfig: ChartConfig = {
        ...newChartConfig,
        type: selectedChart,
        data: tableData
      };

      const { data: newVis, error: visError } = await supabase
        .from('data_visualizations')
        .insert({
          analysis_id: analysisId,
          type: selectedChart,
          configuration: chartConfig
        })
        .select('*')
        .single();

      if (visError) throw visError;

      setVisualizations(prev => [...prev, newVis]);
      
      // Resetar formulário
      setNewChartConfig({
        type: selectedChart,
        title: '',
        data: [],
        dataKey: tableColumns.length > 0 ? tableColumns[0] : '',
        color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
        name: ''
      });

      toast({
        title: "Visualização adicionada",
        description: "Nova visualização criada com sucesso!"
      });
    } catch (error: any) {
      console.error('Erro ao adicionar visualização:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível adicionar a visualização",
        variant: "destructive"
      });
    }
  };

  const renderChart = (config: ChartConfig) => {
    const formattedData = config.data || tableData;
    const randomColor = CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)];
    
    switch (config.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.nameKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color || randomColor} 
                name={config.name || config.dataKey} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.nameKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey={config.dataKey} 
                fill={config.color || randomColor} 
                name={config.name || config.dataKey} 
              />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={config.nameKey || 'name'} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={config.dataKey} 
                fill={config.color || randomColor} 
                stroke={config.color || randomColor} 
                name={config.name || config.dataKey} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={formattedData}
                dataKey={config.dataKey}
                nameKey={config.nameKey || 'name'}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill={config.color || randomColor}
                name={config.name || config.dataKey}
                label
              >
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="p-8 text-center text-muted-foreground">Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Visualizações</CardTitle>
          <CardDescription>
            Crie visualizações para explorar seus dados de forma eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Carregando visualizações...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {visualizations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma visualização foi criada ainda. Você pode gerar visualizações automaticamente ou criar manualmente.
                  </p>
                  <Button 
                    onClick={generateVisualizations} 
                    disabled={generating}
                    className="space-x-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <LineChartIcon className="h-4 w-4" />
                        <span>Gerar Visualizações</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visualizations.map((vis) => {
                    const config = vis.configuration as unknown as ChartConfig;
                    return (
                      <Card key={vis.id} className="overflow-hidden">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-lg">{config.title}</CardTitle>
                          {config.description && (
                            <CardDescription>{config.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className="p-2">
                            {renderChart(config)}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <span className="font-medium">Tipo:</span>
                              <span className="ml-1 capitalize">{config.type}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium">Dados:</span>
                              <span className="ml-1">{config.dataKey}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Separador */}
              <Separator className="my-8" />

              {/* Formulário para criar nova visualização */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Criar Nova Visualização</CardTitle>
                  <CardDescription>
                    Configure os parâmetros para criar uma visualização personalizada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="line"
                    className="w-full"
                    value={selectedChart}
                    onValueChange={setSelectedChart}
                  >
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="line" className="flex items-center">
                        <LineChartIcon className="h-4 w-4 mr-2" />
                        <span>Linha</span>
                      </TabsTrigger>
                      <TabsTrigger value="bar" className="flex items-center">
                        <BarChartIcon className="h-4 w-4 mr-2" />
                        <span>Barra</span>
                      </TabsTrigger>
                      <TabsTrigger value="area" className="flex items-center">
                        <AreaChartIcon className="h-4 w-4 mr-2" />
                        <span>Área</span>
                      </TabsTrigger>
                      <TabsTrigger value="pie" className="flex items-center">
                        <PieChartIcon className="h-4 w-4 mr-2" />
                        <span>Pizza</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Título */}
                        <div className="space-y-2">
                          <Label htmlFor="chart-title">Título</Label>
                          <Input
                            id="chart-title"
                            placeholder="Ex: Vendas por Mês"
                            value={newChartConfig.title}
                            onChange={(e) => setNewChartConfig(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>

                        {/* Coluna de Dados */}
                        <div className="space-y-2">
                          <Label htmlFor="data-column">Coluna de Dados</Label>
                          <Select 
                            value={newChartConfig.dataKey} 
                            onValueChange={(value) => setNewChartConfig(prev => ({ ...prev, dataKey: value }))}
                          >
                            <SelectTrigger id="data-column">
                              <SelectValue placeholder="Selecione uma coluna" />
                            </SelectTrigger>
                            <SelectContent>
                              {tableColumns.map(column => (
                                <SelectItem key={column} value={column}>
                                  {column}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Nome da Série */}
                        <div className="space-y-2">
                          <Label htmlFor="series-name">Nome da Série</Label>
                          <Input
                            id="series-name"
                            placeholder="Ex: Total Vendas"
                            value={newChartConfig.name}
                            onChange={(e) => setNewChartConfig(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>

                        {/* Cor */}
                        <div className="space-y-2">
                          <Label htmlFor="chart-color">Cor</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              id="chart-color"
                              value={newChartConfig.color}
                              onChange={(e) => setNewChartConfig(prev => ({ ...prev, color: e.target.value }))}
                              className="h-9 w-9 border rounded cursor-pointer"
                            />
                            <Input
                              value={newChartConfig.color}
                              onChange={(e) => setNewChartConfig(prev => ({ ...prev, color: e.target.value }))}
                              className="font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Prévia */}
                      <div className="bg-white/30 p-4 border rounded-md mt-6">
                        <h4 className="text-sm font-medium mb-4">Prévia:</h4>
                        {renderChart({
                          ...newChartConfig,
                          type: selectedChart,
                          data: tableData
                        })}
                      </div>
                    </div>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={addCustomVisualization}
                    className="ml-auto gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Visualização</span>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={generateVisualizations} 
            disabled={generating}
          >
            {generating ? "Gerando..." : "Gerar Automaticamente"}
          </Button>
          <Button onClick={onComplete} className="space-x-1">
            <span>Concluir</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
