
import { useRef, useEffect } from "react"
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
        "flex flex-col gap-3 mx-auto",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        {/* Botões de ação */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileClick}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-muted-foreground bg-background/80 hover:bg-primary/10 hover:text-primary border-muted"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Anexar</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEmojiClick}
              className="flex items-center gap-1.5 h-9 px-3 rounded-full text-muted-foreground bg-background/80 hover:bg-primary/10 hover:text-primary border-muted"
              disabled={isLoading}
            >
              <Smile className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Emoji</span>
            </Button>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={onVoiceRecord}
              className={cn(
                "flex items-center gap-1.5 h-9 px-3 rounded-full text-muted-foreground bg-background/80 hover:bg-primary/10 hover:text-primary border-muted",
                isRecording && "bg-red-500/10 text-red-500 border-red-200 dark:border-red-800 hover:bg-red-500/20 hover:text-red-600"
              )}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{isRecording ? "Gravando..." : "Gravar"}</span>
            </Button>
          </div>
          
          {/* Adicione aqui mais botões de ação se necessário */}
        </div>
        
        {/* Área principal de input */}
        <div className="relative flex items-end">
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
            className={cn(
              "pr-14 resize-none overflow-hidden transition-all",
              "min-h-[56px] max-h-[200px] py-3.5 px-4",
              "bg-card dark:bg-card/80 backdrop-blur-sm",
              "rounded-2xl border-muted-foreground/20",
              "text-base leading-relaxed",
              "placeholder:text-muted-foreground/70",
              "focus-visible:ring-1 focus-visible:ring-primary/30",
              "shadow-sm"
            )}
            disabled={isLoading}
          />
          
          <Button
            onClick={() => inputMessage.trim() && onSendMessage()}
            className={cn(
              "absolute right-2 bottom-2",
              "flex-shrink-0 rounded-xl",
              "h-10 w-10 p-0",
              inputMessage.trim() 
                ? "bg-primary hover:bg-primary/90" 
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Texto informativo */}
        <div className="text-xs text-center text-muted-foreground/70 px-2">
          Pressione Enter para enviar, Shift+Enter para quebrar linha
        </div>
      </div>
    </div>
  )
}
