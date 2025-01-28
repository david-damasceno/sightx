import { useState } from "react"
import { Brain, MessageSquare, PanelLeftClose, PanelRightClose } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button" // Added this import
import { InsightsPanel } from "@/components/InsightsPanel"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isInsightsPanelCollapsed, setIsInsightsPanelCollapsed] = useState(false)
  const { toast } = useToast()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container h-screen py-4 flex flex-col">
        {/* Header com design moderno */}
        <div className="relative mb-4 overflow-hidden rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border p-4 shadow-lg animate-fade-in">
          <div className="relative z-10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Chat com DONA
              </h1>
              <p className="text-sm text-muted-foreground">
                Assistente inteligente para análise de dados
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-5">
            <Brain className="w-full h-full text-purple-500" />
          </div>
        </div>

        {/* Área principal com chat e insights */}
        <div className="flex-1 flex gap-4 relative animate-fade-in overflow-hidden">
          {/* Sidebar do chat com animação suave */}
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? 'w-12' : 'w-64'
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
                !isInsightsPanelCollapsed ? 'mr-72' : 'mr-0'
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
              className={`fixed right-4 top-24 bottom-4 w-72 transition-all duration-300 transform ${
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