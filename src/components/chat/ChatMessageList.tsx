
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { ChatMessage } from "@/types/chat"
import { DonaAvatar } from "./DonaAvatar"
import { UserAvatar } from "./UserAvatar"

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={cn(
            "flex items-start gap-3 animate-fade-in",
            message.sender === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          {message.sender === "ai" ? <DonaAvatar /> : <UserAvatar />}
          
          <div 
            className={cn(
              "relative max-w-[80%] rounded-2xl p-4",
              message.sender === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-card/50 backdrop-blur-sm border"
            )}
          >
            <div className="text-sm leading-relaxed">
              {formatText(message.text)}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start gap-3">
          <DonaAvatar />
          <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 max-w-[80%] animate-pulse">
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
