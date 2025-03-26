
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, MessageSquare } from "lucide-react"
import { ChatInterface } from "./ChatInterface"
import { ChatSidebar } from "./ChatSidebar"
import { Chat } from "@/types/chat"
import { cn } from "@/lib/utils"

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
      <div className="flex flex-col h-full animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md">
          <h1 className="text-lg font-semibold text-primary">IA Insights</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onCreateChat}
            className="h-9 w-9 rounded-full border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all duration-200"
          >
            <Plus className="h-4 w-4 text-primary" />
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
            onChatsUpdated={fetchChats}
          />
        </div>
      </div>
    )
  }

  // Mostra a interface de chat atual
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {selectedChat && selectedChat !== 'settings' && (
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-full hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-sm font-medium truncate max-w-[200px]">
                {chat?.title || "Nova Conversa"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {chat?.messages.length || 0} mensagens
              </p>
            </div>
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
