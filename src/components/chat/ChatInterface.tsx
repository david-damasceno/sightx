
import React, { useState, useRef, useEffect } from "react"
import { ChatInput } from "./ChatInput"
import { ChatMessageList } from "./ChatMessageList"
import { Button } from "@/components/ui/button"
import { Loader2, Menu, Brain } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { AISettings } from "@/components/settings/AISettings"
import { ChatMessage, Chat } from "@/types/chat"
import { addMessageToChat, sendMessageToAI } from "@/services/chatService"
import { toast } from "sonner"
import { motion } from "framer-motion"

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
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Carregar mensagens quando um chat é selecionado
  const messages = chat?.messages || []

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (inputMessage.trim() === "" || !selectedChat || selectedChat === 'settings') return

    try {
      // Adicionar mensagem do usuário
      await addMessageToChat(selectedChat, {
        sender: "user",
        text: inputMessage
      })
      
      setInputMessage("")
      setIsLoading(true)
      onChatUpdated()

      // Obter contexto da conversa atual
      const chatContext = messages.length > 0 
        ? messages.slice(-10).map(m => `${m.sender === 'user' ? 'Usuário' : 'IA'}: ${m.text}`).join('\n')
        : '';

      // Sequência de mensagens de carregamento mais interativas
      const loadingMessages = [
        "Analisando sua solicitação...",
        "Processando dados relevantes...",
        "Consultando base de conhecimento...",
        "Elaborando resposta personalizada...",
        "Finalizando análise dos dados...",
      ];
      
      let messageIndex = 0;
      const loadingInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length) {
          setLoadingMessage(loadingMessages[messageIndex]);
          messageIndex++;
        } else {
          clearInterval(loadingInterval);
        }
      }, 1500);
      
      // Enviando a mensagem para a IA, incluindo o ID do chat para contexto
      const aiResponse = await sendMessageToAI(inputMessage, chatContext, selectedChat)
      
      // Limpar o intervalo quando a resposta chegar
      clearInterval(loadingInterval);
      
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
      setLoadingMessage("")
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
      <motion.div 
        className="flex flex-col h-full p-4 md:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AISettings onSaved={() => onSelectChat(null)} />
      </motion.div>
    )
  }

  // Tela de boas-vindas quando nenhum chat está selecionado
  if (!selectedChat) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center h-full space-y-6 px-4 py-8 md:py-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </motion.div>
        <motion.div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 bg-gradient-to-br from-primary to-purple-400 bg-clip-text text-transparent">IA Insights</h2>
          <p className="text-muted-foreground max-w-md text-sm md:text-base">
            Explore seus dados com a ajuda da nossa IA. Faça perguntas, obtenha insights e descubra tendências que impulsionarão seu negócio.
          </p>
        </motion.div>
        <motion.div 
          className="max-w-sm w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => onSelectChat('new')}
            className="w-full gap-2 rounded-xl py-6 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 shadow-md"
          >
            Iniciar uma nova conversa
          </Button>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-3xl w-full mt-4 md:mt-6">
          <motion.div 
            className="bg-card/40 backdrop-blur-sm p-3 md:p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Análise de Dados</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Pergunte sobre tendências, padrões e insights em seus dados.
            </p>
          </motion.div>
          <motion.div 
            className="bg-card/40 backdrop-blur-sm p-3 md:p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Previsões</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Obtenha previsões sobre métricas de negócios e tendências futuras.
            </p>
          </motion.div>
          <motion.div 
            className="bg-card/40 backdrop-blur-sm p-3 md:p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <h3 className="font-medium mb-1 md:mb-2 text-sm md:text-base">Recomendações</h3>
            <p className="text-xs md:text-sm text-muted-foreground">
              Receba sugestões personalizadas para melhorar seu desempenho.
            </p>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  // Para dispositivos móveis e quando um chat está selecionado
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {selectedChat && !isMobile && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            {isSidebarCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenSidebar}
                className="h-8 w-8 rounded-full"
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
      <motion.div 
        className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ChatMessageList 
          messages={messages} 
          isLoading={isLoading} 
          loadingMessage={loadingMessage}
        />
        <div ref={messagesEndRef} />
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <ChatInput
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          onVoiceRecord={handleVoiceRecord}
          isRecording={isRecording}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  )
}
