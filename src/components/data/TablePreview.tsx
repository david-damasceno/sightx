
import { useEffect, useState } from "react"
import ReactDataGrid from "react-data-grid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import "./data-grid.css"
import { ColumnMetadata } from "@/types/data-imports"
import { Json } from "@/integrations/supabase/types"

interface TablePreviewProps {
  tableName: string
  importId: string
}

export function TablePreview({ tableName, importId }: TablePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [metadataColumns, setMetadataColumns] = useState<ColumnMetadata[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchTableData = async () => {
      if (!tableName) return

      try {
        setLoading(true)

        // Obter metadados das colunas
        const { data: columnData, error: columnError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', importId)

        if (columnError) throw columnError
        
        if (columnData) {
          setMetadataColumns(columnData as ColumnMetadata[])
        }

        // Obter dados da tabela usando a função RPC
        const { data: tableData, error: tableError } = await supabase
          .rpc('get_table_data', { 
            table_name: tableName,
            row_limit: 100
          })

        if (tableError) throw tableError

        // Converter o resultado JSONB para array
        const dataArray = Array.isArray(tableData) ? tableData : 
                          typeof tableData === 'object' ? Object.values(tableData) : [];
                          
        if (dataArray && dataArray.length > 0) {
          setPreviewData(dataArray)

          // Construir definições de colunas para o DataGrid
          const gridColumns = Object.keys(dataArray[0])
            .filter(key => key !== 'id' && key !== 'organization_id' && key !== 'created_at')
            .map(key => {
              const metaColumn = columnData?.find(col => col.original_name === key)
              return {
                key,
                name: metaColumn?.display_name || key,
                resizable: true,
                sortable: true
              }
            })

          setColumns(gridColumns)
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

    fetchTableData()
  }, [tableName, importId, toast])

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-lg font-medium">Visualização da Tabela</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {previewData.length > 0 ? (
          <div className="h-[300px] overflow-hidden border rounded-md">
            <ReactDataGrid
              columns={columns}
              rows={previewData}
              className="fill-grid h-full rdg-light"
            />
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Nenhum dado disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
