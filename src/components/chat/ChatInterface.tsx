import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Image, FileText, Star, Send, Paperclip, Mic, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isFavorite?: boolean
}

interface ChatInterfaceProps {
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
}

export function ChatInterface({ selectedChat, onSelectChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const { toast } = useToast()

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage("")

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Olá! Eu sou a DONA, sua assistente virtual. Como posso ajudar?",
        sender: "ai",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const toggleFavorite = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, isFavorite: !msg.isFavorite }
          : msg
      )
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      toast({
        title: "Arquivo anexado",
        description: `${file.name} foi anexado ao chat.`
      })
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    toast({
      title: isRecording ? "Gravação finalizada" : "Gravando...",
      description: isRecording ? "Processando sua mensagem..." : "Fale sua mensagem"
    })
  }

  const handleGenerateImage = () => {
    toast({
      title: "Gerando imagem",
      description: "A DONA está processando sua solicitação..."
    })
  }

  return (
    <div className="flex flex-col flex-1 bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <h2 className="text-lg font-semibold">Chat com DONA</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-purple-500 hover:text-purple-600"
            onClick={handleGenerateImage}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Gerar Imagem
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 animate-in ${
                  message.sender === "user"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <p>{message.content}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                  <button
                    onClick={() => toggleFavorite(message.id)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        message.isFavorite ? "fill-yellow-400" : ""
                      }`}
                    />
                  </button>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2 mb-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceRecord}
            className={isRecording ? "bg-red-100 text-red-500" : ""}
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem para a DONA..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} className="bg-purple-500 hover:bg-purple-600">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}