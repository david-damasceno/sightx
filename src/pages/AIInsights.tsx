import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, ArrowUpRight, Sparkles, Search, Filter, Download, RefreshCw, PanelLeftClose, PanelRightClose } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { InsightsPanel } from "@/components/InsightsPanel"
import { InsightsHeader } from "@/components/insights/InsightsHeader"
import { InsightsMetrics } from "@/components/insights/InsightsMetrics"
import { InsightsTrends } from "@/components/insights/InsightsTrends"
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
      <div className="container py-2 space-y-3 animate-fade-in">
        <InsightsHeader />

        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded-lg border">
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

        <InsightsMetrics />

        <div className="flex h-[calc(100vh-20rem)] gap-4 relative">
          <div className={`transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-16' : 'w-72'}`}>
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          <div className="flex-1 flex gap-4">
            <div className={`flex-1 transition-all duration-300 ${!isInsightsPanelCollapsed ? 'mr-80' : 'mr-0'}`}>
              <div className="h-full glass-card">
                <ChatInterface 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
            </div>

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
                  {isInsightsPanelCollapsed ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
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