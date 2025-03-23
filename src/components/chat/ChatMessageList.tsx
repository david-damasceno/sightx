
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { DonaAvatar } from "./DonaAvatar";
import { UserAvatar } from "./UserAvatar";
import { Loader2 } from "lucide-react";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingMessage?: string;
}

export function ChatMessageList({ 
  messages, 
  isLoading, 
  loadingMessage = "Processando..."
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para o final das mensagens quando novas mensagens são adicionadas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-full">
        <DonaAvatar className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Olá, eu sou DONA</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Sua assistente de análise de dados e insights empresariais. 
          Como posso ajudar você hoje?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg w-full text-left">
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer">
            <h3 className="font-medium text-sm">Analise meus dados</h3>
            <p className="text-xs text-muted-foreground">
              "Quais são as tendências de vendas dos últimos 3 meses?"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer">
            <h3 className="font-medium text-sm">Crie uma pesquisa</h3>
            <p className="text-xs text-muted-foreground">
              "Ajude-me a criar uma pesquisa de satisfação do cliente"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer">
            <h3 className="font-medium text-sm">Compare métricas</h3>
            <p className="text-xs text-muted-foreground">
              "Compare o desempenho deste mês com o mesmo período do ano passado"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer">
            <h3 className="font-medium text-sm">Gere visualizações</h3>
            <p className="text-xs text-muted-foreground">
              "Que tipo de gráfico é melhor para mostrar distribuição de clientes?"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Destacar esquema em código SQL
  const highlightSchema = (code: string) => {
    // Buscar por possíveis esquemas no formato "schema_name."
    const schemaRegex = /(\w+)\.(\w+)/g;
    
    return code.replace(schemaRegex, (match, schema, table) => {
      return `<span class="text-green-500 font-semibold">${schema}</span>.<span class="text-blue-500">${table}</span>`;
    });
  };

  // Renderiza a lista de mensagens
  const renderMessageContent = (text: string) => {
    // Detectar e formatar blocos de código
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, idx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extrair a linguagem e o código
        const match = part.match(/```(?:(\w+))?\s*([\s\S]*?)```/);
        const language = match?.[1] || '';
        const code = match?.[2] || '';
        
        // Se for SQL, destacar o esquema
        const formattedCode = language.toLowerCase() === 'sql' 
          ? <div dangerouslySetInnerHTML={{ __html: highlightSchema(code) }} />
          : <code>{code}</code>;
        
        return (
          <div key={idx} className="my-2 overflow-x-auto">
            <pre className="bg-gray-900 text-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
              {formattedCode}
            </pre>
          </div>
        );
      } else if (part.includes('**Resultados da análise:**') || part.includes('**Nota:**')) {
        // Formatar seção de resultados e notas
        return (
          <div key={idx} className="mt-2 p-2 bg-primary/10 rounded-md">
            {part.split('\n').map((line, lineIdx) => (
              <div key={lineIdx}>
                {line.startsWith('**') ? (
                  <strong className="text-primary">{line.replace(/\*\*/g, '')}</strong>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        );
      } else {
        // Texto normal
        return <div key={idx} className="whitespace-pre-wrap">{part}</div>;
      }
    });
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`flex max-w-[80%] gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {message.sender === "user" ? (
              <UserAvatar />
            ) : (
              <DonaAvatar className="mt-0.5" />
            )}
            <div
              className={`rounded-lg px-4 py-2 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 dark:bg-muted"
              }`}
            >
              <div className="text-sm">
                {message.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{message.text}</div>
                ) : (
                  renderMessageContent(message.text)
                )}
              </div>
              <div className="mt-1 text-[10px] opacity-70 text-right">
                {typeof message.timestamp === 'string'
                  ? new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
              </div>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="flex max-w-[80%] gap-3">
            <DonaAvatar className="mt-0.5" />
            <div className="rounded-lg px-4 py-3 bg-muted/70 dark:bg-muted">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin opacity-70" />
                <span className="text-sm opacity-90">{loadingMessage}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
