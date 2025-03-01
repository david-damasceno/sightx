
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/data-import/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data-import/ColumnMapper"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnMetadata } from "@/types/data-imports"

export default function DataImport() {
  const [fileId, setFileId] = useState<string | null>(null)
  const [tableName, setTableName] = useState<string | null>(null)
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
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
        display_name: col.mapped_name || null,
        description: null,
        data_type: col.data_type,
        sample_values: col.sample_data || [],
        statistics: col.validation_rules || {},
        created_at: col.created_at
      }));
      
      setColumns(adaptedColumns)
    } catch (error) {
      console.error('Error fetching columns:', error)
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
            mapped_name: col.display_name,
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
  
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle>Importação de Dados</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <FileUploader onUploadComplete={handleUploadComplete} />
          )}
          
          {step === 2 && fileId && (
            <DataPreview 
              fileId={fileId}
              onNext={handlePreviewComplete}
            />
          )}
          
          {step === 3 && fileId && columns.length > 0 && (
            <ColumnMapper 
              columns={columns} 
              onMappingComplete={handleMappingComplete}
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
