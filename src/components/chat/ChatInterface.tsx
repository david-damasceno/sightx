
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ChatMessageList } from "./ChatMessageList"
import { ChatInput } from "./ChatInput"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Bot, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface ChatMessage {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export interface ChatInterfaceProps {
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
  onOpenSidebar?: () => void
  isSidebarCollapsed?: boolean
}

export function ChatInterface({ 
  selectedChat, 
  onSelectChat, 
  onOpenSidebar, 
  isSidebarCollapsed 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()
  const isMobile = useMobile()

  const examplePrompts = [
    "Como meu negócio está comparado aos competidores?",
    "Quais tendências estou ignorando?",
    "O que poderia melhorar nas minhas vendas?",
    "Analise meus dados de clientes e sugira ações"
  ]

  const handleNewChat = () => {
    setMessages([])
    onSelectChat(null)
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim()
    if (!messageText || isLoading) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat-with-dona', {
        body: { 
          message: messageText,
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
      description: isRecording ? "Processando sua mensagem..." : "Fale sua mensagem",
      className: "bg-primary text-primary-foreground"
    })
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-accent/5 to-background rounded-xl border shadow-lg">
      {/* Tela de boas-vindas quando não há mensagens */}
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="mb-6 bg-primary/10 p-4 rounded-full">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Como posso ajudar hoje?</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            DONA é uma assistente inteligente que analisa seus dados e fornece insights valiosos para seu negócio.
          </p>
          
          <div className="grid grid-cols-1 gap-3 w-full max-w-md">
            {examplePrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="text-left justify-start p-4 h-auto border border-primary/20 hover:border-primary/50"
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          
          {isMobile && (
            <div className="absolute bottom-28 md:bottom-32 left-0 right-0 flex justify-center">
              <Button
                variant="outline"
                onClick={handleNewChat}
                className="rounded-full flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Novo Chat</span>
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Lista de mensagens */}
      {messages.length > 0 && (
        <ChatMessageList 
          messages={messages}
          isLoading={isLoading}
        />
      )}
      
      {/* Input de mensagem */}
      <ChatInput
        inputMessage={inputMessage}
        onInputChange={setInputMessage}
        onSendMessage={() => handleSendMessage()}
        onVoiceRecord={handleVoiceRecord}
        isRecording={isRecording}
        isLoading={isLoading}
      />
    </div>
  )
}
