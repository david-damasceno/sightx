
import { useState, useRef, useEffect } from "react"
import { ChatInput } from "./ChatInput"
import { ChatMessageList } from "./ChatMessageList"
import { Button } from "@/components/ui/button"
import { Loader2, Menu, Brain } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { AISettings } from "@/components/settings/AISettings"
import { ChatMessage, Chat } from "@/types/chat"
import { addMessageToChat, sendMessageToAI } from "@/services/chatService"
import { toast } from "sonner"

interface ChatInterfaceProps {
  selectedChat: string | null
  chat: Chat | null
  onSelectChat: (chatId: string | null) => void
  onOpenSidebar: () => void
  isSidebarCollapsed: boolean
  onChatUpdated: () => void
}

export function ChatInterface({
  selectedChat,
  chat,
  onSelectChat,
  onOpenSidebar,
  isSidebarCollapsed,
  onChatUpdated
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Carregar mensagens quando um chat é selecionado
  const messages = chat?.messages || []

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Garantir que o componente é renderizado corretamente em dispositivos móveis
  useEffect(() => {
    const handleResize = () => {
      // Forçar uma atualização da UI
      setInputMessage(prev => prev)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !selectedChat || selectedChat === 'settings') return

    try {
      // Adicionar mensagem do usuário
      const userMessage = await addMessageToChat(selectedChat, {
        sender: "user",
        text: inputMessage
      })
      
      setInputMessage("")
      setIsLoading(true)
      onChatUpdated()

      // Obter resposta da IA
      const chatContext = messages.length > 0 
        ? messages.slice(-10).map(m => `${m.sender === 'user' ? 'Usuário' : 'IA'}: ${m.text}`).join('\n')
        : '';

      const aiResponse = await sendMessageToAI(inputMessage, chatContext)
      
      // Adicionar resposta da IA ao chat
      await addMessageToChat(selectedChat, {
        sender: "ai",
        text: aiResponse
      })
      
      onChatUpdated()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro ao processar sua mensagem")
      console.error("Erro ao processar mensagem:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast.info("Funcionalidade de gravação em desenvolvimento")
    }
  }

  // Mostrar configurações quando selectedChat for 'settings'
  if (selectedChat === 'settings') {
    return (
      <div className="flex flex-col h-full p-4 md:p-6">
        <AISettings onSaved={() => onSelectChat(null)} />
      </div>
    )
  }

  // Tela de boas-vindas quando nenhum chat está selecionado
  if (!selectedChat && !isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Brain className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">IA Insights</h2>
          <p className="text-muted-foreground max-w-md">
            Explore seus dados com a ajuda da nossa IA. Faça perguntas, obtenha insights e descubra tendências que impulsionarão seu negócio.
          </p>
        </div>
        <div className="max-w-sm w-full">
          <Button 
            onClick={() => onSelectChat('new')}
            className="w-full gap-2"
          >
            Iniciar uma nova conversa
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-6">
          <div className="bg-card/40 backdrop-blur-sm p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Análise de Dados</h3>
            <p className="text-sm text-muted-foreground">
              Pergunte sobre tendências, padrões e insights em seus dados.
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Previsões</h3>
            <p className="text-sm text-muted-foreground">
              Obtenha previsões sobre métricas de negócios e tendências futuras.
            </p>
          </div>
          <div className="bg-card/40 backdrop-blur-sm p-4 rounded-lg border">
            <h3 className="font-medium mb-2">Recomendações</h3>
            <p className="text-sm text-muted-foreground">
              Receba sugestões personalizadas para melhorar seu desempenho.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Para dispositivos móveis e quando um chat está selecionado
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {selectedChat && !isMobile && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSidebar}
                className="h-8 w-8 rounded-md"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-sm font-medium truncate">
              {chat?.title || "Conversa"}
            </h2>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <ChatMessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
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
