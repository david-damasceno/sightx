
import { useState, useRef, useEffect } from "react"
import { ChatInput } from "./ChatInput"
import { ChatMessageList } from "./ChatMessageList"
import { Button } from "@/components/ui/button"
import { Loader2, Menu } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

interface ChatInterfaceProps {
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
  onOpenSidebar: () => void
  isSidebarCollapsed: boolean
}

export function ChatInterface({
  selectedChat,
  onSelectChat,
  onOpenSidebar,
  isSidebarCollapsed
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Mock messages - seria substituído por dados reais
  const [messages, setMessages] = useState<Array<{
    id: string
    sender: "user" | "ai"
    text: string
    timestamp: Date
  }>>([])

  // Carregar mensagens quando um chat é selecionado
  useEffect(() => {
    if (selectedChat) {
      setMessages([
        {
          id: "1",
          sender: "user",
          text: "Qual foi o desempenho das vendas no último mês?",
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: "2",
          sender: "ai",
          text: "No último mês, as vendas tiveram um aumento de 12% em comparação com o mesmo período do ano anterior. Os produtos mais vendidos foram os da categoria eletrônicos, que representaram 45% do total de vendas. Houve também um crescimento notável nas regiões Sul e Sudeste, com aumentos de 15% e 18%, respectivamente.",
          timestamp: new Date(Date.now() - 3500000)
        },
        {
          id: "3",
          sender: "user",
          text: "Quais são as principais tendências observadas?",
          timestamp: new Date(Date.now() - 1800000)
        },
        {
          id: "4",
          sender: "ai",
          text: "As principais tendências observadas incluem:\n\n1. Aumento nas compras por dispositivos móveis (crescimento de 22%)\n2. Maior preferência por entregas rápidas (mesmo dia/próximo dia)\n3. Crescimento nas vendas de produtos sustentáveis/ecológicos\n4. Aumento na frequência de compras, mas com valor médio menor\n5. Maior engajamento com programas de fidelidade",
          timestamp: new Date(Date.now() - 1700000)
        }
      ])
    } else {
      setMessages([])
    }
  }, [selectedChat])

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return

    // Adicionar mensagem do usuário
    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user" as const,
      text: inputMessage,
      timestamp: new Date()
    }
    
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // Simular resposta da IA após um pequeno delay
    setTimeout(() => {
      const aiMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai" as const,
        text: `Analisando sua pergunta: "${inputMessage}"\n\nCom base nos dados disponíveis, posso informar que houve um crescimento significativo nesta área durante o último trimestre. Os indicadores mostram uma tendência positiva, especialmente em relação aos mercados regionais.`,
        timestamp: new Date()
      }
      
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 2000)
  }

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    // Lógica para iniciar/parar gravação de voz
  }

  // Tela de boas-vindas quando nenhum chat está selecionado
  if (!selectedChat && !isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 px-4 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <svg 
            className="w-10 h-10 text-primary" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M9 2H15C16.1046 2 17 2.89543 17 4V4C17 5.10457 16.1046 6 15 6H9C7.89543 6 7 5.10457 7 4V4C7 2.89543 7.89543 2 9 2Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M8 22C5.79086 22 4 20.2091 4 18V13C4 10.7909 5.79086 9 8 9H16C18.2091 9 20 10.7909 20 13V18C20 20.2091 18.2091 22 16 22H8Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 17C13.6569 17 15 15.6569 15 14C15 12.3431 13.6569 11 12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">IA Insights</h2>
          <p className="text-muted-foreground max-w-md">
            Explore seus dados com a ajuda da nossa IA. Faça perguntas, obtenha insights e descubra tendências que impulsionarão seu negócio.
          </p>
        </div>
        <div className="max-w-sm w-full">
          <Button 
            onClick={() => {
              const newChatId = `chat-${Date.now()}`
              onSelectChat(newChatId)
            }}
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
            <h2 className="text-sm font-medium">
              {selectedChat === "chat-1" && "Análise de vendas de janeiro"}
              {selectedChat === "chat-2" && "Previsão de tendências para Q2"}
              {selectedChat === "chat-3" && "Comparativo de desempenho regional"}
              {selectedChat === "chat-4" && "Análise de campanhas de marketing"}
              {selectedChat === "chat-5" && "Insights sobre satisfação do cliente"}
            </h2>
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatMessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t bg-background/50 backdrop-blur-sm">
        <ChatInput
          inputMessage={inputMessage}
          onInputChange={setInputMessage}
          onSendMessage={handleSendMessage}
          onVoiceRecord={handleVoiceRecord}
          isRecording={isRecording}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
