import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, Bot, User } from "lucide-react"

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
    scrollToBottom()
  }, [messages])

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "ai" && (
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-green-500" />
              </div>
            )}
            
            <div
              className={`max-w-[85%] rounded-2xl p-4 animate-in ${
                message.sender === "user"
                  ? "bg-green-500 text-white ml-auto rounded-br-sm"
                  : "glass-card rounded-bl-sm"
              }`}
            >
              {message.sender === "user" && (
                <div className="flex items-center gap-2 mb-1 text-white/80">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Você</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              
              <div className="flex items-center justify-end gap-2 mt-2">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
                <button
                  onClick={() => onToggleFavorite(message.id)}
                  className={`text-xs opacity-70 hover:opacity-100 transition-opacity ${
                    message.sender === "user" ? "text-white" : ""
                  }`}
                >
                  <Star
                    className={`h-3 w-3 ${
                      message.isFavorite ? "fill-yellow-400 stroke-yellow-400" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            {message.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-green-500" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-green-500" />
            </div>
            <div className="glass-card max-w-[85%] rounded-2xl p-4 ml-2">
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