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
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

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
          </TabsContent>

          <TabsContent value="insights">
            <ScrollArea className="h-[600px] pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InsightsPanel />
                <InsightsPanel />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <Brain className="h-16 w-16 mx-auto text-purple-500 opacity-50" />
                <h3 className="text-xl font-semibold">Análise de Tendências</h3>
                <p className="text-muted-foreground">
                  Nossa IA está analisando seus dados para identificar tendências relevantes.
                  Esta funcionalidade estará disponível em breve.
                </p>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Verificar Novamente
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}