
import { cn } from "@/lib/utils"
import { Loader2, Bot, User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChatMessage } from "@/types/chat"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  // Formatador de data para exibir horários de mensagens
  const formatMessageTime = (date: Date | string) => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Formata texto com quebras de linha
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  if (messages.length === 0 && !isLoading) {
    return null
  }

  return (
    <ScrollArea className="flex-1 pr-4">
      <div className="space-y-6 pb-4">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={cn(
              "group flex items-start gap-3 animate-fade-in",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "ai" && (
              <Avatar className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-800">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <div 
              className={cn(
                "relative rounded-2xl px-4 py-3 max-w-[85%] break-words",
                "transition-all duration-200",
                message.sender === "user" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-card/50 backdrop-blur-sm border shadow-sm",
                "group-hover:shadow-md"
              )}
            >
              <div className="text-sm leading-relaxed">
                {formatText(message.text)}
              </div>
              <span 
                className={cn(
                  "block text-[10px] mt-1.5 select-none",
                  message.sender === "user" 
                    ? "text-primary-foreground/80" 
                    : "text-muted-foreground"
                )}
              >
                {formatMessageTime(message.timestamp)}
              </span>
            </div>

            {message.sender === "user" && (
              <Avatar className="h-8 w-8 bg-primary/10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-800">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="bg-card/50 backdrop-blur-sm border rounded-2xl px-4 py-3 shadow-sm max-w-[85%]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">SightX está pensando...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
