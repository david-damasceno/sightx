
import React, { useState, useEffect } from "react"
import { Chat } from "@/types/chat"
import { toast } from "sonner"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { InsightsPanel } from "@/components/InsightsPanel"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { MobileChatWrapper } from "@/components/chat/MobileChatWrapper"
import { 
  fetchChats, 
  fetchChatMessages, 
  createNewChat, 
  deleteChat 
} from "@/services/chatService"

export default function AIInsights() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const isMobile = useMobile()

  // Carregar lista de chats
  useEffect(() => {
    loadAllChats()
  }, [])

  // Carregar chat selecionado
  useEffect(() => {
    if (selectedChat && selectedChat !== 'settings' && selectedChat !== 'new') {
      loadChatMessages(selectedChat)
    } else if (selectedChat === 'new') {
      handleCreateNewChat()
    } else {
      setCurrentChat(null)
    }
  }, [selectedChat])

  const loadAllChats = async () => {
    try {
      setLoadingChats(true)
      const chatsData = await fetchChats()
      setChats(chatsData)
    } catch (error) {
      console.error("Erro ao carregar chats:", error)
      toast.error("Não foi possível carregar as conversas")
    } finally {
      setLoadingChats(false)
    }
  }

  const loadChatMessages = async (chatId: string) => {
    try {
      setLoadingChat(true)
      const chatData = await fetchChatMessages(chatId)
      if (chatData) {
        setCurrentChat(chatData)
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
      toast.error("Não foi possível carregar as mensagens")
    } finally {
      setLoadingChat(false)
    }
  }

  const handleCreateNewChat = async () => {
    try {
      const chatId = await createNewChat()
      if (chatId) {
        await loadAllChats()
        setSelectedChat(chatId)
      }
    } catch (error) {
      console.error("Erro ao criar novo chat:", error)
      toast.error("Não foi possível criar uma nova conversa")
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      const success = await deleteChat(chatId)
      if (success) {
        await loadAllChats()
        
        // Se o chat excluído era o chat selecionado, limpa a seleção
        if (selectedChat === chatId) {
          setSelectedChat(null)
          setCurrentChat(null)
        }
      }
    } catch (error) {
      console.error("Erro ao excluir chat:", error)
      toast.error("Não foi possível excluir a conversa")
    }
  }

  // Renderização para dispositivos móveis
  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] pt-0 pb-16">
        <MobileChatWrapper
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
          onCreateChat={() => setSelectedChat("new")}
          onDeleteChat={handleDeleteChat}
          loadingChats={loadingChats}
          loadingChat={loadingChat}
          fetchChats={loadAllChats}
          chat={currentChat}
        />
      </div>
    )
  }

  // Renderização para desktop
  return (
    <div className="container max-w-screen-xl mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 rounded-xl overflow-hidden border bg-card shadow-sm h-[calc(100vh-10rem)]">
          <div className="grid grid-cols-12 h-full">
            {/* Sidebar */}
            <div className="col-span-4 h-full border-r">
              <ChatSidebar
                chats={chats}
                selectedChat={selectedChat}
                onSelectChat={setSelectedChat}
                onDeleteChat={handleDeleteChat}
                isLoading={loadingChats}
                showSettings={true}
                onCreateChat={() => setSelectedChat("new")}
                onChatsUpdated={loadAllChats}
              />
            </div>
            
            {/* Chat Interface */}
            <div className="col-span-8 h-full relative">
              <ChatInterface
                selectedChat={selectedChat}
                chat={currentChat}
                onSelectChat={setSelectedChat}
                onOpenSidebar={() => {}}
                isSidebarCollapsed={false}
                onChatUpdated={loadAllChats}
              />
            </div>
          </div>
        </div>
        
        {/* Insights Panel */}
        <div className="col-span-12 lg:col-span-4">
          <InsightsPanel />
        </div>
      </div>
    </div>
  )
}
