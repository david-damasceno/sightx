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

    // Garantindo que acessamos propriedades apenas se elas existirem
    const chatSettings = profile?.settings ? 
      (typeof profile.settings === 'object' && profile.settings !== null && 'chat' in profile.settings ? 
       profile.settings.chat : null) : null;
    
    if (chatSettings && typeof chatSettings === 'object') {
      return {
        ...DEFAULT_SETTINGS,
        ...chatSettings as Partial<ChatSettings>,
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

    const currentSettings = profile?.settings || {};
    
    const updatedSettings = {
      ...(typeof currentSettings === 'object' ? currentSettings : {}),
      chat: settings,
    };

    await supabase
      .from("profiles")
      .update({
        settings: updatedSettings as any, // Usando any para contornar limitações do tipo Json
      })
      .eq("id", (await supabase.auth.getUser()).data.user?.id);
  } catch (error) {
    console.error("Erro ao salvar configurações do chat:", error);
    throw new Error("Não foi possível salvar as configurações");
  }
};

// Função auxiliar para converter os timestamps de string para Date
const convertChatDates = (chat: any): Chat => {
  // Garantir que messages é um array mesmo que venha como null ou undefined
  let messages: ChatMessage[] = [];
  
  if (Array.isArray(chat.messages)) {
    messages = chat.messages.map((msg: any) => ({
      id: msg.id || uuidv4(),
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));
  }
  
  return {
    id: chat.id,
    title: chat.title,
    messages: messages,
    createdAt: new Date(chat.created_at),
    updatedAt: new Date(chat.updated_at),
  };
};

// Função para serializar mensagens para armazenamento
const serializeMessages = (messages: ChatMessage[]): any[] => {
  return messages.map(msg => ({
    id: msg.id,
    sender: msg.sender,
    text: msg.text,
    timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString()
  }));
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

    return data.map(convertChatDates);
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
    
    return convertChatDates(data);
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
  const initialMessages: ChatMessage[] = initialMessage ? [
    {
      id: uuidv4(),
      sender: "user",
      text: initialMessage,
      timestamp: now,
    }
  ] : [];

  const newChat: Chat = {
    id: chatId,
    title: `Nova conversa (${now.toLocaleDateString()})`,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const { error } = await supabase.from("chats").insert({
      id: newChat.id,
      title: newChat.title,
      messages: initialMessages.length > 0 ? serializeMessages(initialMessages) : [],
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
    
    // Garantimos que messages seja sempre um array
    const currentMessages = Array.isArray(chat?.messages) ? chat.messages : [];
    
    // Combinamos as mensagens existentes com a nova e serializamos
    const serializedMessages = serializeMessages([...currentMessages.map((msg: any) => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp
    })), newMessage]);
    
    // Se for a primeira mensagem do usuário e título for genérico, atualize o título
    let title = chat?.title;
    if (message.sender === "user" && serializedMessages.length <= 2 && chat?.title?.startsWith("Nova conversa")) {
      title = message.text.length > 30 
        ? `${message.text.substring(0, 30)}...` 
        : message.text;
    }

    const now = new Date();
    await supabase
      .from("chats")
      .update({
        messages: serializedMessages,
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

// Obtém as informações do usuário e da organização para o contexto do chat
export const getUserAndOrgContext = async (): Promise<{
  userName: string;
  orgInfo: {
    name?: string;
    sector?: string;
    city?: string;
    state?: string;
    description?: string;
    [key: string]: any;
  } | null;
}> => {
  try {
    // Obter perfil do usuário
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    // Obter organização atual do usuário
    const { data: memberData } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();
      
    let orgInfo = null;
    
    if (memberData?.organization_id) {
      const { data: org } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", memberData.organization_id)
        .single();
        
      if (org) {
        orgInfo = {
          name: org.name,
          ...(org.settings || {})
        };
      }
    }
    
    return {
      userName: profile?.full_name || user.email?.split('@')[0] || "Usuário",
      orgInfo
    };
  } catch (error) {
    console.error("Erro ao obter contexto do usuário:", error);
    return {
      userName: "Usuário",
      orgInfo: null
    };
  }
};

// Envia mensagem para a IA e obtém resposta
export const sendMessageToAI = async (message: string, context?: string): Promise<string> => {
  try {
    const settings = await loadChatSettings();
    
    // Obter informações do usuário e da organização
    const { userName, orgInfo } = await getUserAndOrgContext();
    
    // Construir contexto adicional com informações do usuário e da organização
    let enhancedContext = `O usuário @${userName} está lhe enviando uma mensagem.`;
    
    if (orgInfo) {
      enhancedContext += "\n\nPara fornecer a melhor resposta, segue as informações sobre a empresa dele:";
      
      if (orgInfo.name) enhancedContext += `\nNome da empresa: ${orgInfo.name}`;
      if (orgInfo.sector) enhancedContext += `\nSetor: ${orgInfo.sector}`;
      if (orgInfo.city && orgInfo.state) enhancedContext += `\nLocalização: ${orgInfo.city}, ${orgInfo.state}`;
      if (orgInfo.description) enhancedContext += `\nSobre a empresa: ${orgInfo.description}`;
      
      // Adicionar outras informações disponíveis
      Object.entries(orgInfo).forEach(([key, value]) => {
        if (!['name', 'sector', 'city', 'state', 'description'].includes(key) && value) {
          enhancedContext += `\n${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`;
        }
      });
    }
    
    enhancedContext += `\n\nAbaixo, segue a mensagem do @${userName} para você:\n\n"${message}"`;
    
    // Incluir histórico do chat se fornecido
    if (context) {
      enhancedContext += `\n\nHistórico recente da conversa:\n${context}`;
    }
    
    const { data, error } = await supabase.functions.invoke("chat-with-dona", {
      body: { 
        message: enhancedContext,
        context: "",
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
