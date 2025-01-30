import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Star, ChevronLeft, ChevronRight, Brain, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ChatSidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function ChatSidebar({ 
  selectedChat, 
  onSelectChat, 
  isCollapsed,
  onToggleCollapse 
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("chats")
  const [chats] = useState([
    { id: "1", title: "Análise de Vendas Q4", timestamp: new Date(), category: "Vendas" },
    { id: "2", title: "Previsão de Demanda", timestamp: new Date(), category: "Planejamento" },
  ])

  const insights = [
    {
      id: "1",
      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
      text: "Oportunidade: Aumento de 23% nas vendas de eletrônicos",
      priority: "high",
      category: "Vendas",
      isNew: true
    },
    {
      id: "2",
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      text: "Alerta: Estoque baixo em 5 produtos principais",
      priority: "high",
      category: "Estoque",
      isNew: true
    },
    {
      id: "3",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      text: "Meta mensal atingida: 112% realizado",
      priority: "medium",
      category: "Metas",
      isNew: false
    },
  ]

  return (
    <div className={cn(
      "relative h-full rounded-xl border border-white/20 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl shadow-xl transition-all duration-300",
      isCollapsed ? "w-12" : "w-80"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={onToggleCollapse}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className={cn("transition-opacity duration-300", 
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <div className="p-4 border-b border-white/20 dark:border-gray-800">
          <Button 
            className="w-full bg-purple-500 hover:bg-purple-600 text-white" 
            onClick={() => onSelectChat(null)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Chat
          </Button>
        </div>

        <div className="px-2 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-white/50 dark:bg-gray-800/50">
              <TabsTrigger value="chats" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex-1 data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)] px-4">
          {activeTab === "chats" && (
            <div className="space-y-2 py-4">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-200",
                    "hover:bg-white/50 dark:hover:bg-gray-800/50",
                    "border border-transparent hover:border-purple-200 dark:hover:border-purple-900",
                    selectedChat === chat.id ? "bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-900" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium truncate">{chat.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {chat.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {chat.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-2 py-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "group relative flex flex-col gap-2 p-3 rounded-lg transition-all duration-200",
                    "hover:bg-white/50 dark:hover:bg-gray-800/50 cursor-pointer",
                    "border border-transparent hover:border-purple-200 dark:hover:border-purple-900",
                    {
                      'border-l-4': true,
                      'border-l-red-500': insight.priority === 'high',
                      'border-l-yellow-500': insight.priority === 'medium',
                      'border-l-blue-500': insight.priority === 'low',
                    }
                  )}
                >
                  <div className="flex items-start gap-2">
                    {insight.icon}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.category}
                        </Badge>
                        {insight.isNew && (
                          <Badge variant="default" className="text-xs bg-purple-500">
                            Novo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "chats" && (
            <div className="flex items-center gap-2 mt-6 mb-4">
              <Star className="h-4 w-4 text-yellow-500" />
              <h3 className="font-medium">Favoritos</h3>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}