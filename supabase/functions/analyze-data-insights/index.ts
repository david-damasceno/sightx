
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.2'

const apiKey = Deno.env.get('AZURE_OPENAI_API_KEY') || Deno.env.get('OPENAI_API_KEY')
const endpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || "https://api.openai.com/v1"
const deployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || "gpt-4o-mini"
const isAzure = !!Deno.env.get('AZURE_OPENAI_ENDPOINT')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { previewData, description, importId, organizationId } = await req.json()

    if (!previewData || !importId || !organizationId) {
      throw new Error('Dados insuficientes para análise')
    }

    // Inicializar o cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar informações da organização para obter o esquema e outros metadados
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .select('*, settings')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Erro ao buscar organização:', orgError)
      throw new Error('Organização não encontrada')
    }

    const orgSchemaName = orgData?.settings?.schema_name || 'public'
    console.log(`Usando esquema da organização: ${orgSchemaName} para análise de dados`)

    // Buscar informações adicionais sobre o contexto da organização
    const { data: contextData, error: contextError } = await supabase.rpc('get_ai_schema_summary')
    
    if (contextError) {
      console.error('Erro ao obter contexto de schema:', contextError)
    }

    // Analisar a estrutura dos dados de exemplo para sugerir análises mais precisas
    const columns = Object.keys(previewData[0] || {})
    const dataTypes = columns.reduce((types, col) => {
      const sampleValues = previewData.slice(0, 5).map(row => row[col])
      types[col] = inferDataType(sampleValues)
      return types
    }, {})
    
    // Identificar possíveis métricas e dimensões
    const metrics = columns.filter(col => 
      ['number', 'integer', 'float', 'currency'].includes(dataTypes[col])
    )
    
    const dimensions = columns.filter(col => 
      ['string', 'date', 'datetime', 'category', 'boolean'].includes(dataTypes[col])
    )

    // Detectar relacionamentos potenciais com outras tabelas no esquema
    const potentialRelationships = detectPotentialRelationships(columns, orgSchemaName, contextData)

    // Analisar padrões temporais se existirem colunas de data
    const temporalColumns = columns.filter(col => 
      ['date', 'datetime'].includes(dataTypes[col])
    )
    
    // Construir um prompt inteligente e contextualizado para a IA
    const prompt = buildAdvancedPrompt({
      description,
      previewData: previewData.slice(0, 10),
      orgSchemaName,
      columns,
      dataTypes,
      metrics,
      dimensions,
      temporalColumns,
      potentialRelationships,
      contextData
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
    } else {
      // OpenAI padrão
      url = `${endpoint}/chat/completions`
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      }
    }

    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: isAzure ? null : deployment,
        messages: [
          { role: 'system', content: 'Você é um analista de dados especializado em identificar insights e sugerir visualizações de dados para empresas.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error('Erro ao gerar sugestões de análise')
    }

    const data = await aiResponse.json()
    const resultContent = data.choices[0].message.content
    
    // Processar e validar o resultado da IA
    let suggestions = processAIResponse(resultContent)

    // Validar e enriquecer as sugestões da IA
    suggestions = enrichSuggestions(suggestions, {
      orgSchemaName,
      columns,
      dataTypes,
      metrics,
      dimensions
    })

    // Salvar sugestões no banco de dados
    const { error: insertError } = await supabase
      .from('data_analysis_suggestions')
      .insert({
        organization_id: organizationId,
        data_import_id: importId,
        suggested_analyses: suggestions
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify({ 
        suggestions,
        schema: orgSchemaName,
        dataStructure: {
          columns,
          dataTypes,
          metrics,
          dimensions,
          temporalColumns
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro na função analyze-data-insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Função para inferir o tipo de dados com base nos valores de amostra
function inferDataType(sampleValues) {
  let types = {
    number: 0,
    date: 0,
    string: 0,
    boolean: 0,
    empty: 0
  }

  for (const value of sampleValues) {
    if (value === null || value === undefined || value === '') {
      types.empty++
      continue
    }

    const valueStr = String(value).trim()

    // Verificar se é booleano
    if (['true', 'false', 'sim', 'não', 'yes', 'no', '0', '1'].includes(valueStr.toLowerCase())) {
      types.boolean++
      continue
    }

    // Verificar se é número
    if (!isNaN(Number(valueStr)) && valueStr !== '') {
      types.number++
      continue
    }

    // Verificar se é data
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T|\s)?\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/
    const dateRegex2 = /^\d{2}[\/.-]\d{2}[\/.-]\d{4}$/
    if (dateRegex.test(valueStr) || dateRegex2.test(valueStr) || !isNaN(Date.parse(valueStr))) {
      types.date++
      continue
    }

    // Se nenhum dos acima, é uma string
    types.string++
  }

  // Determinar o tipo predominante
  const maxType = Object.entries(types).reduce((max, [type, count]) => {
    return count > max.count ? { type, count } : max
  }, { type: 'string', count: 0 })

  // Categorias especiais para números
  if (maxType.type === 'number') {
    // Verificar se é monetário
    if (sampleValues.some(v => String(v).includes('R$') || String(v).includes('$'))) {
      return 'currency'
    }
    
    // Verificar se tem decimais
    if (sampleValues.some(v => String(v).includes('.'))) {
      return 'float'
    }
    
    return 'integer'
  }

  return maxType.type === 'date' ? 'datetime' : maxType.type
}

// Função para detectar relacionamentos potenciais
function detectPotentialRelationships(columns, orgSchemaName, contextData) {
  const relationships = []
  
  if (!contextData) return relationships

  // Procurar por padrões comuns de chaves estrangeiras nos nomes das colunas
  const fkPatterns = [
    '_id$', 
    'Id$', 
    '_code$', 
    '_key$',
    'user', 
    'customer', 
    'product', 
    'order', 
    'client'
  ]
  
  for (const column of columns) {
    // Verificar padrões de nome de coluna que sugerem chaves estrangeiras
    if (fkPatterns.some(pattern => {
      const regex = new RegExp(pattern, 'i')
      return regex.test(column)
    })) {
      // Extrair o nome da tabela potencial da coluna
      let potentialTable = column
        .replace(/_id$/i, '')
        .replace(/Id$/i, '')
        .replace(/_code$/i, '')
        .replace(/_key$/i, '')
      
      // Verificar se essa tabela existe no contextData
      if (contextData.includes(`Tabela: ${potentialTable}`)) {
        relationships.push({
          column,
          potentialTable,
          schemaName: orgSchemaName
        })
      }
    }
  }
  
  return relationships
}

// Função para construir um prompt avançado para a IA
function buildAdvancedPrompt({ 
  description, 
  previewData, 
  orgSchemaName,
  columns,
  dataTypes,
  metrics,
  dimensions,
  temporalColumns,
  potentialRelationships,
  contextData
}) {
  // Criar uma descrição estruturada dos dados
  const dataStructure = columns.map(col => 
    `- ${col} (Tipo: ${dataTypes[col] || 'desconhecido'}${metrics.includes(col) ? ', Métrica' : ''}${dimensions.includes(col) ? ', Dimensão' : ''}${temporalColumns.includes(col) ? ', Temporal' : ''})`
  ).join('\n')
  
  // Criar uma descrição dos relacionamentos potenciais
  const relationshipsDescription = potentialRelationships.length > 0 
    ? potentialRelationships.map(rel => 
        `- A coluna "${rel.column}" pode se relacionar com a tabela "${rel.potentialTable}" no esquema "${rel.schemaName}"`
      ).join('\n')
    : 'Nenhum relacionamento potencial identificado.'

  // Construir o prompt completo
  return `Como um analista de dados especializado, analise os seguintes dados e sugira análises relevantes e impactantes para negócios.
  
Descrição dos dados: ${description || 'Não fornecida'}

Estrutura dos dados:
${dataStructure}

Métricas identificadas: ${metrics.join(', ') || 'Nenhuma métrica numérica identificada'}
Dimensões identificadas: ${dimensions.join(', ') || 'Nenhuma dimensão identificada'}
Colunas temporais: ${temporalColumns.join(', ') || 'Nenhuma coluna temporal identificada'}

Relacionamentos potenciais:
${relationshipsDescription}

Dados de exemplo:
${JSON.stringify(previewData, null, 2)}

Esquema do banco de dados a ser usado: ${orgSchemaName}

Contexto do banco de dados:
${contextData || 'Informações de contexto não disponíveis'}

Sugira análises estratégicas e visualizações que possam:
1. Revelar insights de negócios valiosos
2. Identificar tendências e padrões
3. Encontrar correlações entre diferentes métricas
4. Segmentar dados para análises mais profundas
5. Prever comportamentos futuros (quando possível)

IMPORTANTE: Quando gerar consultas SQL, SEMPRE use o esquema "${orgSchemaName}." como prefixo para todas as tabelas.
Exemplo: Use "${orgSchemaName}.nome_da_tabela" em vez de apenas "nome_da_tabela".

Para cada análise sugerida, forneça:
1. Título claro e objetivo da análise
2. Descrição detalhada do insight que pode ser descoberto
3. Métricas relevantes para a análise
4. Tipo de visualização mais adequada
5. Exemplo de consulta SQL quando aplicável
6. Categoria da análise (série temporal, correlação, distribuição, agrupamento, segmentação, previsão, detecção de anomalias)

Retorne um array JSON com o seguinte formato para cada análise:
{
  "title": "título da análise",
  "description": "descrição detalhada",
  "metrics": ["métrica 1", "métrica 2"],
  "visualization": "tipo de visualização",
  "sql_example": "SELECT ... FROM ${orgSchemaName}.tabela ...",
  "type": "um dos seguintes: time_series, correlation, distribution, clustering, segmentation, forecasting, anomaly_detection"
}

Forneça no mínimo 3 e no máximo 7 análises diferentes e complementares.`
}

// Processar e validar a resposta da IA
function processAIResponse(resultContent) {
  try {
    // Tentar analisar o JSON diretamente
    return JSON.parse(resultContent)
  } catch (e) {
    // Se falhar, procurar por um array JSON na resposta
    const jsonMatch = resultContent.match(/\[\s*\{.*\}\s*\]/s)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('Erro ao processar resposta JSON:', e)
      }
    }
    
    // Se ainda falhar, retornar um array com a resposta como texto
    return [{
      title: "Análise de dados",
      description: "A IA gerou uma resposta em formato não estruturado. Revise o conteúdo manualmente.",
      metrics: [],
      visualization: "texto",
      type: "text_analysis",
      raw_content: resultContent
    }]
  }
}

// Enriquecer as sugestões da IA com validações e melhorias
function enrichSuggestions(suggestions, context) {
  const { orgSchemaName, columns, dataTypes, metrics, dimensions } = context
  
  return suggestions.map(suggestion => {
    // Garantir que o esquema está corretamente aplicado em consultas SQL
    if (suggestion.sql_example) {
      suggestion.sql_example = ensureSchemaPrefix(suggestion.sql_example, orgSchemaName)
    }
    
    // Limitar o número de métricas a 3 para não sobrecarregar visualizações
    if (suggestion.metrics && suggestion.metrics.length > 3) {
      suggestion.metrics = suggestion.metrics.slice(0, 3)
    }
    
    // Adicionar informação de complexidade da análise
    suggestion.complexity = calculateComplexity(suggestion, metrics.length, dimensions.length)
    
    // Adicionar informação de valor de negócio estimado
    suggestion.business_value = estimateBusinessValue(suggestion)
    
    // Adicionar recomendação de tags para organização
    suggestion.tags = generateTags(suggestion, dataTypes)
    
    return suggestion
  })
}

// Garantir que todas as referências a tabelas tenham o prefixo do esquema
function ensureSchemaPrefix(sql, schemaName) {
  // Regex para encontrar referências a tabelas em consultas SQL
  const tableRegex = /\b(FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/gi
  
  // Substituir todas as ocorrências que não têm o prefixo do esquema
  return sql.replace(tableRegex, (match, keyword, tableName) => {
    // Não adicionar prefixo se já tiver um esquema especificado
    if (tableName.includes(".") || tableName.startsWith(`${schemaName}.`)) {
      return match
    }
    return `${keyword} ${schemaName}.${tableName}`
  })
}

// Calcular a complexidade da análise
function calculateComplexity(suggestion, totalMetrics, totalDimensions) {
  let score = 0
  
  // Avaliar com base no tipo de análise
  switch (suggestion.type) {
    case 'anomaly_detection':
    case 'forecasting':
      score += 3
      break
    case 'correlation':
    case 'segmentation':
      score += 2
      break
    case 'time_series':
    case 'distribution':
      score += 1
      break
    default:
      break
  }
  
  // Avaliar com base no número de métricas utilizadas
  if (suggestion.metrics) {
    score += Math.min(suggestion.metrics.length / totalMetrics * 2, 2)
  }
  
  // Normalizar para uma escala de 1-5
  const normalized = Math.max(1, Math.min(5, Math.round(score)))
  
  return {
    score: normalized,
    label: ['Muito simples', 'Simples', 'Moderada', 'Complexa', 'Muito complexa'][normalized - 1]
  }
}

// Estimar o valor de negócio da análise
function estimateBusinessValue(suggestion) {
  let score = 3 // Valor base moderado
  
  // Análises com previsões ou detecção de anomalias tendem a ter valor mais alto
  if (['forecasting', 'anomaly_detection'].includes(suggestion.type)) {
    score += 1
  }
  
  // Análises que mencionam termos de negócio importantes
  const businessTerms = ['receita', 'lucro', 'custo', 'cliente', 'venda', 'conversion', 'ROI']
  const hasBusinessTerms = businessTerms.some(term => 
    suggestion.title.toLowerCase().includes(term) || 
    suggestion.description.toLowerCase().includes(term)
  )
  
  if (hasBusinessTerms) {
    score += 1
  }
  
  // Normalizar para uma escala de 1-5
  const normalized = Math.max(1, Math.min(5, score))
  
  return {
    score: normalized,
    label: ['Muito baixo', 'Baixo', 'Moderado', 'Alto', 'Muito alto'][normalized - 1]
  }
}

// Gerar tags para facilitar a organização das análises
function generateTags(suggestion, dataTypes) {
  const tags = []
  
  // Adicionar o tipo de análise como tag
  tags.push(suggestion.type)
  
  // Adicionar tags baseadas na visualização
  if (suggestion.visualization) {
    if (['bar chart', 'barra', 'gráfico de barras'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('bar-chart')
    } else if (['line chart', 'linha', 'gráfico de linha'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('line-chart')
    } else if (['pie', 'pizza', 'torta'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('pie-chart')
    } else if (['scatter', 'dispersão'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('scatter-plot')
    } else if (['heat', 'calor'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('heatmap')
    } else if (['table', 'tabela'].some(v => 
      suggestion.visualization.toLowerCase().includes(v))) {
      tags.push('table')
    }
  }
  
  // Adicionar tags relacionadas aos tipos de dados
  const hasDatetime = Object.values(dataTypes).some(type => ['date', 'datetime'].includes(type))
  if (hasDatetime) {
    tags.push('temporal')
  }
  
  if (suggestion.title.toLowerCase().includes('previsão') || 
      suggestion.description.toLowerCase().includes('previsão')) {
    tags.push('prediction')
  }
  
  return tags
}
