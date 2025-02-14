
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import * as XLSX from "https://esm.sh/xlsx@0.18.5"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileId } = await req.json()

    if (!fileId) {
      throw new Error('FileId is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar dados do arquivo
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .single()

    if (importError) throw importError
    if (!importData) throw new Error('Import not found')

    // Baixar arquivo do storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(importData.storage_path)

    if (downloadError) throw downloadError

    // Ler o arquivo
    const arrayBuffer = await fileData.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    
    let workbook
    try {
      workbook = XLSX.read(data, { type: 'array' })
    } catch (error) {
      throw new Error('Invalid file format')
    }

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

    if (!Array.isArray(jsonData) || jsonData.length < 2) {
      throw new Error('File must contain at least a header row and one data row')
    }

    const headers = jsonData[0] as string[]
    const dataRows = jsonData.slice(1)

    // Análise das colunas
    const columnAnalysis = headers.map((header, index) => {
      const columnData = dataRows.map(row => row[index])
      const sample = columnData[0]
      
      let type = 'text'
      if (typeof sample === 'number') {
        type = Number.isInteger(sample) ? 'integer' : 'numeric'
      } else if (typeof sample === 'boolean') {
        type = 'boolean'
      } else if (sample instanceof Date) {
        type = 'timestamp'
      }

      // Detectar padrões
      const patterns = {
        email: columnData.some(value => 
          typeof value === 'string' && 
          value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ),
        url: columnData.some(value =>
          typeof value === 'string' &&
          value.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/)
        ),
        phone: columnData.some(value =>
          typeof value === 'string' &&
          value.match(/^[\d\s()-+]+$/)
        )
      }

      return {
        name: header,
        type,
        sample,
        nullCount: columnData.filter(v => v === null || v === undefined).length,
        uniqueCount: new Set(columnData).size,
        patterns
      }
    })

    // Atualizar metadados
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'analyzing',
        row_count: dataRows.length,
        columns_metadata: { columns: columnAnalysis },
        column_analysis: columnAnalysis
      })
      .eq('id', fileId)

    if (updateError) throw updateError

    // Chamar Azure OpenAI para sugerir nomes
    const openaiEndpoint = Deno.env.get('AZURE_OPENAI_ENDPOINT')
    const openaiKey = Deno.env.get('AZURE_OPENAI_API_KEY')
    const openaiDeployment = Deno.env.get('AZURE_OPENAI_DEPLOYMENT')

    if (openaiEndpoint && openaiKey && openaiDeployment) {
      try {
        const response = await fetch(
          `${openaiEndpoint}/openai/deployments/${openaiDeployment}/chat/completions?api-version=2023-05-15`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': openaiKey
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: 'Você é um especialista em análise de dados. Sugira nomes padronizados para colunas de dados.'
                },
                {
                  role: 'user',
                  content: `Analise estas colunas e sugira nomes padronizados em snake_case:
                    ${JSON.stringify(columnAnalysis, null, 2)}`
                }
              ],
              temperature: 0.3,
              max_tokens: 800
            })
          }
        )

        const suggestions = await response.json()
        
        if (suggestions.choices && suggestions.choices[0]) {
          await supabase
            .from('data_imports')
            .update({
              column_suggestions: suggestions.choices[0].message.content
            })
            .eq('id', fileId)
        }
      } catch (error) {
        console.error('Erro ao obter sugestões:', error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        columns: columnAnalysis,
        rowCount: dataRows.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
