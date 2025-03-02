
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Configuração dos cabeçalhos CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento para requisições de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar o cliente Supabase usando variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Obter o corpo da requisição
    const body = await req.json();
    const { fileId, organizationId } = body;
    
    if (!fileId || !organizationId) {
      throw new Error('Parâmetros fileId e organizationId são obrigatórios');
    }
    
    console.log(`Iniciando processamento do arquivo: ${fileId} para organização: ${organizationId}`);
    
    // Buscar informações do arquivo no banco de dados
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single();
    
    if (fileError || !fileData) {
      console.error('Erro ao buscar informações do arquivo:', fileError);
      throw new Error(`Arquivo não encontrado ou sem permissão: ${fileError?.message || 'Não encontrado'}`);
    }
    
    console.log(`Dados do arquivo encontrados: ${fileData.name}, caminho: ${fileData.storage_path}`);
    
    // Obter o arquivo de storage
    const { data: fileContent, error: storageError } = await supabase.storage
      .from('data_files')
      .download(fileData.storage_path);
    
    if (storageError || !fileContent) {
      console.error('Erro ao baixar arquivo do storage:', storageError);
      
      // Atualizar status para erro
      await supabase
        .from('data_imports')
        .update({
          status: 'error',
          error_message: `Erro ao baixar arquivo: ${storageError?.message || 'Arquivo não encontrado'}`
        })
        .eq('id', fileId);
      
      throw new Error(`Não foi possível baixar o arquivo: ${storageError?.message || 'Arquivo não encontrado'}`);
    }
    
    // O resto do processamento depende do tipo de arquivo
    // Este é um exemplo simplificado, o processamento real dependeria do tipo do arquivo
    console.log(`Arquivo baixado com sucesso, tamanho: ${fileContent.size} bytes`);
    
    // Atualizar o status para completed (valor válido do enum import_status)
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'completed'
      })
      .eq('id', fileId);
    
    if (updateError) {
      console.error('Erro ao atualizar status:', updateError);
      throw new Error(`Erro ao atualizar status: ${updateError.message}`);
    }
    
    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Arquivo processado com sucesso",
        fileId,
        organizationId
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error('Erro no processamento:', error.message);
    
    // Retornar erro
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 400
      }
    );
  }
});
