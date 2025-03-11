
import { useState, useEffect, useRef } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useMobile } from "@/hooks/use-mobile"
import { PlusCircle, Menu, X, Brain, Search, History, Settings as SettingsIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
  const chatContainerRef = useRef<HTMLDivElement>(null)
  
  const isMobile = useMobile()
  
  useEffect(() => {
    // Em dispositivos móveis, colapsar o sidebar automaticamente
    if (isMobile) {
      setIsSidebarCollapsed(true)
    }
  }, [isMobile])

  const handleNewChat = () => {
    setSelectedChat(null)
    if (isMobile) {
      setIsMobileSidebarOpen(false)
      setActiveTab("chat")
    }
  }

  const handleMobileMenuToggle = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  // Rola para o topo quando um novo chat é iniciado
  useEffect(() => {
    if (selectedChat === null && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = 0
    }
  }, [selectedChat])

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
              <TabsTrigger value="chat" className="rounded-lg py-2">
                Chat
              </TabsTrigger>
              <TabsTrigger value="search" className="rounded-lg py-2">
                Buscar
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-lg py-2">
                Ajustes
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Conteúdo das abas */}
        <TabsContent value="chat" className="flex-1 overflow-hidden pt-0 m-0">
          {selectedChat ? (
            <div className="h-full" ref={chatContainerRef}>
              <ChatInterface
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                isSidebarCollapsed={isSidebarCollapsed}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col p-4">
              <div className="flex-1 flex flex-col items-center justify-center gap-6 pt-10 pb-20">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-medium">IA Insights</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Pergunte qualquer coisa sobre seus dados e receba insights valiosos.
                  </p>
                </div>
                
                <Button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 rounded-full shadow-md"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Iniciar Nova Conversa</span>
                </Button>
              </div>
              
              {/* Histórico de conversas recentes */}
              <div className="mt-auto">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Conversas recentes</h3>
                <div className="space-y-2">
                  {/* Conversas seriam renderizadas aqui */}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 gap-2"
                    onClick={() => setSelectedChat("chat-1")}
                  >
                    <History className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate">Análise de vendas de janeiro</div>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 gap-2"
                    onClick={() => setSelectedChat("chat-2")}
                  >
                    <History className="h-4 w-4 flex-shrink-0" />
                    <div className="truncate">Previsão de tendências para Q2</div>
                  </Button>
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
            {/* Resultados da busca seriam mostrados aqui */}
            <p className="text-center text-sm text-muted-foreground py-10">
              {searchQuery ? "Nenhum resultado encontrado" : "Digite para buscar"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 overflow-auto p-4 m-0">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="text-sm font-medium mb-2">Preferências de IA</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Personalize como a IA responde às suas perguntas.
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Modelo da IA</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Histórico de Conversas</span>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2 h-auto py-3">
                  <SettingsIcon className="h-4 w-4" />
                  <span>Configurações Avançadas</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Menu lateral para dispositivos móveis */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[320px] p-0">
            <ChatSidebar
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId)
                setIsMobileSidebarOpen(false)
                setActiveTab("chat")
              }}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onNewChat={handleNewChat}
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
        <div className="flex gap-0 md:gap-4 h-full rounded-none md:rounded-2xl border-0 md:border bg-white/40 dark:bg-gray-900/40 backdrop-blur-md md:shadow-lg">
          {/* Mobile Menu Button and New Chat Button */}
          {isMobile && (
            <div className="fixed top-4 left-4 z-40 flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleMobileMenuToggle}
                className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-md border border-purple-100/30 dark:border-purple-900/30"
              >
                {isMobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleNewChat}
                className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md shadow-md border border-purple-100/30 dark:border-purple-900/30"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Novo Chat</span>
              </Button>
            </div>
          )}

          {/* Sidebar for desktop and mobile */}
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
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId)
                if (isMobile) {
                  setIsMobileSidebarOpen(false)
                }
              }}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => !isMobile && setIsSidebarCollapsed(!isSidebarCollapsed)}
              onNewChat={handleNewChat}
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
              onSelectChat={setSelectedChat}
              onOpenSidebar={() => isMobile ? setIsMobileSidebarOpen(true) : setIsSidebarCollapsed(false)}
              isSidebarCollapsed={isSidebarCollapsed}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
