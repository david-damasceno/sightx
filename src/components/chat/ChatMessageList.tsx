
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/types/chat";
import { DonaAvatar } from "./DonaAvatar";
import { UserAvatar } from "./UserAvatar";
import { Loader2, AlertTriangle, Database, ChevronRight } from "lucide-react";

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
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer transition-all duration-200 hover:scale-105">
            <h3 className="font-medium text-sm">Analise meus dados</h3>
            <p className="text-xs text-muted-foreground">
              "Quais são as tendências de vendas dos últimos 3 meses?"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer transition-all duration-200 hover:scale-105">
            <h3 className="font-medium text-sm">Crie uma pesquisa</h3>
            <p className="text-xs text-muted-foreground">
              "Ajude-me a criar uma pesquisa de satisfação do cliente"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer transition-all duration-200 hover:scale-105">
            <h3 className="font-medium text-sm">Compare métricas</h3>
            <p className="text-xs text-muted-foreground">
              "Compare o desempenho deste mês com o mesmo período do ano passado"
            </p>
          </div>
          <div className="bg-muted/40 p-3 rounded-lg hover:bg-muted cursor-pointer transition-all duration-200 hover:scale-105">
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
    // Destacar esquema.tabela com cores diferentes
    const schemaRegex = /(\w+)\.(\w+)/g;
    
    return code.replace(schemaRegex, (match, schema, table) => {
      return `<span class="text-green-500 font-semibold">${schema}</span>.<span class="text-blue-500">${table}</span>`;
    });
  };

  // Renderizar blocos de código
  const renderCodeBlock = (code: string, language: string) => {
    if (language.toLowerCase() === 'sql') {
      return (
        <div className="relative group">
          <div className="absolute -top-3 right-2 bg-gray-800 px-2 py-0.5 text-xs rounded text-gray-400">
            SQL
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-xs text-gray-300">
              Copiar
            </button>
          </div>
          <pre className="bg-gray-900 text-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: highlightSchema(code) }} />
          </pre>
        </div>
      )
    } else {
      return (
        <pre className="bg-gray-900 text-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
      )
    }
  }

  // Renderizar seção de resultados
  const renderResultsSection = (text: string) => {
    const lines = text.split('\n')
    const formattedLines = lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={i} className="font-semibold text-primary mb-1">{line.replace(/\*\*/g, '')}</h4>
      } else if (line.startsWith('- ')) {
        return (
          <div key={i} className="flex items-start mb-1">
            <ChevronRight className="h-4 w-4 text-primary mt-0.5 mr-1 flex-shrink-0" />
            <p>{line.substring(2)}</p>
          </div>
        )
      } else if (line.startsWith('Exemplo ')) {
        return <p key={i} className="text-sm opacity-80 ml-4 mb-1">{line}</p>
      } else if (line.trim() === '') {
        return <div key={i} className="h-2" />
      } else {
        return <p key={i} className="mb-1">{line}</p>
      }
    })

    return (
      <div className="mt-3 p-3 bg-primary/10 rounded-md border border-primary/20">
        {formattedLines}
      </div>
    )
  }

  // Renderizar nota ou alerta
  const renderNote = (text: string) => {
    const title = text.split('\n')[0].replace(/\*\*/g, '')
    const content = text.split('\n').slice(1).join('\n')
    
    return (
      <div className="mt-3 p-3 bg-amber-500/10 rounded-md border border-amber-500/20">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h4 className="font-semibold text-amber-500">{title}</h4>
        </div>
        <p className="text-sm ml-6">{content}</p>
      </div>
    )
  }

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
        
        return (
          <div key={idx} className="my-3">
            {renderCodeBlock(code, language)}
          </div>
        );
      } else if (part.includes('**Resultados da análise:**')) {
        // Formatar seção de resultados de análise
        return (
          <div key={idx}>
            <div className="whitespace-pre-wrap">
              {part.split('**Resultados da análise:**')[0]}
            </div>
            {renderResultsSection(part.substring(part.indexOf('**Resultados da análise:**')))}
          </div>
        );
      } else if (part.includes('**Nota:**')) {
        // Formatar notas e alertas
        const beforeNote = part.split('**Nota:**')[0];
        const noteText = '**Nota:**' + part.split('**Nota:**')[1];
        
        return (
          <div key={idx}>
            <div className="whitespace-pre-wrap">{beforeNote}</div>
            {renderNote(noteText)}
          </div>
        );
      } else {
        // Texto normal
        return <div key={idx} className="whitespace-pre-wrap">{part}</div>;
      }
    });
  };

  // Renderizar botão de função quando detectar menção a consulta SQL
  const renderFunctionButton = (text: string) => {
    if (text.toLowerCase().includes('consulta sql') || 
        text.toLowerCase().includes('query sql') ||
        text.includes('```sql')) {
      return (
        <div className="mt-2 flex items-center justify-start">
          <button className="flex items-center gap-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-full transition-colors">
            <Database className="h-3 w-3" />
            Executar consulta
          </button>
        </div>
      )
    }
    return null
  }

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
            className={`flex max-w-[85%] gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {message.sender === "user" ? (
              <UserAvatar />
            ) : (
              <DonaAvatar className="mt-0.5" />
            )}
            <div
              className={`rounded-lg px-4 py-3 ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 dark:bg-muted"
              }`}
            >
              <div className="text-sm">
                {message.sender === "user" ? (
                  <div className="whitespace-pre-wrap">{message.text}</div>
                ) : (
                  <>
                    {renderMessageContent(message.text)}
                    {renderFunctionButton(message.text)}
                  </>
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
          <div className="flex max-w-[85%] gap-3">
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
