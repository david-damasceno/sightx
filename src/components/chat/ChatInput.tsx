
import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, Paperclip, Image, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log("Arquivo selecionado:", file)
      toast.info("Funcionalidade de anexo em desenvolvimento")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputMessage.trim()) {
        onSendMessage()
      }
    }
  }

  const handleEmojiClick = () => {
    toast.info("Seletor de emojis em desenvolvimento")
  }

  return (
    <div className="p-4 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-md border-t safe-area-bottom">
      <div className={cn(
        "flex flex-col max-w-3xl mx-auto relative",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        
        <div className="flex items-end gap-3 relative">
          {/* Botões de ação à esquerda */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileClick}
              className="flex-shrink-0 h-11 w-11 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-primary/10 text-muted-foreground"
              disabled={isLoading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEmojiClick}
              className="flex-shrink-0 h-11 w-11 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-primary/10 text-muted-foreground hidden md:flex"
              disabled={isLoading}
            >
              <Smile className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileClick}
              className="flex-shrink-0 h-11 w-11 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-primary/10 text-muted-foreground hidden md:flex"
              disabled={isLoading}
            >
              <Image className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Campo de entrada e botão de envio */}
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Digite sua mensagem para a DONA..."
              onKeyDown={handleKeyDown}
              className={cn(
                "min-h-[56px] max-h-[120px] pr-16 resize-none",
                "bg-white/90 dark:bg-gray-800/80 backdrop-blur-md",
                "border-primary/10 dark:border-primary/20 focus-visible:ring-primary/20",
                "rounded-2xl py-4 px-6",
                "text-base md:text-sm",
                "placeholder:text-muted-foreground/70 shadow-md",
                "transition-all duration-200 ease-in-out"
              )}
              disabled={isLoading}
            />
            
            <div className="absolute right-2 bottom-0 flex items-center h-14 px-2">
              <Button
                onClick={() => inputMessage.trim() && onSendMessage()}
                className={cn(
                  "flex-shrink-0 rounded-full",
                  "h-11 w-11 p-0",
                  "bg-gradient-to-r from-blue-600 to-purple-600",
                  "hover:from-blue-700 hover:to-purple-700",
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
    </div>
  )
}
