
import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Paperclip, Image, Smile, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "sonner"

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
    <div className="p-3 md:p-4 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
      <div className={cn(
        "flex items-end gap-2 mx-auto relative",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        />
        
        <div className="relative flex-1">
          <div className="absolute left-0 bottom-0 flex items-center h-14 px-4 gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileClick}
              className="flex-shrink-0 h-9 w-9 rounded-full bg-background/50 hover:bg-primary/10 text-muted-foreground"
              disabled={isLoading}
            >
              <Paperclip className="h-[18px] w-[18px]" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEmojiClick}
              className="flex-shrink-0 h-9 w-9 rounded-full bg-background/50 hover:bg-primary/10 text-muted-foreground hidden md:flex"
              disabled={isLoading}
            >
              <Smile className="h-[18px] w-[18px]" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileClick}
              className="flex-shrink-0 h-9 w-9 rounded-full bg-background/50 hover:bg-primary/10 text-muted-foreground hidden md:flex"
              disabled={isLoading}
            >
              <Image className="h-[18px] w-[18px]" />
            </Button>
          </div>
          
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem para a DONA..."
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[56px] max-h-[120px] pl-36 md:pl-40 pr-16 resize-none",
              "bg-white/80 dark:bg-gray-800/60 backdrop-blur-md",
              "border-primary/10 dark:border-primary/20 focus-visible:ring-primary/20",
              "rounded-full md:rounded-2xl py-4 px-6",
              "text-base md:text-sm",
              "placeholder:text-muted-foreground/70 shadow-sm",
              "transition-all duration-200 ease-in-out",
              "focus:shadow-md"
            )}
            disabled={isLoading}
          />
          
          <div className="absolute right-2 bottom-0 flex items-center h-14 px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onVoiceRecord}
              className={cn(
                "flex-shrink-0 h-10 w-10 rounded-full mr-1",
                "bg-background/50 hover:bg-primary/10",
                "text-muted-foreground transition-colors",
                isRecording && "bg-red-100 text-red-500 dark:bg-red-900/20"
              )}
              disabled={isLoading}
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={() => inputMessage.trim() && onSendMessage()}
              className={cn(
                "flex-shrink-0 rounded-full",
                "h-10 w-10 p-0",
                "bg-gradient-to-r from-blue-600 to-purple-600",
                "hover:from-blue-700 hover:to-purple-700",
                "shadow-md transition-all duration-200",
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
      
      {isRecording && (
        <div className="mt-2 flex items-center justify-center gap-2 animate-pulse">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
          <span className="text-sm text-red-500 font-medium">Gravando...</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onVoiceRecord}
            className="h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/20"
          >
            <X className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      )}
    </div>
  )
}
