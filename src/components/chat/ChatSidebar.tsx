import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [chats] = useState([
    { id: "1", title: "Chat Anterior 1", timestamp: new Date() },
    { id: "2", title: "Chat Anterior 2", timestamp: new Date() },
  ])

  return (
    <div className={cn(
      "relative bg-card rounded-lg border shadow-sm transition-all duration-300",
      isCollapsed ? "w-12" : "w-64"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-10"
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

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-4 w-4" />
              <h3 className="font-medium">Chats Recentes</h3>
            </div>
            
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full text-left p-2 rounded-lg hover:bg-accent ${
                  selectedChat === chat.id ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">{chat.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {chat.timestamp.toLocaleDateString()}
                </span>
              </button>
            ))}

            <div className="flex items-center gap-2 mt-6 mb-4">
              <Star className="h-4 w-4" />
              <h3 className="font-medium">Favoritos</h3>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}