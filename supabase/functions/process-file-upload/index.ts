
import { serve } from 'https://deno.land/std@0.210.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';
import { parse as parseCSV } from 'https://deno.land/std@0.210.0/csv/parse.ts';
import * as XLSX from 'https://esm.sh/xlsx@0.19.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_PROCESS_TIME_MS = 120000; // 2 minutos de tempo máximo de processamento
const BATCH_SIZE = 1000; // Processar em lotes de 1000 linhas para arquivos grandes

serve(async (req) => {
  console.log('Função process-file-upload iniciada');
  
  // Tratamento para requisições OPTIONS (CORS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Configuração inicial
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
    
    // Atualize o status antes de começar o download
    await supabase
      .from('data_imports')
      .update({
        status: 'processing',
        error_message: null
      })
      .eq('id', fileId);
    
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('data_files')
      .download(importData.storage_path);

    if (downloadError || !fileData) {
      console.error('Erro ao baixar arquivo:', downloadError);
      throw new Error(`Não foi possível baixar o arquivo: ${downloadError?.message || 'Arquivo não encontrado'}`);
    }

    console.log('Arquivo baixado com sucesso, tamanho:', Math.round(fileData.size / 1024), 'KB');
    console.log('Iniciando processamento...');

    // Determinar o tipo de arquivo e processar
    let data = [];
    const fileType = importData.original_filename.split('.').pop()?.toLowerCase();
    
    // Definir timeout para evitar execuções muito longas
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: processamento excedeu o tempo limite')), MAX_PROCESS_TIME_MS);
    });

    // Iniciar o processamento de dados com timeout
    const processPromise = new Promise(async (resolve, reject) => {
      try {
        if (fileType === 'csv') {
          // Processar CSV
          const csvText = await fileData.text();
          console.log('Processando arquivo CSV...');
          data = parseCSV(csvText, { 
            skipFirstRow: true, 
            columns: true 
          });
        } else if (fileType === 'xlsx' || fileType === 'xls') {
          // Processar Excel (XLS/XLSX) - com otimização de memória
          console.log(`Processando arquivo Excel (${fileType})...`);
          const arrayBuffer = await fileData.arrayBuffer();
          
          // Usar opções para otimizar uso de memória
          const workbook = XLSX.read(arrayBuffer, { 
            type: 'array',
            cellDates: true,
            cellNF: false,
            cellText: false
          });
          
          // Pegar a primeira planilha
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Converter para JSON com opções de otimização
          data = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: null
          });
          
          // Extrair cabeçalhos e remover linha de cabeçalho
          if (data.length > 0) {
            const headers = data[0];
            data = data.slice(1).map(row => {
              const obj = {};
              headers.forEach((header, i) => {
                obj[header] = row[i];
              });
              return obj;
            });
          }
        } else {
          throw new Error(`Formato de arquivo não suportado: ${fileType}`);
        }
        
        if (!data || data.length === 0) {
          throw new Error('O arquivo não contém dados válidos');
        }
        
        console.log(`Processamento concluído. Total de registros: ${data.length}`);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    // Escolher entre processamento e timeout, o que vier primeiro
    data = await Promise.race([processPromise, timeoutPromise]);

    // Identificar colunas e tipos
    const columns = Object.keys(data[0]).map(key => {
      // Determinar tipo de dados
      const sampleValue = data[0][key];
      let type = 'text';
      
      if (typeof sampleValue === 'number') {
        type = Number.isInteger(sampleValue) ? 'integer' : 'numeric';
      } else if (sampleValue instanceof Date) {
        type = 'timestamp';
      }
      
      return {
        name: key,
        type: type,
        sample: sampleValue
      };
    });

    // Atualizar o status da importação com sucesso
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'processed',
        row_count: data.length,
        metadata: {
          ...importData.metadata,
          rowCount: data.length,
          columnCount: columns.length,
          columns: columns
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
        columns: columns
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
    
    try {
      // Atualizar o status de erro no banco de dados
      const { fileId } = await req.json();
      if (fileId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseKey);
      
        await supabase
          .from('data_imports')
          .update({
            status: 'error',
            error_message: error.message || 'Erro desconhecido no processamento'
          })
          .eq('id', fileId);
      }
    } catch (updateError) {
      console.error('Erro ao atualizar status para erro:', updateError);
    }
    
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
