
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import * as csv from "https://deno.land/std@0.177.0/csv/parse.ts";
import { read, utils } from "https://deno.land/x/excel_js@v0.1.0/mod.ts";

const BATCH_SIZE = 500; // Número de linhas para inserir por vez

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Lidar com requisições CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileId, organizationId } = await req.json();
    console.log(`Iniciando processamento do arquivo: ${fileId}, organização: ${organizationId}`);

    if (!fileId || !organizationId) {
      return new Response(
        JSON.stringify({ error: 'ID do arquivo e organização são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Configurar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variáveis de ambiente do Supabase não configuradas");
      throw new Error("Configuração do Supabase incompleta");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Obter informações do arquivo
    console.log("Buscando informações do arquivo");
    const { data: fileData, error: fileError } = await supabase
      .from('data_imports')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      console.error("Erro ao buscar dados do arquivo:", fileError);
      throw new Error(`Arquivo não encontrado: ${fileError?.message || "Desconhecido"}`);
    }

    // Verificar se o arquivo já foi processado
    if (fileData.status === 'completed') {
      return new Response(
        JSON.stringify({ message: 'Arquivo já processado', table: fileData.table_name }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Atualizar o status para analyzing
    await supabase
      .from('data_imports')
      .update({ status: 'analyzing' })
      .eq('id', fileId);

    // Obter o arquivo do Storage
    console.log("Baixando arquivo do storage:", fileData.storage_path);
    const { data: fileContent, error: storageError } = await supabase
      .storage
      .from('data_files')
      .download(fileData.storage_path);

    if (storageError || !fileContent) {
      console.error("Erro ao baixar arquivo:", storageError);
      throw new Error(`Não foi possível baixar o arquivo: ${storageError?.message || "Desconhecido"}`);
    }

    // Processar o conteúdo do arquivo
    let rowsData = [];
    let headers = [];
    
    if (fileData.file_type?.includes('csv') || fileData.original_filename.endsWith('.csv')) {
      console.log("Processando arquivo CSV");
      const text = await fileContent.text();
      const parsed = csv.parse(text, { skipFirstRow: true, columns: true });
      rowsData = parsed;
      headers = Object.keys(parsed[0] || {});
    } 
    else if (fileData.file_type?.includes('excel') || 
             fileData.original_filename.endsWith('.xlsx') || 
             fileData.original_filename.endsWith('.xls')) {
      console.log("Processando arquivo Excel");
      const arrayBuffer = await fileContent.arrayBuffer();
      // Usando a biblioteca excel_js do Deno em vez do xlsx do npm
      const workbook = read(arrayBuffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(firstSheet, { header: 1 });
      
      headers = jsonData[0];
      rowsData = jsonData.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
    } 
    else {
      throw new Error(`Tipo de arquivo não suportado: ${fileData.file_type}`);
    }

    if (rowsData.length === 0) {
      throw new Error("O arquivo não contém dados");
    }

    // Inferir tipos de dados e preparar metadados
    console.log("Inferindo tipos de dados para colunas:", headers);
    const columnTypes = {};
    const columnMetadata = {};
    const columnStatistics = {};
    
    headers.forEach(header => {
      const sampleValues = rowsData.slice(0, Math.min(100, rowsData.length))
        .map(row => row[header])
        .filter(val => val !== undefined && val !== null && val !== "");
      
      const sampleValue = sampleValues[0] || "";
      
      // Inferir o tipo de dados
      let dataType = 'text';
      
      if (sampleValues.length > 0) {
        if (sampleValues.every(val => !isNaN(Number(val)))) {
          if (sampleValues.some(val => val.toString().includes('.'))) {
            dataType = 'numeric(15,2)';
          } else {
            dataType = 'integer';
          }
        } else if (sampleValues.every(val => 
          !isNaN(Date.parse(val)) && 
          new Date(val).toString() !== 'Invalid Date'
        )) {
          dataType = 'timestamp with time zone';
        } else if (sampleValues.every(val => 
          val.toString().toLowerCase() === 'true' || 
          val.toString().toLowerCase() === 'false'
        )) {
          dataType = 'boolean';
        }
      }
      
      columnTypes[header] = dataType;
      
      // Coletar estatísticas básicas para colunas numéricas
      if (dataType === 'integer' || dataType === 'numeric(15,2)') {
        const numericValues = sampleValues.map(v => Number(v)).filter(v => !isNaN(v));
        columnStatistics[header] = {
          min: Math.min(...numericValues),
          max: Math.max(...numericValues),
          avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
          count: numericValues.length
        };
      } else {
        columnStatistics[header] = {
          count: sampleValues.length,
          uniqueCount: new Set(sampleValues).size
        };
      }
      
      // Coletar metadados
      columnMetadata[header] = {
        name: header,
        display_name: header,
        data_type: dataType,
        sample_values: sampleValues.slice(0, 10)
      };
    });

    // Criar a tabela dinamicamente
    console.log("Criando tabela dinamicamente:", fileData.table_name);
    const columnDefinitions = headers.map(header => ({
      name: header.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      type: columnTypes[header]
    }));
    
    // Criar a tabela usando a função SQL personalizada
    const { data: tableData, error: tableError } = await supabase.rpc(
      'create_dynamic_table',
      { 
        p_table_name: fileData.table_name,
        p_columns: columnDefinitions,
        p_organization_id: organizationId
      }
    );
    
    if (tableError) {
      console.error("Erro ao criar tabela:", tableError);
      throw new Error(`Erro ao criar tabela: ${tableError.message}`);
    }
    
    console.log("Tabela criada com sucesso:", tableData);

    // Inserir dados em lotes
    console.log(`Inserindo ${rowsData.length} linhas de dados na tabela ${fileData.table_name}`);
    let processedRows = 0;
    
    for (let i = 0; i < rowsData.length; i += BATCH_SIZE) {
      const batch = rowsData.slice(i, i + BATCH_SIZE);
      
      // Tratar valores especiais e adicionar organization_id
      const preparedBatch = batch.map(row => {
        const preparedRow = { organization_id: organizationId };
        
        // Mapear cada coluna com o nome limpo
        headers.forEach(header => {
          const cleanColumnName = header.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
          
          // Converter valores conforme o tipo inferido
          let value = row[header];
          
          if (value === undefined || value === null || value === "") {
            preparedRow[cleanColumnName] = null;
          } else if (columnTypes[header] === 'integer') {
            preparedRow[cleanColumnName] = parseInt(value) || null;
          } else if (columnTypes[header] === 'numeric(15,2)') {
            preparedRow[cleanColumnName] = parseFloat(value) || null;
          } else if (columnTypes[header] === 'boolean') {
            preparedRow[cleanColumnName] = 
              value === true || 
              value === 'true' || 
              value === 'TRUE' ||
              value === 'True' ||
              value === 'T' ||
              value === 't' ||
              value === '1' ||
              value === 'Sim' ||
              value === 'sim' ||
              value === 'S' ||
              value === 's';
          } else if (columnTypes[header] === 'timestamp with time zone') {
            try {
              preparedRow[cleanColumnName] = new Date(value).toISOString();
            } catch (e) {
              preparedRow[cleanColumnName] = null;
            }
          } else {
            preparedRow[cleanColumnName] = String(value);
          }
        });
        
        return preparedRow;
      });
      
      // Inserir o lote
      const { error: insertError } = await supabase
        .from(fileData.table_name)
        .insert(preparedBatch);
      
      if (insertError) {
        console.error(`Erro ao inserir lote ${i / BATCH_SIZE + 1}:`, insertError);
        throw new Error(`Erro ao inserir dados: ${insertError.message}`);
      }
      
      processedRows += batch.length;
      
      // Atualizar o progresso
      await supabase
        .from('data_imports')
        .update({ 
          metadata: {
            ...fileData.metadata,
            progress: Math.round((processedRows / rowsData.length) * 100)
          }
        })
        .eq('id', fileId);
      
      console.log(`Progresso: ${processedRows}/${rowsData.length} linhas inseridas`);
    }

    // Salvar metadados das colunas
    console.log("Salvando metadados das colunas");
    for (const header of headers) {
      const { error: metadataError } = await supabase
        .from('column_metadata')
        .insert({
          import_id: fileId,
          original_name: header,
          display_name: header,
          data_type: columnTypes[header],
          sample_values: columnMetadata[header].sample_values,
          statistics: columnStatistics[header]
        });
      
      if (metadataError) {
        console.error(`Erro ao salvar metadados da coluna ${header}:`, metadataError);
      }
    }

    // Atualizar o status para completed
    const { error: updateError } = await supabase
      .from('data_imports')
      .update({
        status: 'completed',
        row_count: rowsData.length,
        columns_metadata: columnMetadata,
        data_quality: {
          completeness: 1.0, // Simplificado para este exemplo
          column_count: headers.length,
          row_count: rowsData.length
        }
      })
      .eq('id', fileId);
    
    if (updateError) {
      console.error("Erro ao atualizar status:", updateError);
      throw new Error(`Erro ao finalizar processamento: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Arquivo processado com sucesso',
        table: fileData.table_name,
        rows: rowsData.length,
        columns: headers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error("Erro no processamento:", error);
    
    // Se tivermos o ID do arquivo, atualizamos o status para error
    try {
      const { fileId } = await req.json();
      if (fileId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase
          .from('data_imports')
          .update({
            status: 'error',
            error_message: error.message || 'Erro desconhecido no processamento'
          })
          .eq('id', fileId);
      }
    } catch (e) {
      console.error("Erro ao atualizar status de erro:", e);
    }
    
    return new Response(
      JSON.stringify({
        error: 'Erro no processamento do arquivo',
        message: error.message || 'Erro desconhecido',
        stack: error.stack
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
