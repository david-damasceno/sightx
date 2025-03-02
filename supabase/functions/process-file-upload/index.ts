
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
    
    // Atualizar o status antes de começar o processamento
    await supabase
      .from('data_imports')
      .update({
        status: 'processing',
        error_message: null
      })
      .eq('id', fileId);
    
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
    console.log('Identificando estrutura e tipos de dados...');
    const sampleRow = data[0];
    const columns = Object.keys(sampleRow).map(key => {
      // Coletar amostras para melhor inferência de tipo
      const samples = data.slice(0, 10).map(row => row[key]).filter(val => val !== null && val !== undefined);
      
      // Determinar tipo de dados com base nas amostras
      let sqlType = 'text';
      
      // Verificar se parece número
      const numberSamples = samples.filter(s => !isNaN(Number(s)));
      if (numberSamples.length === samples.length && samples.length > 0) {
        // Verificar se é inteiro ou decimal
        const hasDecimals = samples.some(s => String(s).includes('.'));
        sqlType = hasDecimals ? 'numeric(15,2)' : 'integer';
      }
      // Verificar se parece data
      else if (samples.length > 0 && samples.every(s => !isNaN(Date.parse(String(s))))) {
        sqlType = 'timestamp with time zone';
      }
      // Verificar se é booleano
      else if (samples.length > 0 && samples.every(s => ['true', 'false', 't', 'f', 'yes', 'no', 'sim', 'não', '1', '0'].includes(String(s).toLowerCase()))) {
        sqlType = 'boolean';
      }
      
      return {
        name: key.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(), // Normalizar nome para SQL
        original_name: key,
        type: sqlType,
        sample: samples.length > 0 ? samples[0] : null
      };
    });
    
    console.log('Estrutura de colunas identificada:', columns);

    // Criar a tabela dinâmica para armazenar os dados
    console.log('Criando tabela dinâmica...');
    const tableName = importData.table_name;
    
    // Construir definição SQL para criar a tabela
    let createTableSQL = `CREATE TABLE IF NOT EXISTS public."${tableName}" (\n`;
    createTableSQL += columns.map(col => `  "${col.name}" ${col.type}`).join(',\n');
    createTableSQL += ',\n  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n';
    createTableSQL += '  "organization_id" UUID NOT NULL,\n';
    createTableSQL += '  "created_at" TIMESTAMPTZ DEFAULT now()\n';
    createTableSQL += ');\n';
    
    // Adicionar RLS para segurança
    createTableSQL += `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;\n`;
    createTableSQL += `CREATE POLICY "${tableName}_org_isolation" ON public."${tableName}" 
      USING (organization_id = auth.uid() OR organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
      ));\n`;
    
    // Executar SQL para criar a tabela
    console.log('Executando SQL para criar tabela:');
    console.log(createTableSQL);
    const { error: createTableError } = await supabase.rpc('create_dynamic_table', {
      p_table_name: tableName,
      p_columns: JSON.stringify(columns),
      p_organization_id: organizationId
    });
    
    if (createTableError) {
      console.error('Erro ao criar tabela:', createTableError);
      throw new Error(`Falha ao criar tabela: ${createTableError.message}`);
    }

    console.log('Tabela criada com sucesso!');
    
    // Preparar dados para inserção
    console.log('Preparando inserção de dados...');
    const dataToInsert = data.map(row => {
      const normalizedRow = {};
      
      // Normalizar nomes de colunas e valores
      columns.forEach(col => {
        normalizedRow[col.name] = row[col.original_name];
      });
      
      // Adicionar dados de controle
      normalizedRow.organization_id = organizationId;
      
      return normalizedRow;
    });
    
    // Inserir dados em lotes
    console.log(`Inserindo ${dataToInsert.length} registros em lotes de ${BATCH_SIZE}...`);
    
    let processedRows = 0;
    for (let i = 0; i < dataToInsert.length; i += BATCH_SIZE) {
      const batch = dataToInsert.slice(i, i + BATCH_SIZE);
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        console.error(`Erro ao inserir lote ${i / BATCH_SIZE + 1}:`, insertError);
        throw new Error(`Falha ao inserir dados: ${insertError.message}`);
      }
      
      processedRows += batch.length;
      console.log(`Progresso: ${processedRows}/${dataToInsert.length} registros`);
      
      // Atualizar progresso no banco de dados
      await supabase
        .from('data_processing_results')
        .upsert({
          file_id: fileId,
          organization_id: organizationId,
          status: 'processing',
          progress: Math.round((processedRows / dataToInsert.length) * 100),
          processed_rows: processedRows,
          total_rows: dataToInsert.length,
          processing_metadata: { current_batch: i / BATCH_SIZE + 1, total_batches: Math.ceil(dataToInsert.length / BATCH_SIZE) }
        }, { onConflict: 'file_id' });
    }
    
    console.log('Todos os dados foram inseridos com sucesso!');
    
    // Coletar metadados de colunas para análise
    const columnsMetadata = columns.map(col => {
      // Coletar estatísticas básicas para cada coluna
      const values = data.map(row => row[col.original_name]).filter(v => v !== null && v !== undefined);
      const uniqueValues = [...new Set(values)];
      const sampleValues = uniqueValues.slice(0, 20); // Limitar a 20 amostras
      
      let statistics = {};
      
      // Estatísticas para colunas numéricas
      if (col.type === 'integer' || col.type === 'numeric(15,2)') {
        const numericValues = values.map(v => Number(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
          statistics = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            avg: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
            count: numericValues.length,
            null_count: data.length - values.length,
            unique_count: uniqueValues.length
          };
        }
      } else {
        // Estatísticas para colunas não numéricas
        statistics = {
          count: values.length,
          null_count: data.length - values.length,
          unique_count: uniqueValues.length,
          most_common: getMostCommonValues(values, 5)
        };
      }
      
      return {
        import_id: fileId,
        original_name: col.original_name,
        display_name: col.name,
        data_type: col.type,
        sample_values: sampleValues,
        statistics: statistics
      };
    });
    
    // Salvar metadados de colunas
    console.log('Salvando metadados de colunas...');
    for (const colMeta of columnsMetadata) {
      const { error: metadataError } = await supabase
        .from('column_metadata')
        .insert(colMeta);
      
      if (metadataError) {
        console.warn('Erro ao salvar metadados da coluna:', metadataError);
        // Não interromper o processo por erro de metadados
      }
    }
    
    // Atualizar registro de importação com sucesso
    console.log('Finalizando processo...');
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        row_count: data.length,
        metadata: {
          ...importData.metadata,
          rowCount: data.length,
          columnCount: columns.length,
          processingTime: new Date().toISOString(),
          columns: columns.map(c => ({ name: c.name, original_name: c.original_name, type: c.type }))
        },
        columns_metadata: {
          columns: columnsMetadata.map(c => ({
            name: c.original_name,
            display_name: c.display_name,
            type: c.data_type,
            statistics: c.statistics
          }))
        }
      })
      .eq('id', fileId);

    if (updateError) {
      console.error('Erro ao atualizar status da importação:', updateError);
      // Não falhar o processo inteiro por erro de atualização do status
    }

    // Atualizar registro de processamento
    await supabase
      .from('data_processing_results')
      .upsert({
        file_id: fileId,
        organization_id: organizationId,
        status: 'completed',
        table_name: tableName,
        processed_rows: data.length,
        total_rows: data.length,
        progress: 100,
        completed_at: new Date().toISOString(),
        processing_ended_at: new Date().toISOString(),
        processing_metadata: { 
          successful: true, 
          table: tableName,
          columns: columns.length,
          rows: data.length
        }
      }, { onConflict: 'file_id' });
    
    console.log('Processamento concluído com sucesso!');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Arquivo processado com sucesso',
        table: tableName,
        rows: data.length,
        columns: columns.length
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
          
        // Também atualizar a tabela de resultados de processamento
        await supabase
          .from('data_processing_results')
          .upsert({
            file_id: fileId,
            status: 'error',
            error_message: error.message || 'Erro desconhecido no processamento',
            processing_ended_at: new Date().toISOString(),
            processing_metadata: { error: error.message }
          }, { onConflict: 'file_id' });
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

// Função auxiliar para obter valores mais comuns
function getMostCommonValues(values, limit = 5) {
  const counts = {};
  values.forEach(val => {
    counts[val] = (counts[val] || 0) + 1;
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}
