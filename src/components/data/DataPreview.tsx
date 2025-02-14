
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react"

interface Column {
  name: string
  type: string
  sample: any
}

interface DataPreviewProps {
  columns: Column[]
  previewData: any[]
  fileId: string
  onNext: () => void
}

interface FileData {
  id: string
  row_number: number
  data: Record<string, any>
}

export function DataPreview({ columns, previewData, fileId, onNext }: DataPreviewProps) {
  const [data, setData] = useState<FileData[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const rowsPerPage = 50
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)

      // Buscar total de linhas
      const { count } = await supabase
        .from('data_file_columns')
        .select('*', { count: 'exact', head: true })
        .eq('file_id', fileId)

      if (count !== null) {
        setTotalRows(count)
      }

      // Buscar dados paginados
      const { data: rows, error } = await supabase
        .from('data_file_columns')
        .select('*')
        .eq('file_id', fileId)
        .order('row_number', { ascending: true })
        .range((page - 1) * rowsPerPage, page * rowsPerPage - 1)

      if (error) throw error

      setData(rows.map((row, index) => ({
        id: row.id,
        row_number: (page - 1) * rowsPerPage + index + 1,
        data: row
      })))
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, fileId])

  const handleSave = async (rowId: string, columnName: string, value: string) => {
    try {
      const { error } = await supabase
        .from('data_file_changes')
        .insert({
          file_id: fileId,
          row_number: data.find(row => row.id === rowId)?.row_number || 0,
          column_name: columnName,
          new_value: value
        })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso.",
      })

      // Atualizar dados locais
      setData(prev => 
        prev.map(row => 
          row.id === rowId 
            ? { ...row, data: { ...row.data, [columnName]: value } }
            : row
        )
      )
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      })
    }
  }

  const totalPages = Math.ceil(totalRows / rowsPerPage)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Editor de Dados</h2>
          <p className="text-sm text-muted-foreground">
            Edite os dados importados antes de continuar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onNext}>Continuar</Button>
        </div>
      </div>

      <Card>
        <ScrollArea className="h-[600px] rounded-md border">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    {columns.map((column) => (
                      <TableHead key={column.name} className="min-w-[200px]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{column.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({column.type})
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {row.row_number}
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell key={`${row.id}-${column.name}`} className="p-0">
                          <Input
                            className="h-8 px-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                            value={row.data[column.name] ?? ''}
                            onChange={(e) => {
                              const newData = [...data]
                              const rowIndex = newData.findIndex(r => r.id === row.id)
                              newData[rowIndex].data[column.name] = e.target.value
                              setData(newData)
                            }}
                            onBlur={(e) => handleSave(row.id, column.name, e.target.value)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            {totalRows} linhas no total
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm">
              Página {page} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
