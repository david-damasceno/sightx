import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface ChatMessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatMessageList({ messages, isLoading }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { profile } = useAuth()

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
              "flex gap-3 animate-fade-in",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "ai" && (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 300 187.499995" 
                  className="w-full h-full scale-150"
                >
                  <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 275c-68.5 0-125-56.5-125-125S81.5 25 150 25s125 56.5 125 125-56.5 125-125 125z" fill="#4A90E2"/>
                  <path d="M150 50c-55.225 0-100 44.775-100 100s44.775 100 100 100 100-44.775 100-100-44.775-100-100-100zm0 175c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75z" fill="#4A90E2"/>
                </svg>
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[85%] rounded-2xl p-4 shadow-md",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100/20 dark:border-purple-900/20"
              )}
            >
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </p>
            </div>

            {message.sender === "user" && (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-lg font-semibold">
                    {(profile?.full_name || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 300 187.499995" 
                className="w-full h-full scale-150"
              >
                <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 275c-68.5 0-125-56.5-125-125S81.5 25 150 25s125 56.5 125 125-56.5 125-125 125z" fill="#4A90E2"/>
                <path d="M150 50c-55.225 0-100 44.775-100 100s44.775 100 100 100 100-44.775 100-100-44.775-100-100-100zm0 175c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75z" fill="#4A90E2"/>
              </svg>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-purple-100/20 dark:border-purple-900/20 max-w-[85%] rounded-2xl p-4 ml-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
