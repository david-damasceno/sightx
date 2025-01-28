import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star } from "lucide-react"

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
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-4 animate-fade-in ${
                message.sender === "user"
                  ? "bg-purple-500 text-white"
                  : "glass-card"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => onToggleFavorite(message.id)}
                  className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Star
                    className={`h-3 w-3 ${
                      message.isFavorite ? "fill-yellow-400" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-card max-w-[85%] rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}