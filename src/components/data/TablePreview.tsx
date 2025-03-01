
import { useEffect, useState } from "react"
import ReactDataGrid from "react-data-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ColumnMetadata } from "@/types/data-imports"

interface TablePreviewProps {
  tableName: string
  fileId: string
}

export function TablePreview({ tableName, fileId }: TablePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any[]>([])
  const [gridColumns, setGridColumns] = useState<any[]>([])
  const [columnMetadata, setColumnMetadata] = useState<ColumnMetadata[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar metadados das colunas
        const { data: metadataData, error: metadataError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)
        
        if (metadataError) throw metadataError
        
        if (metadataData) {
          setColumnMetadata(metadataData as unknown as ColumnMetadata[])
        }
        
        // Usar RPC para buscar dados da tabela (via função no banco de dados)
        const { data, error } = await supabase.rpc('get_table_data', { 
          table_name: tableName, 
          row_limit: 100 
        })
        
        if (error) throw error
        
        if (data && data.length > 0) {
          setData(data)
          
          // Configurar colunas para o DataGrid
          const firstRow = data[0]
          const columns = Object.keys(firstRow)
            .filter(key => key !== 'id' && key !== 'organization_id' && key !== 'created_at')
            .map(key => ({
              key,
              name: key,
              resizable: true,
              sortable: true
            }))
          
          setGridColumns(columns)
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados da tabela",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (tableName && fileId) {
      fetchData()
    }
  }, [tableName, fileId, toast])
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização dos Dados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden h-[300px]">
            {data.length > 0 ? (
              <ReactDataGrid
                columns={gridColumns}
                rows={data}
                className="fill-grid h-full rdg-light"
              />
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
