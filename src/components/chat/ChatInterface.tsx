import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Image, 
  Send, 
  Paperclip, 
  Mic, 
  Sparkles, 
  Brain,
  Star,
  Lightbulb,
  ArrowRight
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isFavorite?: boolean
  insight?: {
    type: "suggestion" | "alert" | "analysis"
    impact: "high" | "medium" | "low"
    category: string
  }
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

    // Simular resposta da IA com um insight
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Baseado na sua pergunta, identifiquei um padrão interessante nos dados de vendas.",
        sender: "ai",
        timestamp: new Date(),
        insight: {
          type: "analysis",
          impact: "high",
          category: "Vendas"
        }
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

  const getInsightIcon = (type?: string) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
      case "alert":
        return <Brain className="h-4 w-4 text-red-500" />
      case "analysis":
        return <Brain className="h-4 w-4 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <Card className="flex flex-col flex-1 bg-card rounded-lg border shadow-sm hover-card glass-card">
      <div className="p-4 border-b flex items-center justify-between bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          <div>
            <h2 className="text-lg font-semibold">Chat com DONA</h2>
            <p className="text-sm text-muted-foreground">Sua assistente virtual inteligente</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-purple-500 hover:text-purple-600 button-transition"
          onClick={() => {
            toast({
              title: "Gerando imagem",
              description: "Processando sua solicitação..."
            })
          }}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Gerar Imagem
        </Button>
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
                className={`max-w-[80%] rounded-lg p-4 animate-in hover-card ${
                  message.sender === "user"
                    ? "bg-purple-500 text-white ml-12"
                    : "bg-white dark:bg-gray-800 mr-12 glass-card"
                }`}
              >
                {message.sender === "ai" && message.insight && (
                  <div className="flex items-center gap-2 mb-2">
                    {getInsightIcon(message.insight.type)}
                    <Badge variant="outline" className="text-xs">
                      {message.insight.category}
                    </Badge>
                    <Badge 
                      variant={message.insight.impact === "high" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {message.insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                )}
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <button
                    onClick={() => toggleFavorite(message.id)}
                    className="text-xs opacity-70 hover:opacity-100 transition-opacity"
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
                  {message.sender === "ai" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        toast({
                          title: "Insight salvo",
                          description: "O insight foi adicionado à sua lista"
                        })
                      }}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Salvar Insight
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex gap-2 mb-2">
          <Button
            variant="outline"
            size="icon"
            className="button-transition"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="button-transition">
            <Image className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsRecording(!isRecording)
              toast({
                title: isRecording ? "Gravação finalizada" : "Gravando...",
                description: isRecording ? "Processando sua mensagem..." : "Fale sua mensagem"
              })
            }}
            className={`button-transition ${isRecording ? "bg-red-100 text-red-500" : ""}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                toast({
                  title: "Arquivo anexado",
                  description: `${file.name} foi anexado ao chat.`
                })
              }
            }}
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem para a DONA..."
            className="min-h-[80px] resize-none dark:bg-gray-800/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button 
            onClick={handleSendMessage} 
            className="bg-purple-500 hover:bg-purple-600 button-transition"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}