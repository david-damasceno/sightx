import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Image, Mic, Loader2 } from "lucide-react"

interface ChatInputProps {
  inputMessage: string
  onInputChange: (value: string) => void
  onSendMessage: () => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onImageUpload: () => void
  onVoiceRecord: () => void
  isRecording: boolean
  isLoading: boolean
}

export function ChatInput({
  inputMessage,
  onInputChange,
  onSendMessage,
  onFileUpload,
  onImageUpload,
  onVoiceRecord,
  isRecording,
  isLoading,
}: ChatInputProps) {
  return (
    <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
      <div className="flex gap-2 mb-2">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={onFileUpload}
          accept=".csv,.xlsx,.xls,.accdb,.json"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => document.getElementById("file-upload")?.click()}
          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onImageUpload}
          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
          disabled={isLoading}
        >
          <Image className="h-4 w-4" />
        </Button>
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
      </div>
      <div className="flex gap-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Digite sua mensagem para a DONA..."
          className="min-h-[80px] resize-none bg-background/50 backdrop-blur-sm"
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