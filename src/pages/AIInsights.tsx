
import { useState, useEffect, useRef } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useMobile } from "@/hooks/use-mobile"
import { PlusCircle, Menu, X, Brain, Search, History, Settings as SettingsIcon, ChevronLeft, FileText, Database, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { loadChats, createChat, loadChat } from "@/services/chatService"
import { Chat } from "@/types/chat"
import { toast } from "sonner"
import { InsightsHeader } from "@/components/insights/InsightsHeader"
import { InsightsMetrics } from "@/components/insights/InsightsMetrics"
import { InsightsTrends } from "@/components/insights/InsightsTrends"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const isMobile = useMobile()
  
  // Carregar lista de chats quando o componente é montado
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true)
        const chatsList = await loadChats()
        setChats(chatsList)
      } catch (error) {
        console.error("Erro ao carregar conversas:", error)
        toast.error("Não foi possível carregar o histórico de conversas")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchChats()
  }, [])

  // Carregar um chat específico quando selecionado
  useEffect(() => {
    const fetchChat = async () => {
      if (selectedChat && selectedChat !== 'settings' && selectedChat !== 'new') {
        try {
          const chat = await loadChat(selectedChat)
          setCurrentChat(chat)
        } catch (error) {
          console.error(`Erro ao carregar conversa ${selectedChat}:`, error)
          toast.error("Não foi possível carregar esta conversa")
        }
      } else {
        setCurrentChat(null)
      }
    }
    
    fetchChat()
  }, [selectedChat])
  
  useEffect(() => {
    // Em dispositivos móveis, colapsar o sidebar automaticamente
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  const handleNewChat = async () => {
    try {
      const newChat = await createChat()
      await refreshChats()
      setSelectedChat(newChat.id)
      setActiveTab("chat")
      if (isMobile) {
        setIsMobileSidebarOpen(false)
      }
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error)
      toast.error("Não foi possível criar uma nova conversa")
    }
  }

  const handleChatSelect = (chatId: string) => {
    if (chatId === 'new') {
      handleNewChat()
    } else {
      setSelectedChat(chatId)
      setActiveTab("chat")
      if (isMobile) {
        setIsMobileSidebarOpen(false)
      }
    }
  }

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  const refreshChats = async () => {
    try {
      const chatsList = await loadChats()
      setChats(chatsList)
      
      // Se o chat atual ainda está na lista, recarregue-o
      if (selectedChat && selectedChat !== 'settings' && chatsList.some(c => c.id === selectedChat)) {
        const updatedChat = await loadChat(selectedChat)
        setCurrentChat(updatedChat)
      }
    } catch (error) {
      console.error("Erro ao atualizar conversas:", error)
    }
  }

  // Rola para o topo quando um novo chat é iniciado
  useEffect(() => {
    if (selectedChat === null && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0
    }
  }, [selectedChat])

  // Renderiza as sugestões de perguntas
  const renderSuggestions = () => {
    const suggestions = [
      {
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        title: "Análise de Vendas",
        questions: [
          "Quais produtos tiveram maior crescimento nas vendas este mês?",
          "Qual a previsão de receita para o próximo trimestre?",
          "Como posso melhorar a conversão de vendas?"
        ]
      },
      {
        icon: <Database className="h-5 w-5 text-blue-500" />,
        title: "Análise de Dados",
        questions: [
          "Quais são os principais insights dos últimos relatórios?",
          "Quais padrões foram identificados no comportamento dos clientes?",
          "Como estão os indicadores de desempenho comparados ao mês anterior?"
        ]
      },
      {
        icon: <FileText className="h-5 w-5 text-purple-500" />,
        title: "Relatórios",
        questions: [
          "Gere um resumo executivo do último trimestre",
          "Prepare um relatório comparativo com nossos concorrentes",
          "Quais são as principais tendências de mercado para nosso segmento?"
        ]
      }
    ];

    return suggestions.map((category, idx) => (
      <Card key={idx} className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            {category.icon}
            {category.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {category.questions.map((question, qIdx) => (
              <Button 
                key={qIdx} 
                variant="outline" 
                className="w-full justify-start text-left text-sm h-auto py-3"
                onClick={() => {
                  setInputValue(question);
                  setActiveTab("chat");
                  handleNewChat();
                }}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    ));
  };
  
  // Estado para guardar o valor de input (usado para sugestões de perguntas)
  const [inputValue, setInputValue] = useState("");

  // Interface principal para dispositivos móveis
  if (isMobile) {
    return (
      <div className="fixed inset-0 top-16 flex flex-col bg-gradient-to-br from-background via-accent/5 to-background">
        {/* Barra superior com navegação de abas */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur-md">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between px-3 pt-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">IA Insights</h1>
              </div>
              
              <div className="flex items-center gap-2">
                {activeTab === "chat" && !selectedChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMobileMenuToggle}
                    className="h-9 w-9 rounded-full"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                
                {activeTab === "chat" && selectedChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedChat(null)}
                    className="h-9 w-9 rounded-full"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-3 px-2 pb-1">
              <TabsTrigger value="dashboard" className="rounded-lg py-2">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-lg py-2">
                Chat
              </TabsTrigger>
              <TabsTrigger value="search" className="rounded-lg py-2">
                Buscar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Conteúdo das abas */}
        <TabsContent value="dashboard" className="flex-1 overflow-auto pt-0 m-0 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-6 pb-16">
              <InsightsHeader />
              <InsightsMetrics />
              <InsightsTrends />

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Perguntas Sugeridas</h2>
                {renderSuggestions()}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="chat" className="flex-1 overflow-hidden pt-0 m-0">
          {selectedChat ? (
            <div className="h-full" ref={chatContainerRef}>
              <ChatInterface
                selectedChat={selectedChat}
                chat={currentChat}
                onSelectChat={handleChatSelect}
                onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                isSidebarCollapsed={isSidebarCollapsed}
                onChatUpdated={refreshChats}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col p-4">
              <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-6 pb-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-medium">IA Insights</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px]">
                    Pergunte qualquer coisa sobre seus dados e receba insights valiosos para impulsionar seus negócios.
                  </p>
                </div>
                
                <Button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 rounded-full shadow-md"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Iniciar Nova Conversa</span>
                </Button>

                {/* Sugestões de perguntas */}
                <div className="w-full mt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 text-center">
                    Experimente perguntar
                  </h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left text-sm h-auto py-3"
                      onClick={() => {
                        setInputValue("Quais são as principais tendências nas vendas deste mês?");
                        handleNewChat();
                      }}
                    >
                      Quais são as principais tendências nas vendas deste mês?
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left text-sm h-auto py-3"
                      onClick={() => {
                        setInputValue("Quais produtos estão com desempenho abaixo do esperado?");
                        handleNewChat();
                      }}
                    >
                      Quais produtos estão com desempenho abaixo do esperado?
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Histórico de conversas recentes */}
              <div className="mt-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Conversas recentes</h3>
                <div className="space-y-2">
                  {chats.slice(0, 3).map(chat => (
                    <Button
                      key={chat.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 gap-2"
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <History className="h-4 w-4 flex-shrink-0" />
                      <div className="truncate">{chat.title}</div>
                    </Button>
                  ))}
                  
                  {chats.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhuma conversa encontrada
                    </p>
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="search" className="flex-1 overflow-auto p-4 m-0">
          <div className="relative">
            <Input
              type="search"
              placeholder="Buscar conversas..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          
          <div className="mt-6 space-y-4">
            {/* Resultados da busca */}
            {searchQuery && (
              <div className="space-y-2">
                {chats
                  .filter(chat => 
                    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    chat.messages.some(msg => 
                      msg.text.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                  )
                  .map(chat => (
                    <Button
                      key={chat.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 gap-2"
                      onClick={() => {
                        handleChatSelect(chat.id)
                      }}
                    >
                      <History className="h-4 w-4 flex-shrink-0" />
                      <div>
                        <div className="font-medium truncate">{chat.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                  ))
                }
                
                {chats.filter(chat => 
                  chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  chat.messages.some(msg => 
                    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                ).length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-10">
                    Nenhum resultado encontrado
                  </p>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <p className="text-center text-sm text-muted-foreground py-10">
                Digite para buscar
              </p>
            )}
          </div>
        </TabsContent>

        {/* Menu lateral para dispositivos móveis */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[320px] p-0">
            <ChatSidebar
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                handleChatSelect(chatId)
              }}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onNewChat={handleNewChat}
              onChatsUpdated={refreshChats}
            />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  // Interface para desktop
  return (
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-background via-accent/5 to-background">
      <div className="h-full p-0 md:p-4">
        {!selectedChat && (
          <div className="h-full w-full p-4 overflow-auto">
            <div className="max-w-7xl mx-auto space-y-6 pb-16">
              <InsightsHeader />
              <InsightsMetrics />
              <InsightsTrends />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="col-span-1 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Converse com a IA
                    </CardTitle>
                    <CardDescription>
                      Pergunte à nossa IA sobre seus dados e obtenha insights personalizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full sm:max-w-md">
                        <Button 
                          onClick={handleNewChat} 
                          className="w-full flex items-center gap-2 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          <PlusCircle className="h-5 w-5" />
                          <span>Iniciar Nova Conversa</span>
                        </Button>
                      </div>
                      
                      {chats.length > 0 && (
                        <div className="w-full sm:max-w-md flex items-center gap-3">
                          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                            Conversas recentes:
                          </div>
                          <div className="flex items-center gap-2 overflow-x-auto py-2 max-w-full">
                            {chats.slice(0, 3).map(chat => (
                              <Button
                                key={chat.id}
                                variant="outline"
                                size="sm"
                                className="whitespace-nowrap"
                                onClick={() => handleChatSelect(chat.id)}
                              >
                                <History className="h-3.5 w-3.5 mr-1" />
                                {chat.title.length > 20 ? chat.title.substring(0, 20) + '...' : chat.title}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <div className="col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Insights destacados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Crescimento de vendas</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            As vendas cresceram 22% em comparação ao mês anterior, principalmente na região sul.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Comportamento de clientes</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Clientes entre 25-34 anos têm maior taxa de conversão em produtos tecnológicos.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Relatório de eficiência</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            A eficiência operacional aumentou 15% após implementação do novo sistema.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Perguntas sugeridas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          "Quais produtos tiveram melhor desempenho este mês?",
                          "Como está a satisfação dos clientes em relação à qualidade?",
                          "Quais são as principais reclamações dos clientes?",
                          "Qual a previsão de vendas para o próximo trimestre?",
                          "Quais regiões apresentam maior potencial de crescimento?"
                        ].map((question, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => {
                              setInputValue(question);
                              handleNewChat();
                            }}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {selectedChat && (
          <div className="flex gap-0 md:gap-4 h-full rounded-none md:rounded-2xl border-0 md:border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md md:shadow-lg">
            {/* Sidebar for desktop */}
            <aside 
              className={cn(
                "transition-all duration-300 ease-in-out",
                isMobile 
                  ? cn(
                      "fixed inset-y-0 top-16 left-0 z-30 w-full max-w-[280px] bg-background/95 backdrop-blur-md border-r border-border shadow-xl",
                      isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )
                  : cn(
                      isSidebarCollapsed ? 'w-0 md:w-12 overflow-hidden' : 'w-full md:w-80'
                    )
              )}
            >
              <ChatSidebar 
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={handleChatSelect}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => !isMobile && setIsSidebarCollapsed(!isSidebarCollapsed)}
                onNewChat={handleNewChat}
                onChatsUpdated={refreshChats}
              />
            </aside>

            {/* Main chat area */}
            <main className={cn(
              "flex-1 relative rounded-none md:rounded-2xl overflow-hidden",
              isSidebarCollapsed || isMobile ? 'border-l-0 md:border-l' : 'border-l-0 md:border-l',
              "bg-white/20 dark:bg-gray-900/20 backdrop-blur-md"
            )}>
              <ChatInterface 
                selectedChat={selectedChat}
                chat={currentChat}
                onSelectChat={(chatId) => {
                  if (chatId === null) {
                    setSelectedChat(null);
                  } else {
                    handleChatSelect(chatId);
                  }
                }}
                onOpenSidebar={() => isMobile ? setIsMobileSidebarOpen(true) : setIsSidebarCollapsed(false)}
                isSidebarCollapsed={isSidebarCollapsed}
                onChatUpdated={refreshChats}
              />
            </main>
          </div>
        )}
      </div>
    </div>
  )
}
