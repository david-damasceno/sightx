import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { InsightsPanel } from "@/components/InsightsPanel"
import { MetricCard } from "@/components/MetricCard"
import { 
  Brain, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target, 
  ArrowUpRight, 
  Clock, 
  Sparkles,
  Download,
  Filter,
  RefreshCw,
  Search,
  Settings2,
  Upload,
  FileType,
  File,
  LineChart // Changed from ChartLine to LineChart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useOrganization } from "@/hooks/useOrganization"
import { supabase } from "@/integrations/supabase/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"

// Dados simulados para os gráficos
const salesData = [
  { month: 'Jan', vendas: 4000, meta: 3000 },
  { month: 'Fev', vendas: 3000, meta: 3000 },
  { month: 'Mar', vendas: 5000, meta: 3000 },
  { month: 'Abr', vendas: 2780, meta: 3000 },
  { month: 'Mai', vendas: 4890, meta: 3000 },
  { month: 'Jun', vendas: 3390, meta: 3000 },
]

const customerData = [
  { mes: 'Jan', novos: 120, recorrentes: 200 },
  { mes: 'Fev', novos: 150, recorrentes: 220 },
  { mes: 'Mar', novos: 180, recorrentes: 250 },
  { mes: 'Abr', novos: 170, recorrentes: 280 },
  { mes: 'Mai', novos: 200, recorrentes: 300 },
  { mes: 'Jun', novos: 220, recorrentes: 320 },
]

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { currentOrganization } = useOrganization()
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: number;
    type: string;
    uploadedAt: Date;
  }>>([])

  const handleExport = () => {
    toast({
      title: "Exportando insights",
      description: "Seus insights serão exportados em breve.",
    })
  }

  const handleRefresh = () => {
    toast({
      title: "Atualizando insights",
      description: "Buscando novos insights...",
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentOrganization) return

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${currentOrganization.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase
        .from('data_files')
        .insert({
          organization_id: currentOrganization.id,
          file_name: file.name,
          file_path: filePath,
          file_type: fileExt as any,
          file_size: file.size,
          content_type: file.type,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (dbError) throw dbError

      setUploadedFiles(prev => [...prev, {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date()
      }])

      toast({
        title: "Arquivo enviado com sucesso",
        description: "O arquivo será processado em breve para gerar insights.",
      })
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-6 space-y-6 animate-fade-in">
        {/* Header Section with enhanced styling */}
        <div className="relative overflow-hidden rounded-lg bg-white/30 backdrop-blur-md border p-8 dark:bg-gray-800/30">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Insights da DONA
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Análise inteligente dos dados da sua empresa para tomada de decisões estratégicas. 
              Acompanhe métricas em tempo real e receba recomendações personalizadas.
            </p>
            <div className="flex gap-4 mt-6">
              <Button variant="default" className="gap-2">
                <Target className="h-4 w-4" />
                Definir Metas
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Configurar IA
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <Brain className="w-full h-full text-purple-500" />
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vendas Previstas"
            value="R$ 125.000"
            change="+12.5%"
            icon={<TrendingUp className="h-6 w-6 text-green-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Clientes Ativos"
            value="1,234"
            change="+5.2%"
            icon={<Users className="h-6 w-6 text-blue-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 350"
            change="+8.7%"
            icon={<ShoppingCart className="h-6 w-6 text-purple-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Insights Gerados"
            value="28"
            change="+15"
            icon={<Brain className="h-6 w-6 text-indigo-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Main Content with Enhanced Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full justify-start mb-4 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Chat com DONA
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Tendências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0 space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-3">
                <ChatSidebar 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <ChatInterface 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
              <div className="col-span-12 lg:col-span-3">
                <InsightsPanel />
              </div>
            </div>

            {/* Área de Upload */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-500" />
                  Upload de Arquivos para Análise
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos para gerar insights automáticos usando IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CSV, Excel, JSON (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept=".csv,.xlsx,.xls,.json"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Lista de Arquivos */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium mb-3">Arquivos Enviados</h3>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileType className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB • {
                                    new Date(file.uploadedAt).toLocaleString()
                                  }
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <File className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InsightsPanel />
                <InsightsPanel />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends" className="mt-4 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Vendas */}
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Tendência de Vendas
                      </CardTitle>
                      <CardDescription>
                        Comparativo de vendas realizadas vs. meta
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="vendas" 
                          stroke="#22c55e" 
                          name="Vendas"
                          strokeWidth={2}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="meta" 
                          stroke="#94a3b8" 
                          name="Meta"
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico de Clientes */}
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        Evolução de Clientes
                      </CardTitle>
                      <CardDescription>
                        Novos clientes vs. recorrentes por mês
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={customerData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="novos" 
                          name="Novos Clientes" 
                          fill="#3b82f6"
                        />
                        <Bar 
                          dataKey="recorrentes" 
                          name="Clientes Recorrentes" 
                          fill="#93c5fd"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Cards de Insights */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Insights das Tendências
                  </CardTitle>
                  <CardDescription>
                    Análises e recomendações baseadas nas tendências identificadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Crescimento Sustentável</h4>
                        <p className="text-sm text-muted-foreground">
                          As vendas mantêm tendência de crescimento nos últimos 3 meses, 
                          superando a meta em 15%.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Retenção de Clientes</h4>
                        <p className="text-sm text-muted-foreground">
                          A taxa de clientes recorrentes aumentou 12% no último trimestre,
                          indicando forte fidelização.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900">
                        <LineChart className="h-4 w-4 text-yellow-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Projeção Futura</h4>
                        <p className="text-sm text-muted-foreground">
                          Baseado nas tendências atuais, projetamos um crescimento
                          de 25% para o próximo trimestre.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                        <Target className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Recomendação</h4>
                        <p className="text-sm text-muted-foreground">
                          Considere aumentar o investimento em marketing digital para
                          manter o ritmo de aquisição de novos clientes.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}