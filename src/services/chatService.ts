
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Função para carregar todas as conversas do usuário
export const fetchChats = async (): Promise<Chat[]> => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return data.map(chat => ({
      id: chat.id,
      title: chat.title || "Nova Conversa",
      messages: [],
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.updated_at)
    }));
  } catch (error) {
    console.error("Erro ao buscar chats:", error);
    toast.error("Erro ao carregar conversas");
    return [];
  }
};

// Função para carregar as mensagens de um chat específico
export const fetchChatMessages = async (chatId: string): Promise<Chat | null> => {
  try {
    // Buscar dados do chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();
    
    if (chatError) throw chatError;
    
    // Buscar mensagens associadas ao chat
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    
    if (messagesError) throw messagesError;
    
    // Formatar mensagens
    const formattedMessages = messagesData ? messagesData.map(message => ({
      id: message.id,
      sender: message.sender,
      text: message.content,
      timestamp: new Date(message.created_at)
    })) : [];
    
    // Criar objeto do chat com as mensagens
    return {
      id: chatData.id,
      title: chatData.title || "Nova Conversa",
      messages: formattedMessages,
      createdAt: new Date(chatData.created_at),
      updatedAt: new Date(chatData.updated_at)
    };
  } catch (error) {
    console.error("Erro ao buscar mensagens do chat:", error);
    toast.error("Erro ao carregar mensagens");
    return null;
  }
};

// Função para criar um novo chat
export const createNewChat = async (): Promise<string | null> => {
  try {
    const chatId = uuidv4();
    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('chats')
      .insert([
        {
          id: chatId,
          title: "Nova Conversa",
          user_id: userData.user?.id
        }
      ]);

    if (error) throw error;
    
    return chatId;
  } catch (error) {
    console.error("Erro ao criar novo chat:", error);
    toast.error("Erro ao criar nova conversa");
    return null;
  }
};

// Função para excluir um chat
export const deleteChat = async (chatId: string): Promise<boolean> => {
  try {
    // Exclui todas as mensagens do chat
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('chat_id', chatId);
    
    if (messagesError) throw messagesError;
    
    // Exclui o chat
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);
    
    if (chatError) throw chatError;
    
    toast.success("Conversa excluída com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao excluir chat:", error);
    toast.error("Erro ao excluir conversa");
    return false;
  }
};

// Função para adicionar uma mensagem a um chat
export const addMessageToChat = async (
  chatId: string, 
  message: { sender: "user" | "ai", text: string }
): Promise<boolean> => {
  try {
    const messageId = uuidv4();
    const now = new Date();
    
    // Inserir a mensagem
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          id: messageId,
          chat_id: chatId,
          sender: message.sender,
          content: message.text,
          created_at: now.toISOString()
        }
      ]);

    if (error) throw error;
    
    // Atualizar a data de atualização do chat
    await supabase
      .from('chats')
      .update({
        updated_at: now.toISOString()
      })
      .eq('id', chatId);
    
    return true;
  } catch (error) {
    console.error("Erro ao adicionar mensagem:", error);
    toast.error("Erro ao enviar mensagem");
    return false;
  }
};

// Função para buscar resposta da IA
export const getAIResponse = async (message: string): Promise<string> => {
  // Simulação de resposta da IA (substitua por uma chamada real à API quando estiver pronta)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Resposta da IA para: "${message}"`);
    }, 1000);
  });
};
