
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { parse as parseCSV } from 'https://deno.land/std@0.181.0/csv/parse.ts';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Tratamento para requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configuradas');
      throw new Error('Configuração do servidor incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parsear o corpo da requisição
    const { fileId, organizationId } = await req.json();
    console.log(`Iniciando processamento do arquivo: ${fileId} para organização: ${organizationId}`);

    if (!fileId || !organizationId) {
      throw new Error('fileId e organizationId são obrigatórios');
    }

    // Buscar os dados do arquivo no banco
    console.log('Buscando registro de importação do arquivo...');
    const { data: importData, error: importError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .eq('organization_id', organizationId)
      .single();

    if (importError || !importData) {
      console.error('Erro ao buscar informações do arquivo:', importError);
      throw new Error(`Arquivo não encontrado: ${importError?.message || 'Registro não existe'}`);
    }

    console.log('Registro de importação encontrado:', importData.id);
    
    // Download do arquivo do storage
    console.log('Baixando arquivo do storage...');
    console.log('Caminho do arquivo:', importData.storage_path);
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(importData.storage_path);

    if (downloadError || !fileData) {
      console.error('Erro ao baixar arquivo:', downloadError);
      throw new Error(`Não foi possível baixar o arquivo: ${downloadError?.message || 'Arquivo não encontrado'}`);
    }

    console.log('Arquivo baixado com sucesso, iniciando processamento...');

    // Determinar o tipo de arquivo e processar
    let data: any[] = [];
    const fileType = importData.original_filename.split('.').pop()?.toLowerCase();
    
    if (fileType === 'csv') {
      // Processar CSV
      const csvText = await fileData.text();
      console.log('Processando arquivo CSV...');
      data = parseCSV(csvText, { 
        skipFirstRow: true, 
        columns: true 
      });
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      // Processar Excel (XLS/XLSX)
      console.log(`Processando arquivo Excel (${fileType})...`);
      const arrayBuffer = await fileData.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Pegar a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converter para JSON
      data = XLSX.utils.sheet_to_json(worksheet);
    } else {
      throw new Error(`Formato de arquivo não suportado: ${fileType}`);
    }

    if (!data || data.length === 0) {
      throw new Error('O arquivo não contém dados válidos');
    }

    console.log(`Processamento concluído. Total de registros: ${data.length}`);

    // Atualizar o status da importação
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'processed',
        total_rows: data.length,
        processed_at: new Date().toISOString(),
        metadata: {
          ...importData.metadata,
          rowCount: data.length,
          columnCount: Object.keys(data[0]).length
        }
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Erro ao atualizar status da importação:', updateError);
      throw new Error(`Erro ao atualizar status: ${updateError.message}`);
    }

    console.log('Status da importação atualizado com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Arquivo processado com sucesso',
        rows: data.length,
        columns: Object.keys(data[0]).length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Erro no processamento do arquivo:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro desconhecido no processamento do arquivo' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});
