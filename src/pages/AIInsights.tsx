
import React, { useState, useEffect, useRef } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { useMobile } from "@/hooks/use-mobile"
import { PlusCircle, Menu, X, Brain, Search, History, Settings as SettingsIcon, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { loadChats, createChat, loadChat } from "@/services/chatService"
import { Chat } from "@/types/chat"
import { toast } from "sonner"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("chat")
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
      if (isMobile) {
        setIsMobileSidebarOpen(false)
        setActiveTab("chat")
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

  // Interface principal para dispositivos móveis
  if (isMobile) {
    return (
      <div className="fixed inset-0 top-16 flex flex-col bg-gradient-to-br from-background via-purple-50/5 dark:via-purple-950/5 to-background">
        {/* Barra superior com navegação de abas */}
        <div className="border-b border-border/40 bg-background/95 backdrop-blur-md">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="flex items-center justify-between px-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">SightX A.I</h1>
              </div>
              
              <div className="flex items-center gap-2">
                {activeTab === "chat" && !selectedChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleMobileMenuToggle}
                    className="h-9 w-9 rounded-full hover:bg-purple-100/20 dark:hover:bg-purple-900/20"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                
                {activeTab === "chat" && selectedChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedChat(null)}
                    className="h-9 w-9 rounded-full hover:bg-purple-100/20 dark:hover:bg-purple-900/20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
            
            <TabsList className="grid w-full grid-cols-3 px-2 pb-1 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border-0">
              <TabsTrigger 
                value="chat" 
                className="rounded-lg py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/10 data-[state=active]:to-indigo-500/10 dark:data-[state=active]:from-purple-500/30 dark:data-[state=active]:to-indigo-500/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
              >
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                className="rounded-lg py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/10 data-[state=active]:to-indigo-500/10 dark:data-[state=active]:from-purple-500/30 dark:data-[state=active]:to-indigo-500/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
              >
                Buscar
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="rounded-lg py-2 data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500/10 data-[state=active]:to-indigo-500/10 dark:data-[state=active]:from-purple-500/30 dark:data-[state=active]:to-indigo-500/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300 data-[state=active]:shadow-sm"
              >
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
                chat={currentChat}
                onSelectChat={handleChatSelect}
                onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                isSidebarCollapsed={isSidebarCollapsed}
                onChatUpdated={refreshChats}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col p-4">
              <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-6 pt-6 md:pt-10 pb-16 md:pb-20">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg animate-pulse">
                  <Brain className="h-12 w-12 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg md:text-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">SightX I.A</h3>
                  <p className="text-sm text-muted-foreground max-w-[320px] bg-white/30 dark:bg-gray-800/30 p-3 rounded-lg backdrop-blur-sm border border-purple-100/20 dark:border-purple-900/20">
                    Pergunte qualquer coisa sobre seus dados e receba insights valiosos para impulsionar seu negócio.
                  </p>
                </div>
                
                <Button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 rounded-full shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 px-6 py-6 h-auto"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="font-medium">Iniciar Nova Conversa</span>
                </Button>
              </div>
              
              {/* Histórico de conversas recentes */}
              <div className="mt-auto py-2 px-2 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl border border-purple-100/20 dark:border-purple-900/20">
                <h3 className="text-sm font-medium bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent px-2 py-2">Conversas recentes</h3>
                <div className="space-y-2 p-2">
                  {chats.slice(0, 3).map(chat => (
                    <Button
                      key={chat.id}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4 gap-3 border-purple-100/30 dark:border-purple-900/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg transition-all duration-200"
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <History className="h-4 w-4 text-white" />
                      </div>
                      <div className="truncate">{chat.title}</div>
                    </Button>
                  ))}
                  
                  {chats.length === 0 && !isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-4 bg-white/20 dark:bg-gray-800/20 rounded-lg">
                      Nenhuma conversa encontrada
                    </p>
                  )}
                  
                  {isLoading && (
                    <div className="flex justify-center py-3">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-10 bg-purple-100/50 dark:bg-purple-900/30 rounded-lg w-full"></div>
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
              className="pl-9 border-purple-100/40 dark:border-purple-900/40 focus-visible:ring-purple-500/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-500 dark:text-purple-400" />
          </div>
          
          <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
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
                      className="w-full justify-start text-left h-auto py-3 px-4 gap-3 border-purple-100/30 dark:border-purple-900/30 hover:bg-purple-50/50 dark:hover:bg-purple-900/30 rounded-lg"
                      onClick={() => {
                        handleChatSelect(chat.id)
                        setActiveTab("chat")
                      }}
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <History className="h-4 w-4 text-white" />
                      </div>
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
                  <div className="text-center text-sm text-muted-foreground py-8 md:py-10 bg-white/30 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm border border-purple-100/20 dark:border-purple-900/20">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
                    <p>Nenhum resultado encontrado</p>
                  </div>
                )}
              </div>
            )}
            
            {!searchQuery && (
              <div className="text-center text-sm text-muted-foreground py-8 md:py-10 bg-white/30 dark:bg-gray-800/30 rounded-xl backdrop-blur-sm border border-purple-100/20 dark:border-purple-900/20">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
                <p>Digite para buscar conversas</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 overflow-auto p-4 m-0">
          <div className="h-full">
            <ChatInterface
              selectedChat="settings"
              chat={null}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId !== 'settings' ? chatId : null)
                setActiveTab("chat")
              }}
              onOpenSidebar={() => {}}
              isSidebarCollapsed={false}
              onChatUpdated={() => {}}
            />
          </div>
        </TabsContent>

        {/* Menu lateral para dispositivos móveis */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="w-[85%] max-w-[320px] p-0 border-r border-purple-100/20 dark:border-purple-900/20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
            <ChatSidebar
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={(chatId) => {
                handleChatSelect(chatId)
                setActiveTab("chat")
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
    <div className="fixed inset-0 top-16 bg-gradient-to-br from-background via-purple-50/10 dark:via-purple-950/10 to-background">
      <div className="h-full p-0 md:p-4">
        <div className="flex gap-0 md:gap-4 h-full rounded-none md:rounded-2xl border-0 md:border border-purple-100/20 dark:border-purple-900/20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md md:shadow-xl overflow-hidden">
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
                    "fixed inset-y-0 top-16 left-0 z-30 w-full max-w-[320px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-r border-purple-100/20 dark:border-purple-900/20 shadow-xl",
                    isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                  )
                : cn(
                    isSidebarCollapsed ? 'w-0 md:w-16 overflow-hidden' : 'w-full md:w-80'
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
              onSelectChat={handleChatSelect}
              onOpenSidebar={() => isMobile ? setIsMobileSidebarOpen(true) : setIsSidebarCollapsed(false)}
              isSidebarCollapsed={isSidebarCollapsed}
              onChatUpdated={refreshChats}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
