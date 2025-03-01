
import { useEffect, useState } from "react"
import ReactDataGrid from "react-data-grid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ChevronRight, Database, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import "./data-grid.css"
import { useAuth } from "@/contexts/AuthContext"
import { DataImport } from "@/types/data-imports"

interface DataPreviewProps {
  fileId: string | null
  onNext: () => void
}

export function DataPreview({ fileId, onNext }: DataPreviewProps) {
  const [loading, setLoading] = useState(true)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [fileInfo, setFileInfo] = useState<DataImport | null>(null)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  useEffect(() => {
    if (!fileId || !currentOrganization) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar informações do arquivo
        const { data: fileData, error: fileError } = await supabase
          .from('data_imports')
          .select('*')
          .eq('id', fileId)
          .single()

        if (fileError) throw fileError
        setFileInfo(fileData)

        if (fileData.status !== 'completed') {
          // Continuar verificando o status a cada segundo
          const interval = setInterval(async () => {
            const { data: updatedFile } = await supabase
              .from('data_imports')
              .select('*')
              .eq('id', fileId)
              .single()

            if (updatedFile?.status === 'completed') {
              clearInterval(interval)
              setFileInfo(updatedFile)
              await loadTableData(updatedFile.table_name)
            } else if (updatedFile?.status === 'error') {
              clearInterval(interval)
              throw new Error(updatedFile.error_message || 'Erro ao processar o arquivo')
            }
          }, 2000)

          return () => clearInterval(interval)
        } else {
          await loadTableData(fileData.table_name)
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    const loadTableData = async (tableName: string) => {
      try {
        // Buscar primeiras 100 linhas da tabela
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(100)

        if (tableError) throw tableError

        if (tableData && tableData.length > 0) {
          const firstRow = tableData[0]
          const gridColumns = Object.keys(firstRow)
            .filter(key => key !== 'id' && key !== 'organization_id' && key !== 'created_at')
            .map(key => ({
              key,
              name: key,
              resizable: true,
              sortable: true
            }))

          setColumns(gridColumns)
          setPreviewData(tableData)
        }
      } catch (error: any) {
        console.error('Erro ao carregar dados da tabela:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados da tabela",
          variant: "destructive"
        })
      }
    }

    fetchData()
  }, [fileId, currentOrganization, toast])

  return (
    <Card className="shadow-md border border-border/40 bg-background">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Visualização dos Dados</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Processando seu arquivo...
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[400px] overflow-hidden border rounded-md">
            {columns.length > 0 && previewData.length > 0 ? (
              <ReactDataGrid
                columns={columns}
                rows={previewData}
                className="fill-grid h-full rdg-light"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  Nenhum dado disponível para visualização
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0">
        <div>
          {fileInfo && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Tabela:</span> {fileInfo.table_name} | 
              <span className="font-medium ml-2">Registros:</span> {fileInfo.row_count || 0}
            </p>
          )}
        </div>
        <Button 
          onClick={onNext} 
          disabled={loading || !fileInfo?.table_name} 
          className="gap-1"
        >
          Prosseguir para Contextualização
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
