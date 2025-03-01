
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/data-import/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data-import/ColumnMapper"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnMetadata } from "@/types/data-imports"

// Interface para compatibilidade com o componente ColumnMapper
interface Column {
  name: string
  type: string
  sample: string
}

export default function DataImport() {
  const [fileId, setFileId] = useState<string | null>(null)
  const [tableName, setTableName] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [previewData, setPreviewData] = useState<any[]>([])
  const [step, setStep] = useState(1)
  const { currentOrganization } = useAuth()
  
  useEffect(() => {
    if (fileId && currentOrganization) {
      fetchFileColumns()
    }
  }, [fileId, currentOrganization])
  
  const fetchFileColumns = async () => {
    try {
      const { data, error } = await supabase
        .from('column_metadata')
        .select('*')
        .eq('import_id', fileId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Adaptamos os dados para corresponder ao tipo ColumnMetadata
      const adaptedColumns: ColumnMetadata[] = data.map(col => ({
        id: col.id,
        import_id: col.import_id || fileId || '',
        original_name: col.original_name,
        display_name: col.display_name || col.original_name, // Usar original_name como fallback
        description: col.description || null,
        data_type: col.data_type,
        sample_values: col.sample_values || [],
        statistics: col.statistics || {},
        created_at: col.created_at
      }));
      
      setColumns(adaptedColumns)
      
      // Carrega os dados de prévia da tabela
      if (data.length > 0 && fileId) {
        fetchPreviewData(fileId)
      }
    } catch (error) {
      console.error('Error fetching columns:', error)
    }
  }
  
  const fetchPreviewData = async (fileId: string) => {
    try {
      // Buscar a informação do arquivo para obter o table_name
      const { data: fileData, error: fileError } = await supabase
        .from('data_imports')
        .select('table_name')
        .eq('id', fileId)
        .single()
        
      if (fileError) throw fileError
      
      if (fileData?.table_name) {
        setTableName(fileData.table_name)
        
        // Buscar os dados de prévia usando a função RPC ou diretamente da tabela
        const { data, error } = await supabase
          .rpc('get_table_data', { 
            table_name: fileData.table_name,
            row_limit: 10
          })
          
        if (error) throw error
        
        // Converter o resultado para array
        const tableData = Array.isArray(data) ? data : 
                          typeof data === 'object' ? Object.values(data) : [];
        
        setPreviewData(tableData)
      }
    } catch (error) {
      console.error('Error fetching preview data:', error)
    }
  }
  
  const handleUploadComplete = (id: string) => {
    setFileId(id)
    setStep(2)
  }
  
  const handlePreviewComplete = async () => {
    setStep(3)
  }

  const handleMappingComplete = async (mappedColumns: ColumnMetadata[]) => {
    try {
      // Update column mappings
      for (const col of mappedColumns) {
        await supabase
          .from('column_metadata')
          .update({
            display_name: col.display_name,
            description: col.description
          })
          .eq('id', col.id)
      }
      
      // Continue to next step (e.g., create table)
      setStep(4)
    } catch (error) {
      console.error('Error saving column mappings:', error)
    }
  }

  // Converter ColumnMetadata para o formato Column esperado pelo componente ColumnMapper
  const convertToColumnFormat = (metadataColumns: ColumnMetadata[]): Column[] => {
    return metadataColumns.map(col => ({
      name: col.original_name,
      type: col.data_type,
      sample: Array.isArray(col.sample_values) && col.sample_values.length > 0 
        ? String(col.sample_values[0]) 
        : typeof col.sample_values === 'object' 
          ? JSON.stringify(col.sample_values).substring(0, 50) 
          : String(col.sample_values)
    }));
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Importação de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <FileUploader onUploadSuccess={handleUploadComplete} />
          )}
          
          {step === 2 && fileId && (
            <DataPreview 
              fileId={fileId}
              onNext={handlePreviewComplete}
            />
          )}
          
          {step === 3 && fileId && columns.length > 0 && (
            <ColumnMapper 
              fileId={fileId}
              columns={convertToColumnFormat(columns)}
              previewData={previewData} 
              onMappingComplete={(tableName, previewData) => {
                setTableName(tableName);
                // Como as assinaturas de função são diferentes, precisamos fazer uma adaptação
                // para manter a compatibilidade com a lógica existente
                handleMappingComplete(columns);
              }}
            />
          )}
          
          {step === 4 && (
            <div>
              <h3 className="text-lg font-medium">Importação Concluída</h3>
              <p className="text-muted-foreground mt-2">
                Seus dados foram importados com sucesso.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
