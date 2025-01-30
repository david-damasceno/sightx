import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Star, ChevronLeft, ChevronRight, Brain } from "lucide-react"
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
    { id: "1", title: "Chat Anterior 1", timestamp: new Date() },
    { id: "2", title: "Chat Anterior 2", timestamp: new Date() },
  ])

  const insights = [
    {
      id: "1",
      icon: <Brain className="h-4 w-4 text-purple-500" />,
      text: "DONA sugere: Aumente o estoque dos produtos eletrônicos",
      priority: "high",
      category: "Estoque",
    },
    {
      id: "2",
      icon: <Brain className="h-4 w-4 text-orange-500" />,
      text: "DONA alerta: Produto B e E estão com estoque abaixo do mínimo",
      priority: "high",
      category: "Estoque",
    },
    {
      id: "3",
      icon: <Brain className="h-4 w-4 text-green-500" />,
      text: "Vendas superaram a meta em 12.5% este mês",
      priority: "medium",
      category: "Vendas",
    },
  ]

  return (
    <div className={cn(
      "relative bg-card rounded-lg border shadow-sm transition-all duration-300 h-full",
      isCollapsed ? "w-12" : "w-72"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10 bg-background/50 backdrop-blur-sm"
        onClick={onToggleCollapse}
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      <div className={cn("transition-opacity duration-300", 
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <div className="p-4 border-b">
          <Button className="w-full" onClick={() => onSelectChat(null)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Chat
          </Button>
        </div>

        <div className="px-2 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="chats" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex-1">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            {activeTab === "chats" && (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg hover:bg-accent transition-colors",
                      selectedChat === chat.id ? "bg-accent" : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{chat.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground block mt-1">
                      {chat.timestamp.toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-2">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={cn(
                      "group relative flex flex-col gap-2 p-3 rounded-lg transition-all duration-200 hover:bg-accent cursor-pointer",
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
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {insight.category}
                          </Badge>
                          <Badge 
                            variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {insight.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "chats" && (
              <div className="flex items-center gap-2 mt-6 mb-4">
                <Star className="h-4 w-4" />
                <h3 className="font-medium">Favoritos</h3>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}