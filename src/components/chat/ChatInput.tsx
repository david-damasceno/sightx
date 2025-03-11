
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Paperclip, Image } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMobile()

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageClick = () => {
    imageInputRef.current?.click()
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
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
        />
        
        <input
          type="file"
          ref={imageInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div className="flex gap-1">
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
            onClick={handleImageClick}
            className="flex-shrink-0 hover:bg-primary/10 text-muted-foreground rounded-full"
            disabled={isLoading}
          >
            <Image className="h-5 w-5" />
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
        </div>

        <div className="relative flex-1">
          <ScrollArea className="max-h-32">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Digite sua mensagem..."
              className={cn(
                "min-h-[44px] resize-none bg-white/40 dark:bg-gray-800/40 backdrop-blur-md",
                "border-purple-100/20 dark:border-purple-900/20 focus:ring-primary rounded-xl",
                "text-base md:text-sm pr-12", // Espaço para o botão de enviar
                "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
                "focus:border-primary/30 dark:focus:border-primary/30",
                "placeholder:text-muted-foreground/70"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  onSendMessage()
                }
              }}
              disabled={isLoading}
              rows={1}
            />
          </ScrollArea>
          
          <Button
            onClick={onSendMessage}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "flex-shrink-0 bg-primary hover:bg-primary/90 rounded-full",
              "aspect-square p-0 w-8 h-8",
              "transition-all duration-200",
              "focus:ring-2 focus:ring-primary/30",
              !inputMessage.trim() && "opacity-50 cursor-not-allowed"
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
