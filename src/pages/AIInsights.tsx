import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Brain, Search, Filter, RefreshCw, PanelLeftClose, PanelRightClose } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InsightsPanel } from "@/components/InsightsPanel"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isInsightsPanelCollapsed, setIsInsightsPanelCollapsed] = useState(false)
  const { toast } = useToast()

  const handleRefresh = () => {
    toast({
      title: "Atualizando insights",
      description: "Buscando novos insights...",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-4 space-y-4">
        {/* Header com gradiente e efeito de vidro */}
        <div className="relative overflow-hidden rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border p-6 shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Insights
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análise inteligente dos seus dados em tempo real
                </p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <Brain className="w-full h-full text-purple-500" />
          </div>
        </div>

        {/* Barra de pesquisa e filtros com design moderno */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border animate-fade-in shadow-lg">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh} 
              className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Área principal com chat e insights */}
        <div className="flex gap-4 h-[calc(100vh-12rem)] relative animate-fade-in">
          {/* Sidebar do chat com animação suave */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-16' : 'w-72'
            }`}
          >
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Interface do chat com transições suaves */}
          <div className="flex-1 flex gap-4">
            <div 
              className={`flex-1 transition-all duration-300 ${
                !isInsightsPanelCollapsed ? 'mr-80' : 'mr-0'
              }`}
            >
              <div className="h-full glass-card">
                <ChatInterface 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
            </div>

            {/* Painel de insights com animação de deslizar */}
            <div 
              className={`fixed right-0 top-[calc(4rem+1px)] bottom-0 w-80 transition-all duration-300 transform ${
                isInsightsPanelCollapsed ? 'translate-x-full' : 'translate-x-0'
              }`}
            >
              <div className="relative h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsInsightsPanelCollapsed(!isInsightsPanelCollapsed)}
                  className="absolute -left-10 top-1/2 transform -translate-y-1/2 bg-background/50 backdrop-blur-sm"
                >
                  {isInsightsPanelCollapsed ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelRightClose className="h-4 w-4" />
                  )}
                </Button>
                <InsightsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}