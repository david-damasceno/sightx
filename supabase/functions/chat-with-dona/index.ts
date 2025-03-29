
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
          
        // Limitamos para as últimas 20 mensagens para não exceder o contexto
        if (chatHistory.length > 20) {
          chatHistory = chatHistory.slice(-20)
        }
        
        console.log(`Carregado histórico do chat com ${chatHistory.length} mensagens`)
      }
    }

    // Obter descrição detalhada do schema da organização usando nossa nova função
    console.log('Obtendo descrição detalhada do schema da organização')
    const { data: schemaDescription, error: schemaError } = await supabase.rpc(
      'get_organization_schema_description',
      { p_organization_id: orgId }
    )
    
    if (schemaError) {
      console.error('Erro ao obter descrição do schema:', schemaError)
    } else {
      console.log('Descrição do schema obtida com sucesso, tamanho:', schemaDescription?.length || 0)
    }
    
    // Obter metadados completos do schema para uso da IA
    console.log('Obtendo metadados completos do schema da organização')
    const { data: schemaMetadata, error: metadataError } = await supabase.rpc(
      'get_organization_schema_metadata',
      { p_organization_id: orgId }
    )
    
    if (metadataError) {
      console.error('Erro ao obter metadados do schema:', metadataError)
    } else {
      console.log('Metadados do schema obtidos com sucesso, tabelas:', schemaMetadata?.length || 0)
    }

    // Obter histórico de análises anteriores e consultas SQL para enriquecer o contexto
    console.log('Obtendo histórico de análises para fornecer exemplos')
    const { data: analysisHistoryData, error: analysisHistoryError } = await supabase
      .from('ai_analysis_history')
      .select('query_text, executed_sql, result_summary')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(15)
    
    let queryExamples = ""
    if (!analysisHistoryError && analysisHistoryData && analysisHistoryData.length > 0) {
      queryExamples = "Exemplos de consultas anteriores realizadas nesta organização:\n\n"
      
      for (const analysis of analysisHistoryData) {
        if (analysis.executed_sql) {
          queryExamples += `Pergunta: ${analysis.query_text || 'N/A'}\n`
          queryExamples += `SQL: ${analysis.executed_sql}\n`
          queryExamples += `Resultado: ${analysis.result_summary || 'N/A'}\n\n`
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
    
    // Identificar a preferência de formato de análise do usuário
    const aiSettings = settings || {}
    const temperature = aiSettings.temperature || 0.7
    const preferredModel = aiSettings.model || 'gpt-4'
    const systemPromptMode = temperature > 0.5 ? 'criativo' : 'analítico'
    
    // Obter os insights mais recentes para referência
    const { data: recentInsights, error: insightsError } = await supabase.rpc(
      'get_recent_organization_insights',
      { 
        p_organization_id: orgId,
        p_limit: 5 
      }
    ).maybeSingle()
    
    const insightsContext = !insightsError && recentInsights ? 
      `Insights recentes detectados: ${JSON.stringify(recentInsights)}` : 
      'Nenhum insight recente disponível'
    
    // Construir o sistema prompt com as instruções para a IA
    const systemPrompt = `Você é Donna, uma assistente virtual especializada em análise de dados e insights empresariais para ${orgName}. 
Você é profissional mas amigável, e sempre tenta ajudar os usuários a entenderem melhor seus dados e tomar decisões baseadas em evidências.
Seu modo atual é: ${systemPromptMode}.

CAPACIDADES E RESPONSABILIDADES:
1. Você tem acesso total ao esquema do banco de dados da organização "${orgName}" e pode gerar e executar consultas SQL.
2. Você deve SEMPRE analisar AUTOMATICAMENTE a solicitação do usuário para identificar se envolve análise de dados.
3. Quando identificar uma solicitação que necessita de dados, você DEVE gerar uma consulta SQL apropriada.
4. Você deve SEMPRE usar o esquema da organização "${orgSchemaName}." como prefixo para todas as tabelas em suas consultas SQL.
5. Após executar a consulta, você deve apresentar insights acionáveis baseados nos resultados.
6. Você deve ser proativa ao identificar padrões, tendências e anomalias nos dados.
7. Seu objetivo final é transformar dados brutos em informações estratégicas valiosas.

ESQUEMA COMPLETO DA ORGANIZAÇÃO:
${schemaDescription || 'Informações de schema indisponíveis no momento.'}

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

${insightsContext}

INSTRUÇÕES PARA CONSULTAS SQL:
1. Sempre prefixe os nomes das tabelas com "${orgSchemaName}."
2. Evite keywords reservadas do SQL como nomes de colunas
3. Inclua condições de filtro para limitar resultados grandes
4. Use JOIN explícito em vez de vírgulas para junções
5. Considere o desempenho para consultas em tabelas grandes
6. Limite resultados (LIMIT 100) para consultas exploratórias
7. Sempre verifique o tipo de dados das colunas antes de criar condições

ANÁLISE DE DADOS:
1. Ao analisar dados numéricos, considere médias, medianas, tendências e outliers
2. Para dados temporais, identifique padrões sazonais e tendências
3. Ao comparar categorias, destaque diferenças significativas
4. Sempre considere o contexto de negócio em suas análises
5. Sugira visualizações apropriadas para os diferentes tipos de análise
6. Identifique oportunidades para segmentação de clientes ou produtos

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
    const maxTokens = settings?.maxTokens || 2000

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
              
              // Adicionar análise automática dos resultados
              try {
                const { data: analysisResult } = await supabase.rpc('analyze_query_results', {
                  p_results: JSON.stringify(queryResult),
                  p_query: sqlQuery,
                  p_org_id: orgId
                })
                
                if (analysisResult) {
                  processedResponse += `\n\n**Análise automática:**\n${analysisResult}`
                }
              } catch (analysisError) {
                console.error('Erro na análise automática:', analysisError)
              }
            }
          } else {
            processedResponse += `\nNenhum resultado encontrado para esta consulta.`
          }
          
          // Verificar se devemos salvar insights desta análise
          try {
            if (queryResult && queryResult.length > 0) {
              await supabase.rpc('generate_insights_from_query', {
                p_org_id: orgId,
                p_user_id: userId,
                p_query: sqlQuery,
                p_results: JSON.stringify(queryResult)
              })
            }
          } catch (insightError) {
            console.error('Erro ao gerar insights:', insightError)
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
