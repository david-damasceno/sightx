
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

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
    
    // Buscar informações do arquivo no banco de dados e da organização
    const [fileResult, orgResult] = await Promise.all([
      supabase
        .from('data_imports')
        .select('*')
        .eq('id', fileId)
        .eq('organization_id', organizationId)
        .single(),
      
      supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single()
    ]);
    
    if (fileResult.error || !fileResult.data) {
      console.error('Erro ao buscar informações do arquivo:', fileResult.error);
      throw new Error(`Arquivo não encontrado ou sem permissão: ${fileResult.error?.message || 'Não encontrado'}`);
    }
    
    if (orgResult.error) {
      console.error('Erro ao buscar organização:', orgResult.error);
      throw new Error(`Organização não encontrada: ${orgResult.error.message}`);
    }
    
    const fileData = fileResult.data;
    const schemaName = orgResult.data.settings?.schema_name || 'public';
    
    console.log(`Dados do arquivo encontrados: ${fileData.name}, caminho: ${fileData.storage_path}, tabela: ${fileData.table_name}, esquema: ${schemaName}`);
    
    // Atualizar status para processing
    await supabase
      .from('data_imports')
      .update({
        status: 'processing'
      })
      .eq('id', fileId);
      
    // Primeiro tentar obter o arquivo do bucket específico da organização
    let fileContent;
    let storageError;
    
    try {
      const result = await supabase.storage
        .from(organizationId)
        .download(fileData.storage_path);
        
      fileContent = result.data;
      storageError = result.error;
    } catch (error) {
      console.log('Erro ao acessar bucket da organização, tentando bucket padrão');
      storageError = error;
    }
    
    // Se não encontrou no bucket da organização, tenta no bucket padrão
    if (storageError || !fileContent) {
      console.log('Tentando baixar do bucket padrão data_files');
      const defaultResult = await supabase.storage
        .from('data_files')
        .download(fileData.storage_path);
        
      fileContent = defaultResult.data;
      storageError = defaultResult.error;
    }
    
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
    
    console.log(`Arquivo baixado com sucesso, tamanho: ${fileContent.size} bytes`);
    
    // Processar o arquivo com base na extensão
    let data = [];
    let columns = [];
    
    try {
      const fileBuffer = await fileContent.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: 'array' });
      
      // Pegar a primeira planilha
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      
      // Converter para JSON
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Arquivo não contém dados suficientes');
      }
      
      // A primeira linha é o cabeçalho
      const headerRow = jsonData[0];
      columns = headerRow.map((header, index) => {
        // Garantir que o nome da coluna seja único e válido para SQL
        const columnName = String(header)
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
          .replace(/^[^a-z]/, 'c$&'); // Garantir que comece com letra
        
        return {
          name: columnName || `column_${index}`,
          originalName: String(header),
          index: index
        };
      });
      
      // Dados começam a partir da segunda linha
      data = jsonData.slice(1).map(row => {
        const rowData = {};
        columns.forEach(column => {
          rowData[column.name] = row[column.index] !== undefined ? row[column.index] : null;
        });
        return rowData;
      });
      
      console.log(`Processados ${data.length} registros com ${columns.length} colunas`);
    } catch (parseError) {
      console.error('Erro ao processar arquivo:', parseError);
      
      await supabase
        .from('data_imports')
        .update({
          status: 'error',
          error_message: `Erro ao processar arquivo: ${parseError.message}`
        })
        .eq('id', fileId);
        
      throw parseError;
    }
    
    // Criar a tabela dinâmica no esquema da organização
    try {
      // Inferir tipos de coluna
      const columnDefinitions = columns.map(column => {
        // Encontrar valor não nulo para amostra
        let sampleValue = null;
        for (const row of data) {
          if (row[column.name] !== null && row[column.name] !== undefined) {
            sampleValue = row[column.name];
            break;
          }
        }
        
        // Inferir tipo de dados básico
        let dataType = 'text';
        if (sampleValue !== null) {
          if (typeof sampleValue === 'number') {
            // Verifica se é inteiro ou decimal
            if (Number.isInteger(sampleValue)) {
              dataType = 'integer';
            } else {
              dataType = 'numeric(15,2)';
            }
          } else if (typeof sampleValue === 'boolean') {
            dataType = 'boolean';
          } else if (sampleValue instanceof Date) {
            dataType = 'timestamp with time zone';
          }
        }
        
        return {
          name: column.name,
          type: dataType
        };
      });
      
      console.log('Definições de coluna:', columnDefinitions);
      
      // Construir e executar o SQL para criar a tabela
      const tableName = fileData.table_name;
      
      // Usar a função que cria tabelas no esquema correto
      const { data: tableResult, error: createTableError } = await supabase.rpc(
        'create_dynamic_table',
        { 
          p_table_name: tableName,
          p_columns: columnDefinitions,
          p_organization_id: organizationId
        }
      );
      
      if (createTableError) {
        console.error('Erro ao criar tabela:', createTableError);
        throw new Error(`Erro ao criar tabela: ${createTableError.message}`);
      }
      
      console.log(`Tabela ${tableName} criada com sucesso no esquema ${schemaName}`);
      
      // Inserir os dados na tabela
      // Processar em lotes para evitar problemas com muitos registros
      const BATCH_SIZE = 100;
      let processedRows = 0;
      
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE).map(row => ({
          ...row,
          organization_id: organizationId
        }));
        
        // Construir a query de inserção com o esquema correto
        const insertSQL = `
          INSERT INTO "${schemaName}"."${tableName}" (${Object.keys(batch[0]).map(k => `"${k}"`).join(', ')})
          VALUES ${batch.map((row, idx) => 
            `(${Object.values(row).map(val => 
              val === null ? 'NULL' : (typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val)
            ).join(', ')})`
          ).join(',\n')}
        `;
        
        const { error: insertError } = await supabase.rpc(
          'exec_sql',
          { sql: insertSQL }
        );
          
        if (insertError) {
          console.error(`Erro ao inserir lote ${i}:`, insertError);
          throw new Error(`Erro ao inserir dados: ${insertError.message}`);
        }
        
        processedRows += batch.length;
        console.log(`Processados ${processedRows} de ${data.length} registros`);
        
        // Atualizar o progresso
        await supabase
          .from('data_imports')
          .update({
            row_count: processedRows
          })
          .eq('id', fileId);
      }
      
      // Criar análise básica de colunas
      const columnMetadata = {};
      columns.forEach(column => {
        columnMetadata[column.name] = {
          original_name: column.originalName,
          data_type: columnDefinitions.find(c => c.name === column.name)?.type || 'text'
        };
      });
      
      // Atualizar status para completed
      await supabase
        .from('data_imports')
        .update({
          status: 'completed',
          row_count: data.length,
          columns_metadata: columnMetadata,
          settings: { schema: schemaName }
        })
        .eq('id', fileId);
      
      console.log(`Processamento concluído com sucesso: ${data.length} registros importados no esquema ${schemaName}`);
      
    } catch (processError) {
      console.error('Erro no processamento:', processError);
      
      // Atualizar status para erro
      await supabase
        .from('data_imports')
        .update({
          status: 'error',
          error_message: processError.message
        })
        .eq('id', fileId);
        
      throw processError;
    }
    
    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Arquivo processado com sucesso",
        fileId,
        organizationId,
        rowCount: data.length,
        schema: schemaName
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
