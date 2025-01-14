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
}

export function ChatMessageList({ messages, onToggleFavorite }: ChatMessageListProps) {
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
              className={`max-w-[80%] rounded-lg p-3 animate-in ${
                message.sender === "user"
                  ? "bg-purple-500 text-white"
                  : "glass-card"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button
                  onClick={() => onToggleFavorite(message.id)}
                  className="text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                  <Star
                    className={`h-4 w-4 ${
                      message.isFavorite ? "fill-yellow-400" : ""
                    }`}
                  />
                </button>
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}