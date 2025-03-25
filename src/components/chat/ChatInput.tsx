
import React, { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

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

  return (
    <div className="p-2 md:p-4 bg-background/95 backdrop-blur-sm border-t safe-area-bottom">
      <div className={cn(
        "flex items-end gap-2 mx-auto relative",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        
        <div className="relative flex-1">
          <div className="absolute left-2 bottom-1 flex items-center gap-1 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFileClick}
              className="flex-shrink-0 h-8 w-8 hover:bg-primary/10 text-muted-foreground rounded-full"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onVoiceRecord}
              className={cn(
                "flex-shrink-0 h-8 w-8 hover:bg-primary/10 text-muted-foreground rounded-full",
                isRecording && "bg-red-100 text-red-500 dark:bg-red-900/20"
              )}
              disabled={isLoading}
            >
              <Mic className="h-4 w-4" />
            </Button>
          </div>
          
          <Textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={handleKeyDown}
            className={cn(
              "min-h-[40px] max-h-[100px] pl-20 pr-12 resize-none",
              "bg-white/40 dark:bg-gray-800/40 backdrop-blur-md",
              "border-primary/10 dark:border-primary/20 focus-visible:ring-primary/20",
              "rounded-2xl py-2 px-4",
              "text-base md:text-sm",
              "placeholder:text-muted-foreground/70"
            )}
            disabled={isLoading}
          />
          
          <Button
            onClick={() => inputMessage.trim() && onSendMessage()}
            className={cn(
              "absolute right-2 bottom-1",
              "flex-shrink-0 bg-primary hover:bg-primary/90 rounded-xl",
              "h-8 w-8 p-0"
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
    </div>
  )
}
