import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isFavorite?: boolean
}

interface ChatMessageListProps {
  messages: ChatMessage[]
  onToggleFavorite: (messageId: string) => void
  isLoading?: boolean
}

export function ChatMessageList({ messages, onToggleFavorite, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-4 animate-fade-in shadow-lg",
                message.sender === "user"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-br-sm"
                  : "glass-card rounded-bl-sm"
              )}
            >
              {message.sender === "user" && (
                <div className="flex items-center gap-2 mb-1 text-white/80">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-medium">Você</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
              
              <div className="flex items-center justify-end gap-2 mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <button
                  onClick={() => onToggleFavorite(message.id)}
                  className={cn(
                    "text-xs opacity-70 hover:opacity-100 transition-opacity",
                    message.sender === "user" ? "text-white" : ""
                  )}
                >
                  <Star
                    className={cn(
                      "h-3 w-3",
                      message.isFavorite ? "fill-yellow-400 stroke-yellow-400" : ""
                    )}
                  />
                </button>
              </div>
            </div>

            {message.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 shadow-lg">
                <User className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/20 dark:to-emerald-800/20 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="glass-card max-w-[85%] rounded-2xl p-4 ml-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}