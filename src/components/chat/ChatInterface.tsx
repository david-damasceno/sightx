import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-dona', {
        body: { 
          message: inputMessage,
          context: {
            organization: currentOrganization
          }
        }
      })

      if (error) throw error

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || "Desculpe, não consegui processar sua mensagem.",
        sender: "ai",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      toast({
        title: "Erro ao processar mensagem",
        description: "Não foi possível obter resposta. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    toast({
      title: isRecording ? "Gravação finalizada" : "Gravando...",
      description: isRecording ? "Processando sua mensagem..." : "Fale sua mensagem"
    })
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

  return (
    <div className="flex flex-col h-full">
      <ChatMessageList 
        messages={messages} 
        onToggleFavorite={toggleFavorite} 
        isLoading={isLoading}
      />
      <ChatInput
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={handleSendMessage}
        onVoiceRecord={handleVoiceRecord}
        isRecording={isRecording}
        isLoading={isLoading}
      />
    </div>
  )
}