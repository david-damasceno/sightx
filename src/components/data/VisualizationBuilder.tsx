
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChartConfig, DataVisualization } from "@/types/data-imports";
import { BarChart, LineChart, AreaChart, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Bar, Line, Area, Pie, Cell } from "recharts";

// Componente para renderizar gráficos de linhas
const LineChartComponent = ({ config }: { config: ChartConfig }) => (
  <div className="w-full h-64">
    <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={config.data}>
        <XAxis dataKey={config.nameKey || "name"} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={config.dataKey} stroke={config.color} name={config.name} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// Componente para renderizar gráficos de barras
const BarChartComponent = ({ config }: { config: ChartConfig }) => (
  <div className="w-full h-64">
    <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={config.data}>
        <XAxis dataKey={config.nameKey || "name"} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={config.dataKey} fill={config.color} name={config.name} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// Componente para renderizar gráficos de área
const AreaChartComponent = ({ config }: { config: ChartConfig }) => (
  <div className="w-full h-64">
    <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={config.data}>
        <XAxis dataKey={config.nameKey || "name"} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey={config.dataKey} fill={config.color} stroke={config.color} name={config.name} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// Componente para renderizar gráficos de pizza
const PieChartComponent = ({ config }: { config: ChartConfig }) => (
  <div className="w-full h-64">
    <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={config.data} 
          dataKey={config.dataKey} 
          nameKey={config.nameKey || "name"} 
          fill={config.color}
          label
        >
          {config.data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// Cores para os gráficos
const CHART_COLORS = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#d97706", // amber-600
  "#dc2626", // red-600
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#0284c7", // sky-600
  "#84cc16"  // lime-500
];

interface VisualizationBuilderProps {
  fileId: string;
  columns: any[];
  data: any[];
}

export function VisualizationBuilder({ fileId, columns, data }: VisualizationBuilderProps) {
  const [savedVisualizations, setSavedVisualizations] = useState<DataVisualization[]>([]);
  const [chartType, setChartType] = useState<string>("bar");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [nameKey, setNameKey] = useState<string>("");
  const [dataKey, setDataKey] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (fileId) {
      fetchVisualizations();
    }
  }, [fileId]);

  useEffect(() => {
    if (columns.length > 0) {
      // Automaticamente seleciona a primeira coluna como chave de nome
      setNameKey(columns[0].name || columns[0].original_name);

      // Tenta encontrar uma coluna numérica para usar como valor
      const numericColumn = columns.find(col => 
        col.data_type === 'integer' || 
        col.data_type === 'numeric' || 
        col.data_type === 'double precision'
      );
      
      if (numericColumn) {
        setDataKey(numericColumn.name || numericColumn.original_name);
      } else if (columns.length > 1) {
        // Se não encontrar uma coluna numérica, usa a segunda coluna
        setDataKey(columns[1].name || columns[1].original_name);
      }
    }
  }, [columns]);

  const fetchVisualizations = async () => {
    try {
      const { data: analyses, error: analysesError } = await supabase
        .from('data_analyses')
        .select('id')
        .eq('import_id', fileId);
      
      if (analysesError) throw analysesError;
      
      if (analyses && analyses.length > 0) {
        const analysisIds = analyses.map(a => a.id);
        
        const { data: visualizations, error: visualizationsError } = await supabase
          .from('data_visualizations')
          .select('*')
          .in('analysis_id', analysisIds);
        
        if (visualizationsError) throw visualizationsError;
        
        setSavedVisualizations(visualizations || []);
      }
    } catch (error) {
      console.error('Error fetching visualizations:', error);
    }
  };

  const saveVisualization = async () => {
    if (!fileId || !chartType || !title || !dataKey || !nameKey) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios para criar uma visualização",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Primeiro, verifica se já existe uma análise para este arquivo
      const { data: analyses, error: analysesError } = await supabase
        .from('data_analyses')
        .select('id')
        .eq('import_id', fileId)
        .eq('analysis_type', 'visualization');
      
      if (analysesError) throw analysesError;
      
      let analysisId;
      
      if (analyses && analyses.length > 0) {
        analysisId = analyses[0].id;
      } else {
        // Cria uma nova análise se não existir
        const { data: newAnalysis, error: newAnalysisError } = await supabase
          .from('data_analyses')
          .insert({
            import_id: fileId,
            analysis_type: 'visualization',
            configuration: {},
            results: {}
          })
          .select()
          .single();
        
        if (newAnalysisError) throw newAnalysisError;
        
        analysisId = newAnalysis.id;
      }
      
      // Prepara a configuração do gráfico como um objeto que é compatível com Json
      const chartConfig: Record<string, any> = {
        type: chartType,
        title: title,
        description: description || undefined,
        dataKey: dataKey,
        nameKey: nameKey,
        color: CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)],
        name: dataKey,
        data: data.map(item => ({
          [nameKey]: item[nameKey],
          [dataKey]: typeof item[dataKey] === 'string' ? parseFloat(item[dataKey]) : item[dataKey]
        }))
      };
      
      // Agora insere a visualização
      const { data: newVisualization, error: visualizationError } = await supabase
        .from('data_visualizations')
        .insert({
          analysis_id: analysisId,
          type: chartType,
          configuration: chartConfig
        })
        .select()
        .single();
      
      if (visualizationError) throw visualizationError;
      
      toast({
        title: "Visualização criada",
        description: "A visualização foi salva com sucesso."
      });
      
      // Atualiza a lista de visualizações
      fetchVisualizations();
      
      // Limpa o formulário
      setTitle("");
      setDescription("");
      
    } catch (error: any) {
      console.error('Error saving visualization:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a visualização",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (visualization: DataVisualization) => {
    const config = visualization.configuration as any;
    
    if (!config || !config.type) return null;
    
    switch (config.type) {
      case 'line':
        return <LineChartComponent config={config} />;
      case 'bar':
        return <BarChartComponent config={config} />;
      case 'area':
        return <AreaChartComponent config={config} />;
      case 'pie':
        return <PieChartComponent config={config} />;
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar nova visualização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de gráfico</label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de gráfico" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Gráfico de barras</SelectItem>
                    <SelectItem value="line">Gráfico de linhas</SelectItem>
                    <SelectItem value="area">Gráfico de área</SelectItem>
                    <SelectItem value="pie">Gráfico de pizza</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Título do gráfico" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
              <Input 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Descrição do gráfico" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coluna de categoria (eixo X)</label>
                <Select value={nameKey} onValueChange={setNameKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna para categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id || column.name || column.original_name} value={column.name || column.original_name}>
                        {column.display_name || column.name || column.original_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Coluna de valor (eixo Y)</label>
                <Select value={dataKey} onValueChange={setDataKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna para valores" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id || column.name || column.original_name} value={column.name || column.original_name}>
                        {column.display_name || column.name || column.original_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={saveVisualization} disabled={loading} className="w-full">
              {loading ? "Salvando..." : "Salvar visualização"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {savedVisualizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Visualizações salvas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grade</TabsTrigger>
                <TabsTrigger value="list">Lista</TabsTrigger>
              </TabsList>
              <TabsContent value="grid">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedVisualizations.map((visualization) => (
                    <Card key={visualization.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        {renderChart(visualization)}
                        {visualization.configuration && typeof visualization.configuration === 'object' && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {(visualization.configuration as any).description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="list">
                <div className="space-y-4">
                  {savedVisualizations.map((visualization) => (
                    <Card key={visualization.id}>
                      <CardContent className="p-4">
                        {visualization.configuration && typeof visualization.configuration === 'object' && (
                          <h3 className="text-lg font-semibold mb-2">
                            {(visualization.configuration as any).title || `Visualização ${visualization.type}`}
                          </h3>
                        )}
                        {renderChart(visualization)}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
