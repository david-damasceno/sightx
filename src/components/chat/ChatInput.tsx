
import { useRef, useEffect } from "react"
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
      console.log("File selected:", file)
    }
  }

  return (
    <div className="p-4 bg-background/50 backdrop-blur-sm border-t safe-area-bottom">
      <div className={cn(
        "flex gap-2 mx-auto",
        isMobile ? "max-w-full" : "max-w-3xl"
      )}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileClick}
          className="flex-shrink-0 hover:bg-primary/10 text-muted-foreground rounded-full"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onVoiceRecord}
          className={cn(
            "flex-shrink-0 hover:bg-primary/10 text-muted-foreground rounded-full",
            isRecording && "bg-red-100 text-red-500 dark:bg-red-900/20"
          )}
          disabled={isLoading}
        >
          <Mic className="h-5 w-5" />
        </Button>

        <Textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem..."
          className={cn(
            "min-h-[44px] max-h-[200px] resize-none bg-white/40 dark:bg-gray-800/40 backdrop-blur-md",
            "border-purple-100/20 dark:border-purple-900/20 focus:ring-primary rounded-xl",
            "text-base md:text-sm" // Texto maior em dispositivos móveis
          )}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              onSendMessage()
            }
          }}
          disabled={isLoading}
        />
        
        <Button
          onClick={onSendMessage}
          className="flex-shrink-0 bg-primary hover:bg-primary/90 rounded-full aspect-square p-0 w-[44px] h-[44px]"
          disabled={isLoading || !inputMessage.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  )
}
