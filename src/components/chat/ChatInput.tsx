
import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

interface ChatInputProps {
  inputMessage: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  isLoading: boolean
}

export function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputMessage.trim()) {
        onSendMessage()
      }
    }
  }

  return (
    <div className="p-4 pb-6 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-md border-t border-purple-100/20 dark:border-purple-900/20 safe-area-bottom">
      <div className={cn(
        "flex flex-col max-w-3xl mx-auto relative",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        <div className="relative flex-1">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem para a DONA..."
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[56px] max-h-[120px] pr-16 resize-none mb-2",
              "bg-white/90 dark:bg-gray-800/80 backdrop-blur-md",
              "border-purple-200/30 dark:border-purple-700/30 focus-visible:ring-purple-300/30 dark:focus-visible:ring-purple-500/20",
              "rounded-2xl py-4 px-6 pb-6", 
              "text-base md:text-sm",
              "placeholder:text-muted-foreground/70",
              "shadow-sm hover:shadow-md transition-all duration-200 ease-in-out"
            )}
            disabled={isLoading}
          />
          
          <div className="absolute right-2 bottom-0 flex items-center h-14 px-2">
            <Button
              onClick={() => inputMessage.trim() && onSendMessage()}
              className={cn(
                "flex-shrink-0 rounded-full",
                "h-11 w-11 p-0",
                "bg-gradient-to-r from-purple-600 to-indigo-600",
                "hover:from-purple-700 hover:to-indigo-700",
                "shadow-md hover:shadow-lg transition-all duration-200",
                "disabled:opacity-50 disabled:shadow-none disabled:from-gray-400 disabled:to-gray-500"
              )}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" fill="white" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
