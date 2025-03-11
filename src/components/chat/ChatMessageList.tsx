
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface Message {
  id: string
  sender: "user" | "ai"
  text: string
  timestamp: Date
}

interface ChatMessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  // Formatador de data para exibir horários de mensagens
  const formatMessageTime = (date: Date) => {
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
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={cn(
            "flex items-start gap-3 animate-fade-in",
            message.sender === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.sender === "ai" && (
            <Avatar className="h-8 w-8 bg-primary/10">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 16L14 12L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Avatar>
          )}
          
          <div 
            className={cn(
              "relative max-w-[80%] rounded-lg p-4",
              message.sender === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-card/50 backdrop-blur-sm border"
            )}
          >
            <div className="text-sm">
              {formatText(message.text)}
            </div>
            <span 
              className={cn(
                "block text-xs mt-1",
                message.sender === "user" 
                  ? "text-primary-foreground/80" 
                  : "text-muted-foreground"
              )}
            >
              {formatMessageTime(message.timestamp)}
            </span>
          </div>

          {message.sender === "user" && (
            <Avatar className="h-8 w-8 bg-primary/10">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Avatar>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8 bg-primary/10">
            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 16L14 12L10 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Avatar>
          
          <div className="bg-card/50 backdrop-blur-sm border rounded-lg p-4 max-w-[80%] animate-pulse">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">SightX está pensando...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
