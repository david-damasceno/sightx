
import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, Table as TableIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button"
import { ColumnMetadata } from "@/types/data-import-flow"

interface TablePreviewProps {
  fileId: string
  tableName: string
  onContextClick: () => void
}

export function TablePreview({ fileId, tableName, onContextClick }: TablePreviewProps) {
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Buscar metadados das colunas
        const { data: columnsData, error: columnsError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)
        
        if (columnsError) throw columnsError
        
        // Buscar amostra de dados da tabela
        const { data: tableData, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(10)
        
        if (tableError) throw tableError
        
        setData(tableData || [])
        setColumns(columnsData || [])
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da tabela",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [fileId, tableName, toast])

  const getColumnName = (originalName: string) => {
    const column = columns.find(col => col.original_name === originalName)
    return column?.display_name || originalName
  }

  const getDataType = (originalName: string) => {
    const column = columns.find(col => col.original_name === originalName)
    return column?.data_type || 'text'
  }

  if (loading) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Carregando Tabela</CardTitle>
          <CardDescription>
            Aguarde enquanto carregamos a prévia dos dados...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando dados da tabela...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl">Tabela Vazia</CardTitle>
          <CardDescription>
            Não há dados para exibir na tabela
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Database className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum dado foi encontrado na tabela
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Obter colunas do primeiro objeto no array de dados
  const dataColumns = Object.keys(data[0]).filter(col => 
    col !== 'id' && col !== 'created_at' && col !== 'organization_id'
  )

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{tableName}</CardTitle>
            </div>
            <CardDescription>
              Prévia da tabela criada com {columns.length} colunas
            </CardDescription>
          </div>
          <Button onClick={onContextClick}>
            Continuar para Contextualização
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md overflow-hidden">
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {dataColumns.map(column => (
                    <TableHead key={column}>
                      <div className="flex flex-col gap-1">
                        <span>{getColumnName(column)}</span>
                        <Badge variant="outline" className="text-xs font-normal">
                          {getDataType(column)}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                    {dataColumns.map(column => (
                      <TableCell key={`${index}-${column}`}>
                        {row[column] !== null ? 
                          String(row[column]).substring(0, 100) + 
                          (String(row[column]).length > 100 ? '...' : '') 
                          : 
                          <span className="text-muted-foreground italic">null</span>
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
