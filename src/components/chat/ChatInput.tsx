import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Mic, Loader2, Paperclip } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      // TODO: Implementar lógica de upload do arquivo
      console.log("File selected:", file)
    }
  }

  return (
    <div className="p-4 bg-background/50 backdrop-blur-sm border-t">
      <div className="flex gap-2 max-w-4xl mx-auto">
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
          className="flex-shrink-0 hover:bg-primary/10"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onVoiceRecord}
          className={cn(
            "flex-shrink-0 hover:bg-primary/10",
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
          className="min-h-[44px] max-h-[200px] resize-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100/20 dark:border-purple-900/20 focus:ring-primary"
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
          className="flex-shrink-0 bg-primary hover:bg-primary/90"
          disabled={isLoading}
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