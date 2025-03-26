
import React, { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Chat } from "@/types/chat"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { InsightsPanel } from "@/components/InsightsPanel"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { MobileChatWrapper } from "@/components/chat/MobileChatWrapper"

export default function AIInsights() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingChat, setLoadingChat] = useState(false)
  const isMobile = useMobile()

  // Carregar lista de chats
  useEffect(() => {
    fetchChats()
  }, [])

  // Carregar chat selecionado
  useEffect(() => {
    if (selectedChat && selectedChat !== 'settings' && selectedChat !== 'new') {
      fetchChatMessages(selectedChat)
    } else if (selectedChat === 'new') {
      createNewChat()
    } else {
      setCurrentChat(null)
    }
  }, [selectedChat])

  const fetchChats = async () => {
    try {
      setLoadingChats(true)
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error

      const formattedChats = data.map(chat => ({
        id: chat.id,
        title: chat.title || "Nova Conversa",
        messages: [],
        createdAt: new Date(chat.created_at),
        updatedAt: new Date(chat.updated_at)
      }))

      setChats(formattedChats)
    } catch (error) {
      console.error("Erro ao buscar chats:", error)
      toast.error("Erro ao carregar conversas")
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchChatMessages = async (chatId: string) => {
    try {
      setLoadingChat(true)
      
      // Buscar dados do chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single()
      
      if (chatError) throw chatError
      
      // Buscar mensagens do chat
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })
      
      if (messagesError) throw messagesError
      
      const formattedMessages = messagesData.map(message => ({
        id: message.id,
        sender: message.sender,
        text: message.content,
        timestamp: new Date(message.created_at)
      }))
      
      setCurrentChat({
        id: chatData.id,
        title: chatData.title || "Nova Conversa",
        messages: formattedMessages,
        createdAt: new Date(chatData.created_at),
        updatedAt: new Date(chatData.updated_at)
      })
    } catch (error) {
      console.error("Erro ao buscar mensagens do chat:", error)
      toast.error("Erro ao carregar mensagens")
    } finally {
      setLoadingChat(false)
    }
  }

  const createNewChat = async () => {
    try {
      const chatId = uuidv4()
      const { error } = await supabase
        .from('chats')
        .insert([
          {
            id: chatId,
            title: "Nova Conversa",
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ])

      if (error) throw error

      // Atualiza a lista de chats e seleciona o novo chat
      await fetchChats()
      setSelectedChat(chatId)
    } catch (error) {
      console.error("Erro ao criar novo chat:", error)
      toast.error("Erro ao criar nova conversa")
    }
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      // Exclui todas as mensagens do chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)
      
      if (messagesError) throw messagesError
      
      // Exclui o chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)
      
      if (chatError) throw chatError
      
      // Atualiza a lista de chats
      await fetchChats()
      
      // Se o chat excluído era o chat selecionado, limpa a seleção
      if (selectedChat === chatId) {
        setSelectedChat(null)
        setCurrentChat(null)
      }
      
      toast.success("Conversa excluída com sucesso")
    } catch (error) {
      console.error("Erro ao excluir chat:", error)
      toast.error("Erro ao excluir conversa")
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
          fetchChats={fetchChats}
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
                onChatUpdated={fetchChats}
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
