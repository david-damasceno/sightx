
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import { ChatInterface } from "./ChatInterface"
import { ChatSidebar } from "./ChatSidebar"
import { Chat } from "@/types/chat"

interface MobileChatWrapperProps {
  chats: Chat[]
  selectedChat: string | null
  onSelectChat: (chatId: string | null) => void
  onCreateChat: () => void
  onDeleteChat: (chatId: string) => void
  loadingChats: boolean
  loadingChat: boolean
  fetchChats: () => void
  chat: Chat | null
}

export function MobileChatWrapper({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  loadingChats,
  loadingChat,
  fetchChats,
  chat
}: MobileChatWrapperProps) {
  const [showSidebar, setShowSidebar] = useState(!selectedChat)
  const navigate = useNavigate()

  // Função para alternar entre a lista de chats e o chat selecionado
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  // Função para selecionar um chat
  const handleSelectChat = (chatId: string | null) => {
    onSelectChat(chatId)
    if (chatId) {
      setShowSidebar(false)
    }
  }
  
  // Função para voltar à lista de chats
  const handleBack = () => {
    setShowSidebar(true)
  }

  // Mostra a lista de chats
  if (showSidebar) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="text-lg font-medium">IA Insights</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onCreateChat}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={onDeleteChat}
            isLoading={loadingChats}
            showSettings={true}
            onCreateChat={onCreateChat}
          />
        </div>
      </div>
    )
  }

  // Mostra a interface de chat atual
  return (
    <div className="flex flex-col h-full">
      {selectedChat && selectedChat !== 'settings' && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-sm font-medium truncate">
              {chat?.title || "Nova Conversa"}
            </h2>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          selectedChat={selectedChat}
          chat={chat}
          onSelectChat={handleSelectChat}
          onOpenSidebar={handleBack}
          isSidebarCollapsed={!showSidebar}
          onChatUpdated={fetchChats}
        />
      </div>
    </div>
  )
}
