
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2"

const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY')
const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || "https://api.openai.com/v1"
const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || "gpt-4o-mini"
const isAzure = !!Deno.env.get('AZURE_OPENAI_ENDPOINT')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verificar se todas as variáveis de ambiente necessárias estão definidas
    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      console.error('Configuração incompleta:', {
        hasApiKey: !!apiKey,
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseServiceKey: !!supabaseServiceKey
      })
      throw new Error('Configuração incompleta para o serviço chat-with-dona')
    }

    // Inicializar cliente Supabase com a chave de serviço para ter acesso completo
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { message, context, settings, userId, orgId, chatId } = await req.json()
    console.log('Processando solicitação com mensagem:', { 
      messageLength: message?.length,
      hasContext: !!context,
      hasSettings: !!settings,
      userId,
      orgId,
      chatId
    })

    if (!userId) {
      throw new Error('ID do usuário não fornecido. Autenticação necessária.')
    }

    if (!orgId) {
      throw new Error('ID da organização não fornecido. Seleção de organização necessária.')
    }

    // Obter informações da organização para identificar o esquema
    console.log('Obtendo informações da organização')
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*, settings')
      .eq('id', orgId)
      .maybeSingle()
    
    if (orgError || !orgData) {
      console.error('Erro ao obter informações da organização:', orgError)
      throw new Error('Organização não encontrada: ' + (orgError?.message || ''))
    }
    
    // Determinar o esquema da organização
    const orgSchemaName = orgData?.settings?.schema_name || 'public'
    console.log(`Usando esquema da organização: ${orgSchemaName}`)

    // Obter histórico de mensagens da conversa atual
    let chatHistory = []
    if (chatId) {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('messages')
        .eq('id', chatId)
        .maybeSingle()
        
      if (chatError) {
        console.error('Erro ao obter histórico do chat:', chatError)
      } else if (chatData && chatData.messages) {
        chatHistory = Array.isArray(chatData.messages) ? 
          chatData.messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })) : []
          
        // Limitamos para as últimas 15 mensagens para não exceder o contexto
        if (chatHistory.length > 15) {
          chatHistory = chatHistory.slice(-15)
        }
        
        console.log(`Carregado histórico do chat com ${chatHistory.length} mensagens`)
      }
    }

    // Obter metadados detalhados do schema do banco de dados
    console.log('Obtendo schema do banco de dados para a IA')
    const { data: schemaData, error: schemaError } = await supabase.rpc('get_ai_schema_summary')
    
    if (schemaError) {
      console.error('Erro ao obter schema do banco de dados:', schemaError)
    }
    
    // Obter tabelas específicas do esquema da organização
    console.log('Obtendo tabelas do esquema da organização')
    const { data: orgTablesData, error: orgTablesError } = await supabase
      .from('ai_knowledge_index')
      .select('*')
      .eq('schema_name', orgSchemaName)
    
    if (orgTablesError) {
      console.error('Erro ao obter tabelas do esquema da organização:', orgTablesError)
    }
    
    let orgTablesInfo = "Não foram encontradas tabelas específicas do esquema da organização."
    
    if (orgTablesData && orgTablesData.length > 0) {
      orgTablesInfo = `Tabelas no esquema da organização ${orgSchemaName}:\n\n`
      
      for (const table of orgTablesData) {
        orgTablesInfo += `- Tabela: ${table.entity_name}\n`
        orgTablesInfo += `  Descrição: ${table.description || 'Sem descrição'}\n`
        
        if (table.column_metadata && Array.isArray(table.column_metadata)) {
          orgTablesInfo += `  Colunas:\n`
          for (const column of table.column_metadata) {
            orgTablesInfo += `    - ${column.name} (${column.type})\n`
          }
        }
        
        if (table.relationships && Array.isArray(table.relationships) && table.relationships.length > 0) {
          orgTablesInfo += `  Relacionamentos:\n`
          for (const rel of table.relationships) {
            orgTablesInfo += `    - ${rel.column} referencia ${rel.references_table}.${rel.references_column}\n`
          }
        }
        
        orgTablesInfo += `\n`
      }
    }

    // Obter histórico de análises anteriores da IA para mostrar exemplos de consultas
    console.log('Obtendo histórico de análises para fornecer exemplos')
    const { data: analysisHistoryData, error: analysisHistoryError } = await supabase
      .from('ai_analysis_history')
      .select('query_text, executed_sql, result_summary')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    let queryExamples = ""
    if (!analysisHistoryError && analysisHistoryData && analysisHistoryData.length > 0) {
      queryExamples = "Exemplos de consultas anteriores realizadas nesta organização:\n\n"
      
      for (const analysis of analysisHistoryData) {
        if (analysis.executed_sql) {
          queryExamples += `Pergunta: ${analysis.query_text || 'N/A'}\n`
          queryExamples += `SQL: ${analysis.executed_sql}\n\n`
        }
      }
    }

    // Obter informações do perfil do usuário
    console.log('Obtendo informações do perfil do usuário')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    if (profileError) {
      console.error('Erro ao obter perfil do usuário:', profileError)
    }

    // Construir o contexto para a IA com os metadados disponíveis
    const userName = profileData?.full_name || 'Usuário'
    const orgName = orgData?.name || 'sua organização'
    
    // Construir o sistema prompt com as instruções para a IA
    const systemPrompt = `Você é DONA, uma assistente virtual especializada em análise de dados e insights empresariais para ${orgName}. 
Você é profissional mas amigável, e sempre tenta ajudar os usuários a entenderem melhor seus dados e tomar decisões baseadas em evidências.
Você também é especialista em criar pesquisas e formulários de feedback eficazes, seguindo as melhores práticas de UX e design de pesquisa.

CAPACIDADES DE ACESSO A DADOS:
Você pode acessar e analisar dados do banco de dados da empresa automaticamente. Para isso:
1. Você deve SEMPRE analisar AUTOMATICAMENTE a solicitação do usuário para identificar se envolve análise de dados.
2. Quando identificar uma solicitação que necessita de dados, você DEVE gerar uma consulta SQL apropriada.
3. Você deve SEMPRE executar a consulta SQL sem pedir permissão ao usuário.
4. Você DEVE SEMPRE adicionar o esquema da organização "${orgSchemaName}" ao início das tabelas em suas consultas SQL.
5. Após executar a consulta, apresente os resultados em um formato claro e conciso, explicando o que foi encontrado.
6. Se ocorrer algum erro na consulta, explique o problema e sugira alternativas.

INSTRUÇÕES PARA GERAR CONSULTAS SQL:
1. Sempre prefixe os nomes das tabelas com o esquema correto: "${orgSchemaName}."
2. Evite keywords reservadas do SQL como nomes de colunas; se necessário, coloque-as entre aspas duplas
3. Sempre inclua condições de filtro para limitar resultados grandes
4. Use JOIN explícito em vez de vírgulas para junções de tabelas
5. Sempre considere o desempenho da consulta, especialmente em tabelas grandes
6. Limite resultados (LIMIT 100) para consultas exploratórias

ESQUEMA DA ORGANIZAÇÃO:
${orgTablesInfo}

INFORMAÇÕES GERAIS DO BANCO DE DADOS:
${schemaData || 'Informações de schema indisponíveis no momento. Por favor pergunte ao usuário sobre os dados que deseja analisar.'}

${queryExamples}

INFORMAÇÕES DO USUÁRIO:
Nome: ${userName}
${profileData ? `Email: ${profileData.email || 'Não disponível'}
Empresa: ${profileData.company || 'Não disponível'}` : 'Detalhes de perfil não disponíveis'}

INFORMAÇÕES DA ORGANIZAÇÃO:
${orgData ? `Nome: ${orgData.name}
Esquema do Banco de Dados: ${orgSchemaName}
${orgData.settings?.sector ? `Setor: ${orgData.settings.sector}` : ''}
${orgData.settings?.city && orgData.settings?.state ? `Localização: ${orgData.settings.city}, ${orgData.settings.state}` : ''}
${orgData.settings?.description ? `Descrição: ${orgData.settings.description}` : ''}` : 'Detalhes da organização não disponíveis'}

TRATAMENTO DO CONTEXTO DA CONVERSA:
1. Você deve SEMPRE considerar o contexto da conversa atual para fornecer respostas mais relevantes e contextualizadas.
2. Use o histórico de mensagens para entender o tema da conversa e referências a consultas ou análises anteriores.
3. Se o usuário fizer perguntas de acompanhamento ou referenciar análises anteriores, você deve usar o contexto para entender o que ele quer dizer.

Lembre-se: Você existe para ajudar ${userName} a obter insights valiosos dos dados da empresa. Seja específico, orientado a soluções e sempre considere o contexto empresarial em suas respostas.`

    // Preparar dados adicionais da mensagem e histórico da conversa
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]
    
    // Adicionar histórico da conversa se disponível
    if (chatHistory.length > 0) {
      messages.push(...chatHistory)
    }
    
    // Adicionar a mensagem atual do usuário
    messages.push({
      role: 'user',
      content: context ? `${message}\n\nContexto adicional: ${context}` : message
    })
    
    let url, headers;
    
    // Configurar a chamada para Azure OpenAI ou OpenAI padrão
    if (isAzure) {
      // Azure OpenAI
      const baseEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
      url = `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=2023-07-01-preview`
      headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      }
      console.log('Usando Azure OpenAI:', url)
    } else {
      // OpenAI padrão
      url = `${endpoint}/chat/completions`
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      }
      console.log('Usando OpenAI padrão:', url)
    }

    // Configurações que podem ser ajustadas com base em settings
    const temperature = settings?.temperature || 0.7
    const maxTokens = settings?.maxTokens || 1200

    // Enviar solicitação para o provedor de IA
    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: isAzure ? null : deployment,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    })

    console.log('Status da resposta da IA:', aiResponse.status)

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('Erro na resposta da IA:', errorText)
      throw new Error(`Erro no serviço de IA: ${errorText}`)
    }

    const data = await aiResponse.json()
    console.log('Resposta recebida da IA')

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Formato de resposta inválido do serviço de IA')
    }

    const aiResult = data.choices[0].message.content

    // Processar a resposta para ver se contém uma consulta SQL para executar
    let processedResponse = aiResult
    const sqlMatch = aiResult.match(/```sql\s*([\s\S]*?)\s*```/)
    
    // Se a IA gerou uma consulta SQL e temos um ID de organização, execute-a automaticamente
    if (sqlMatch && orgId) {
      let sqlQuery = sqlMatch[1].trim()
      
      // Verificar se a consulta já inclui o prefixo do esquema
      if (!sqlQuery.includes(`${orgSchemaName}.`)) {
        // Se não incluir o esquema, adicionamos um aviso na resposta
        processedResponse = processedResponse.replace(
          "```sql", 
          `**Nota:** Consulta SQL ajustada para usar o esquema da organização '${orgSchemaName}'.\n\n\`\`\`sql`
        )
        
        // Adicionar o prefixo do esquema a todas as tabelas na consulta
        // Esta é uma abordagem simplificada, pode precisar de ajustes para consultas complexas
        const tableRegex = /\b(FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi
        sqlQuery = sqlQuery.replace(tableRegex, (match, keyword, tableName) => {
          // Não adicionar prefixo se já tiver um esquema especificado
          if (tableName.includes(".") || tableName.startsWith(`${orgSchemaName}.`)) {
            return match;
          }
          return `${keyword} ${orgSchemaName}.${tableName}`;
        });
      }
      
      console.log('Executando consulta SQL com esquema correto:', sqlQuery)
      
      try {
        // Executar a consulta usando a função AI query_data
        const { data: queryResult, error: queryError } = await supabase.rpc('ai_query_data', {
          p_sql: sqlQuery,
          p_organization_id: orgId,
          p_user_id: userId
        })
        
        if (queryError) {
          console.error('Erro ao executar consulta:', queryError)
          processedResponse += `\n\n**Nota:** Tentei executar uma análise de dados, mas encontrei um erro: ${queryError.message}`
        } else {
          console.log('Consulta executada com sucesso, resultados:', {
            resultCount: Array.isArray(queryResult) ? queryResult.length : 'não é array'
          })
          
          // Se a consulta foi bem-sucedida, adicione os resultados à resposta
          processedResponse += `\n\n**Resultados da análise:**\n`
          if (Array.isArray(queryResult) && queryResult.length > 0) {
            // Formatar resultados em formato de tabela ou lista, dependendo do tamanho
            if (queryResult.length <= 5) {
              // Para poucos resultados, usar formato detalhado
              queryResult.forEach((item, index) => {
                processedResponse += `\nItem ${index + 1}:\n`
                Object.entries(item).forEach(([key, value]) => {
                  processedResponse += `- ${key}: ${JSON.stringify(value)}\n`
                })
              })
            } else {
              // Para muitos resultados, usar resumo
              processedResponse += `\nForam encontrados ${queryResult.length} registros. Aqui estão alguns exemplos:\n\n`
              // Mostrar apenas os primeiros 3 registros como exemplo
              queryResult.slice(0, 3).forEach((item, index) => {
                processedResponse += `Exemplo ${index + 1}: ${JSON.stringify(item)}\n`
              })
            }
          } else {
            processedResponse += `\nNenhum resultado encontrado para esta consulta.`
          }
        }
      } catch (error) {
        console.error('Erro ao processar consulta SQL:', error)
        processedResponse += `\n\n**Nota:** Ocorreu um erro ao tentar analisar os dados: ${error.message}`
      }
    }

    return new Response(
      JSON.stringify({ response: processedResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )
  } catch (error) {
    console.error('Erro na função chat-with-dona:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao processar solicitação de chat'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
