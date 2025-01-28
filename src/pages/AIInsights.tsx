import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Brain, ArrowUpRight, Search, Filter, Download, RefreshCw, PanelLeftClose, PanelRightClose } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">AI Insights</h1>
              <p className="text-sm text-muted-foreground">
                Análise inteligente dos seus dados
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar Relatório
          </Button>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border animate-fade-in">
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
            <Button variant="outline" size="icon" onClick={handleRefresh} className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex gap-4 h-[calc(100vh-12rem)] relative animate-fade-in">
          {/* Chat sidebar */}
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

          {/* Chat interface */}
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

            {/* Insights panel */}
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