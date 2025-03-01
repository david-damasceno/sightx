
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.32.0'
import { corsHeaders } from '../_shared/cors.ts'

interface AnalyzeTableContextRequest {
  fileId: string;
  organizationId: string;
}

serve(async (req) => {
  // Lidar com opções de CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { fileId, organizationId } = await req.json() as AnalyzeTableContextRequest
    
    // Buscar informações do arquivo
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single()
    
    if (fileError || !fileData) {
      throw new Error(fileError?.message || 'Arquivo não encontrado')
    }
    
    // Buscar metadados das colunas
    const { data: columnsData, error: columnsError } = await supabase
      .from('column_metadata')
      .select('*')
      .eq('import_id', fileId)
    
    if (columnsError) {
      throw new Error(columnsError.message)
    }
    
    // Buscar amostra de dados da tabela
    const { data: sampleData, error: sampleError } = await supabase
      .from(fileData.table_name)
      .select('*')
      .limit(10)
    
    if (sampleError) {
      throw new Error(sampleError.message)
    }
    
    // Preparar dados para análise com Azure OpenAI
    const azureApiKey = Deno.env.get('AZURE_OPENAI_API_KEY') || ''
    const azureEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT') || ''
    const azureDeploymentName = Deno.env.get('AZURE_OPENAI_DEPLOYMENT') || ''
    
    if (!azureApiKey || !azureEndpoint || !azureDeploymentName) {
      throw new Error('Configurações do Azure OpenAI não encontradas')
    }
    
    // Montar prompt para o Azure OpenAI
    const columnsList = columnsData.map(col => ({
      name: col.original_name,
      data_type: col.data_type,
      sample_values: col.sample_values
    }))
    
    const prompt = `
      Analise esta tabela de dados e gere:
      1. Uma descrição clara do que representa esta tabela (em português)
      2. Nomes formatados e descrições para cada coluna

      Informações da tabela:
      - Nome da tabela: ${fileData.table_name}
      - Número de registros: ${fileData.row_count}
      
      Colunas:
      ${JSON.stringify(columnsList, null, 2)}
      
      Amostra de dados:
      ${JSON.stringify(sampleData, null, 2)}
      
      Formate a resposta como JSON com as seguintes propriedades:
      {
        "tableDescription": "...",
        "columns": [
          {
            "originalName": "...",
            "displayName": "...",
            "description": "..."
          }
        ]
      }
    `
    
    // Chamar a API do Azure OpenAI
    const azureResponse = await fetch(
      `${azureEndpoint}/openai/deployments/${azureDeploymentName}/chat/completions?api-version=2023-05-15`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureApiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de dados que está ajudando a contextualizar e descrever conjuntos de dados para facilitar seu entendimento e uso.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      }
    )
    
    const azureResponseData = await azureResponse.json()
    const analysisContent = azureResponseData.choices[0].message.content
    
    let analysisResult
    try {
      analysisResult = JSON.parse(analysisContent)
    } catch (e) {
      throw new Error('Erro ao interpretar resposta da IA: ' + e.message)
    }
    
    // Atualizar a descrição da tabela
    await supabase
      .from('data_imports')
      .update({
        context: analysisResult.tableDescription
      })
      .eq('id', fileId)
    
    // Atualizar metadados das colunas
    for (const column of analysisResult.columns) {
      const columnData = columnsData.find(c => c.original_name === column.originalName)
      
      if (columnData) {
        await supabase
          .from('column_metadata')
          .update({
            display_name: column.displayName,
            description: column.description
          })
          .eq('id', columnData.id)
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contexto da tabela analisado com sucesso',
        analysis: analysisResult
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
    
  } catch (error) {
    console.error(error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})
