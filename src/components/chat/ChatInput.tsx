import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2 } from "lucide-react"

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
  return (
    <div className="p-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onVoiceRecord}
          className={`hover:bg-purple-50 dark:hover:bg-purple-900/20 ${
            isRecording ? "bg-red-100 text-red-500 dark:bg-red-900/20" : ""
          }`}
          disabled={isLoading}
        >
          <Mic className="h-4 w-4" />
        </Button>
        <Textarea
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem para a DONA..."
          className="min-h-[60px] resize-none bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
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
          className="bg-purple-500 hover:bg-purple-600 transition-colors"
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