
import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useMobile } from "@/hooks/use-mobile"

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
  const isMobile = useMobile()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages])

  // Formata o texto preservando quebras de linha e adicionando links
  const formatMessageText = (text: string) => {
    // Substitui URLs por links clicáveis
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const textWithLinks = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">${url}</a>`)
    
    // Preserva quebras de linha
    return textWithLinks.split('\n').map((line, i) => (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: line }} />
        {i < textWithLinks.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <ScrollArea className={cn(
      "flex-1",
      isMobile ? "px-3 py-5" : "px-4 py-6"
    )}>
      <div className={cn(
        "space-y-6",
        isMobile ? "max-w-full mx-2" : "max-w-3xl mx-auto"
      )}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 p-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 300 187.499995" 
                  className="w-full h-full scale-150"
                >
                  <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 275c-68.5 0-125-56.5-125-125S81.5 25 150 25s125 56.5 125 125-56.5 125-125 125z" fill="currentColor" className="text-primary"/>
                  <path d="M150 50c-55.225 0-100 44.775-100 100s44.775 100 100 100 100-44.775 100-100-44.775-100-100-100zm0 175c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75z" fill="currentColor" className="text-primary"/>
                </svg>
              </div>
            )}
            
            <div
              className={cn(
                "rounded-2xl p-3",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground ml-12"
                  : "bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-purple-100/20 dark:border-purple-900/20 mr-12",
                isMobile ? "max-w-[85%]" : "max-w-[75%]"
              )}
            >
              <p className={cn(
                "leading-relaxed",
                isMobile ? "text-sm" : "text-base"
              )}>
                {formatMessageText(message.content)}
              </p>
            </div>

            {message.sender === "user" && (
              <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-sm font-semibold">
                    {(profile?.full_name || "U")[0].toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 300 187.499995" 
                className="w-full h-full scale-150"
              >
                <path d="M150 0C67.157 0 0 67.157 0 150s67.157 150 150 150 150-67.157 150-150S232.843 0 150 0zm0 275c-68.5 0-125-56.5-125-125S81.5 25 150 25s125 56.5 125 125-56.5 125-125 125z" fill="currentColor" className="text-primary"/>
                <path d="M150 50c-55.225 0-100 44.775-100 100s44.775 100 100 100 100-44.775 100-100-44.775-100-100-100zm0 175c-41.355 0-75-33.645-75-75s33.645-75 75-75 75 33.645 75 75-33.645 75-75 75z" fill="currentColor" className="text-primary"/>
              </svg>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-purple-100/20 dark:border-purple-900/20 rounded-2xl p-3 ml-3 mr-12">
              <div className="flex items-center gap-1">
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
