
import { supabase } from "@/integrations/supabase/client";
import { Chat, ChatMessage, ChatSettings } from "@/types/chat";
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
    const formattedMessages: ChatMessage[] = messagesData ? messagesData.map(message => ({
      id: message.id,
      sender: message.sender as "user" | "ai", // Fazemos um type casting explícito aqui
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
    // Exclui o chat (as mensagens serão excluídas automaticamente devido à restrição ON DELETE CASCADE)
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
    
    // Verificação para garantir que sender seja apenas "user" ou "ai"
    if (message.sender !== "user" && message.sender !== "ai") {
      throw new Error("O remetente da mensagem deve ser 'user' ou 'ai'");
    }
    
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

// Função para enviar mensagem para IA e obter resposta
export const sendMessageToAI = async (
  message: string, 
  context: string, 
  chatId: string
): Promise<string> => {
  try {
    // Aqui você pode integrar com uma API de IA como OpenAI, Azure OpenAI, etc.
    // Por enquanto, vamos simular uma resposta
    
    // Simular um tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Resposta simulada
    const resposta = `Olá! Recebi sua mensagem: "${message}".\n\nBaseado na minha análise, posso oferecer algumas informações:\n\n**Resultados da análise:**\n- Os dados mostram uma tendência interessante para seu negócio\n- Existe uma oportunidade de crescimento no segmento de mercado atual\n- Recomendo focar em estratégias de fidelização de clientes\n\nVocê gostaria de alguma análise específica sobre esses resultados?`;
    
    return resposta;
  } catch (error) {
    console.error("Erro ao processar resposta da IA:", error);
    throw new Error("Não foi possível obter resposta da IA. Tente novamente mais tarde.");
  }
};

// Função para carregar configurações do chat
export const loadChatSettings = async (): Promise<ChatSettings> => {
  try {
    // Em um cenário real, você carregaria do banco de dados
    // Por enquanto, retorna configurações padrão
    return {
      model: "gpt-4",
      temperature: 0.7,
      saveHistory: true,
      autoAnalysis: true
    };
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
    toast.error("Erro ao carregar configurações da IA");
    
    // Retornar configurações padrão em caso de erro
    return {
      model: "gpt-4",
      temperature: 0.7,
      saveHistory: true,
      autoAnalysis: true
    };
  }
};

// Função para salvar configurações do chat
export const saveChatSettings = async (settings: ChatSettings): Promise<boolean> => {
  try {
    // Em um cenário real, você salvaria no banco de dados
    // Por enquanto, apenas simula o salvamento
    console.log("Configurações salvas:", settings);
    
    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    toast.error("Erro ao salvar configurações da IA");
    return false;
  }
};
