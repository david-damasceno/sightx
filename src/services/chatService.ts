
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage, ChatSettings } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_SETTINGS: ChatSettings = {
  model: "gpt-4",
  temperature: 0.7,
  saveHistory: true,
  autoAnalysis: true,
};

// Carrega as configurações de chat do usuário
export const loadChatSettings = async (): Promise<ChatSettings> => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("settings")
      .single();

    if (profile?.settings?.chat) {
      return {
        ...DEFAULT_SETTINGS,
        ...profile.settings.chat,
      };
    }
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Erro ao carregar configurações do chat:", error);
    return DEFAULT_SETTINGS;
  }
};

// Salva as configurações de chat do usuário
export const saveChatSettings = async (settings: ChatSettings): Promise<void> => {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("settings")
      .single();

    const updatedSettings = {
      ...profile?.settings || {},
      chat: settings,
    };

    await supabase
      .from("profiles")
      .update({
        settings: updatedSettings,
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);
  } catch (error) {
    console.error("Erro ao salvar configurações do chat:", error);
    throw new Error("Não foi possível salvar as configurações");
  }
};

// Carrega todas as conversas do usuário
export const loadChats = async (): Promise<Chat[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user?.user?.id) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return data.map((chat) => ({
      id: chat.id,
      title: chat.title,
      messages: chat.messages,
      createdAt: new Date(chat.created_at),
      updatedAt: new Date(chat.updated_at),
    }));
  } catch (error) {
    console.error("Erro ao carregar conversas:", error);
    return [];
  }
};

// Carrega uma conversa específica pelo ID
export const loadChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("id", chatId)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      title: data.title,
      messages: data.messages,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error(`Erro ao carregar conversa ${chatId}:`, error);
    return null;
  }
};

// Cria uma nova conversa
export const createChat = async (initialMessage?: string): Promise<Chat> => {
  const now = new Date();
  const { data: user } = await supabase.auth.getUser();
  
  if (!user?.user?.id) {
    throw new Error("Usuário não autenticado");
  }
  
  const chatId = uuidv4();
  const newChat: Chat = {
    id: chatId,
    title: `Nova conversa (${now.toLocaleDateString()})`,
    messages: initialMessage ? [
      {
        id: uuidv4(),
        sender: "user",
        text: initialMessage,
        timestamp: now,
      }
    ] : [],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { error } = await supabase.from("chats").insert({
      id: newChat.id,
      title: newChat.title,
      messages: newChat.messages,
      created_at: newChat.createdAt.toISOString(),
      updated_at: newChat.updatedAt.toISOString(),
      user_id: user.user.id
    });

    if (error) throw error;
    return newChat;
  } catch (error) {
    console.error("Erro ao criar nova conversa:", error);
    throw new Error("Não foi possível criar uma nova conversa");
  }
};

// Adiciona uma mensagem a uma conversa
export const addMessageToChat = async (
  chatId: string, 
  message: Omit<ChatMessage, "id" | "timestamp">
): Promise<ChatMessage> => {
  const newMessage: ChatMessage = {
    id: uuidv4(),
    ...message,
    timestamp: new Date(),
  };

  try {
    const { data: chat } = await supabase
      .from("chats")
      .select("messages, title")
      .eq("id", chatId)
      .single();
    
    const messages = [...(chat?.messages || []), newMessage];
    
    // Se for a primeira mensagem do usuário e título for genérico, atualize o título
    let title = chat?.title;
    if (message.sender === "user" && messages.length <= 2 && chat?.title?.startsWith("Nova conversa")) {
      title = message.text.length > 30 
        ? `${message.text.substring(0, 30)}...` 
        : message.text;
    }

    const now = new Date();
    await supabase
      .from("chats")
      .update({
        messages,
        title,
        updated_at: now.toISOString(),
      })
      .eq("id", chatId);

    return newMessage;
  } catch (error) {
    console.error(`Erro ao adicionar mensagem à conversa ${chatId}:`, error);
    throw new Error("Erro ao adicionar mensagem");
  }
};

// Atualiza o título de uma conversa
export const updateChatTitle = async (chatId: string, title: string): Promise<void> => {
  try {
    const now = new Date();
    await supabase
      .from("chats")
      .update({
        title,
        updated_at: now.toISOString(),
      })
      .eq("id", chatId);
  } catch (error) {
    console.error(`Erro ao atualizar título da conversa ${chatId}:`, error);
    throw new Error("Erro ao atualizar título");
  }
};

// Exclui uma conversa
export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    await supabase
      .from("chats")
      .delete()
      .eq("id", chatId);
  } catch (error) {
    console.error(`Erro ao excluir conversa ${chatId}:`, error);
    throw new Error("Erro ao excluir conversa");
  }
};

// Exclui todas as conversas
export const deleteAllChats = async (): Promise<void> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user?.id) throw new Error("Usuário não autenticado");
    
    await supabase
      .from("chats")
      .delete()
      .eq("user_id", user.user.id);
  } catch (error) {
    console.error("Erro ao excluir todas as conversas:", error);
    throw new Error("Erro ao limpar histórico");
  }
};

// Envia mensagem para a IA e obtém resposta
export const sendMessageToAI = async (message: string, context?: string): Promise<string> => {
  try {
    const settings = await loadChatSettings();
    
    const { data, error } = await supabase.functions.invoke("chat-with-dona", {
      body: { 
        message, 
        context,
        settings
      },
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error("Erro ao enviar mensagem para a IA:", error);
    throw new Error("Não foi possível obter resposta da IA. Tente novamente mais tarde.");
  }
};
