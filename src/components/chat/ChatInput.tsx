import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Sparkles } from "lucide-react"

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
    <div className="p-4 border-t border-green-100/20 dark:border-emerald-900/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onVoiceRecord}
          className={cn(
            "flex-shrink-0 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors",
            isRecording ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""
          )}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="flex-shrink-0 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          disabled={isLoading}
        >
          <Sparkles className="h-4 w-4" />
        </Button>

        <Textarea
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem para a DONA..."
          className="min-h-[44px] max-h-[200px] resize-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-100/20 dark:border-emerald-900/20 focus:ring-green-500 transition-colors"
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
          className="flex-shrink-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
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