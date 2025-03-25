
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2"

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para obter o cliente Supabase com a chave de serviço
export const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Função para verificar se uma tabela existe no esquema da organização
export async function tableExists(supabase: any, schema: string, tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('table_exists', {
      p_schema_name: schema,
      p_table_name: tableName
    })
    
    if (error) throw error
    return !!data
  } catch (error) {
    console.error(`Erro ao verificar existência da tabela ${schema}.${tableName}:`, error)
    return false
  }
}

// Função para obter o esquema da organização
export async function getOrganizationSchema(supabase: any, orgId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', orgId)
      .maybeSingle()
      
    if (error) throw error
    
    return data?.settings?.schema_name || 'public'
  } catch (error) {
    console.error('Erro ao obter esquema da organização:', error)
    return 'public'
  }
}

// Função para obter metadados de uma tabela
export async function getTableMetadata(supabase: any, schema: string, tableName: string) {
  try {
    const { data, error } = await supabase.rpc('get_table_metadata', {
      p_schema_name: schema,
      p_table_name: tableName
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error(`Erro ao obter metadados da tabela ${schema}.${tableName}:`, error)
    return null
  }
}

// Função para atualizar ou criar o índice de conhecimento da IA
export async function updateAIKnowledgeIndex(
  supabase: any, 
  schema: string, 
  tableName: string, 
  description: string, 
  columnMetadata: any
) {
  try {
    // Verificar se já existe entrada para esta tabela e esquema
    const { data: existingIndex, error: queryError } = await supabase
      .from('ai_knowledge_index')
      .select('id')
      .eq('schema_name', schema)
      .eq('entity_name', tableName)
      .eq('entity_type', 'table')
      .maybeSingle()
      
    if (queryError) throw queryError
    
    if (existingIndex?.id) {
      // Atualizar entrada existente
      const { error: updateError } = await supabase
        .from('ai_knowledge_index')
        .update({
          description,
          column_metadata: columnMetadata,
          last_updated: new Date().toISOString()
        })
        .eq('id', existingIndex.id)
        
      if (updateError) throw updateError
    } else {
      // Criar nova entrada
      const { error: insertError } = await supabase
        .from('ai_knowledge_index')
        .insert({
          entity_type: 'table',
          entity_name: tableName,
          schema_name: schema,
          description,
          column_metadata: columnMetadata
        })
        
      if (insertError) throw insertError
    }
    
    return true
  } catch (error) {
    console.error(`Erro ao atualizar índice de conhecimento para ${schema}.${tableName}:`, error)
    return false
  }
}
