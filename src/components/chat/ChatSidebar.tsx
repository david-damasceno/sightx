
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Search, PlusCircle, Trash2, MessageSquare, Settings, History } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface ChatSidebarProps {
  selectedChat: string | null
  onSelectChat: (chatId: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
  onNewChat?: () => void
}

export function ChatSidebar({
  selectedChat,
  onSelectChat,
  isCollapsed,
  onToggleCollapse,
  onNewChat
}: ChatSidebarProps) {
  const [search, setSearch] = useState("")
  const isMobile = useMobile()
  
  // Mock data - seria substituído por dados reais
  const chats = [
    { id: "chat-1", title: "Análise de vendas de janeiro", date: "1d atrás" },
    { id: "chat-2", title: "Previsão de tendências para Q2", date: "3d atrás" },
    { id: "chat-3", title: "Comparativo de desempenho regional", date: "5d atrás" },
    { id: "chat-4", title: "Análise de campanhas de marketing", date: "1sem atrás" },
    { id: "chat-5", title: "Insights sobre satisfação do cliente", date: "2sem atrás" }
  ]

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(search.toLowerCase())
  )

  const chatGroups = [
    { id: "recent", title: "Recentes", chats: filteredChats.slice(0, 3) },
    { id: "older", title: "Mais antigos", chats: filteredChats.slice(3) }
  ]

  if (isCollapsed && !isMobile) {
    return (
      <div className="h-full flex flex-col py-4 bg-background/50 backdrop-blur-sm">
        <div className="px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="mb-2 h-6 w-6 rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Expandir barra lateral</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-medium">Conversas</h2>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-6 w-6 rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Colapsar barra lateral</span>
          </Button>
        )}
      </div>

      <div className="p-3">
        <Button 
          onClick={onNewChat} 
          className="w-full gap-2 rounded-lg"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Nova conversa</span>
        </Button>
      </div>

      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar conversas..."
            className="pl-8 h-9 rounded-lg bg-background/70"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-6 p-2">
          {chatGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <h3 className="text-xs font-medium text-muted-foreground px-2">
                {group.title}
              </h3>
              
              {group.chats.length > 0 ? (
                <div className="space-y-1">
                  {group.chats.map((chat) => (
                    <Button
                      key={chat.id}
                      variant={selectedChat === chat.id ? "secondary" : "ghost"}
                      onClick={() => onSelectChat(chat.id)}
                      className={cn(
                        "w-full justify-start gap-2 h-auto py-3 px-3 rounded-lg",
                        selectedChat === chat.id && "bg-accent"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 truncate text-left">
                        <div className="font-medium truncate">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">{chat.date}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground px-2 py-1">
                  Nenhuma conversa encontrada
                </p>
              )}
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center py-6">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Nenhuma conversa encontrada</p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente usar termos diferentes na busca
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t mt-auto">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start gap-2 h-9 rounded-lg"
        >
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </Button>
      </div>
    </div>
  )
}
