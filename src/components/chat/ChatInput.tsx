import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

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

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  return (
    <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onVoiceRecord}
          className={cn(
            "flex-shrink-0",
            isRecording && "bg-red-100 text-red-500 dark:bg-red-900/20"
          )}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="min-h-[44px] max-h-[200px] resize-none"
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
          className="flex-shrink-0"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}