
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Paperclip, Image, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"

interface ChatInputProps {
  inputMessage: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onVoiceRecord: () => void
  isRecording: boolean
  isLoading: boolean
}

export function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  onVoiceRecord,
  isRecording,
  isLoading,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()
  const { addToast } = useToast()
  const [isFocused, setIsFocused] = useState(false)

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
      addToast({
        title: "Arquivo anexado",
        description: `${file.name} foi anexado com sucesso.`,
        variant: "success",
        duration: 3000
      })
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
    addToast({
      title: "Funcionalidade em breve",
      description: "O seletor de emojis estará disponível em breve!",
      variant: "info",
      duration: 3000
    })
  }

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-xl border-t safe-area-bottom">
      <div className={cn(
        "flex flex-col gap-4 mx-auto",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        {/* Área principal de input */}
        <div className={cn(
          "relative flex flex-col gap-2",
          "bg-card/30 backdrop-blur-sm rounded-2xl p-2",
          "border border-muted-foreground/10",
          "transition-all duration-200 ease-in-out",
          isFocused && "shadow-lg border-primary/20"
        )}>
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[60px] max-h-[160px] transition-all",
              "py-3 px-4",
              "bg-transparent",
              "border-0 shadow-none resize-none overflow-hidden",
              "text-base leading-relaxed",
              "placeholder:text-muted-foreground/70",
              "focus-visible:ring-0 focus-visible:outline-none"
            )}
            disabled={isLoading}
          />
          
          {/* Barra de ações e botão de envio */}
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
              />
              
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFileClick}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-background/80 hover:text-primary"
                  disabled={isLoading}
                >
                  <Paperclip className="h-[18px] w-[18px]" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEmojiClick}
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-background/80 hover:text-primary"
                  disabled={isLoading}
                >
                  <Smile className="h-[18px] w-[18px]" />
                </Button>
                
                <Button
                  variant={isRecording ? "destructive" : "ghost"}
                  size="icon"
                  onClick={onVoiceRecord}
                  className={cn(
                    "h-9 w-9 rounded-full text-muted-foreground hover:bg-background/80 hover:text-primary",
                    isRecording && "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                  )}
                  disabled={isLoading}
                >
                  <Mic className="h-[18px] w-[18px]" />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground/50 hidden sm:block">
              {inputMessage.length > 0 ? `${inputMessage.length} caracteres` : "Enter para enviar, Shift+Enter para quebrar linha"}
            </div>
            
            <Button
              onClick={() => inputMessage.trim() && onSendMessage()}
              className={cn(
                "flex-shrink-0 rounded-full",
                "h-9 w-9 p-0",
                "transition-all duration-200",
                inputMessage.trim() 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" 
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Texto informativo para mobile */}
        <div className="text-xs text-center text-muted-foreground/50 sm:hidden">
          Pressione Enter para enviar
        </div>
      </div>
    </div>
  )
}
