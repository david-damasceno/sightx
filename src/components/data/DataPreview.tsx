
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
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, ChevronLeft, ChevronRight, Search, Maximize, Minimize, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { DataAnalysisTools } from "./DataAnalysisTools"

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

export function DataPreview({ columns, previewData, fileId, onNext }: DataPreviewProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalRows, setTotalRows] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [duplicates, setDuplicates] = useState<Record<string, number>>({})
  const rowsPerPage = 50
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const fetchData = async () => {
    try {
      setLoading(true)

      const { data: fileData, error } = await supabase.functions.invoke('read-file-data', {
        body: { fileId, page, pageSize: rowsPerPage }
      })

      if (error) throw error

      let filteredData = fileData.data

      // Aplicar filtros
      Object.entries(filters).forEach(([column, value]) => {
        if (value) {
          filteredData = filteredData.filter((row: any) => 
            String(row[column]).toLowerCase().includes(value.toLowerCase())
          )
        }
      })

      setData(filteredData)
      setTotalRows(fileData.totalRows)
      setTotalPages(fileData.totalPages)

    } catch (error: any) {
      console.error('Erro ao buscar dados:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do arquivo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, fileId, filters])

  const handleSave = async (rowIndex: number, columnName: string, value: string) => {
    if (!currentOrganization) {
      toast({
        title: "Erro",
        description: "Organização não encontrada",
        variant: "destructive"
      })
      return
    }

    try {
      const newData = [...data]
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnName]: value
      }
      setData(newData)

      const { error } = await supabase
        .from('data_file_changes')
        .insert({
          file_id: fileId,
          row_id: rowIndex.toString(),
          column_name: columnName,
          old_value: data[rowIndex][columnName],
          new_value: value,
          organization_id: currentOrganization.id
        })

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso.",
      })
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      })
    }
  }

  const handleFilter = (columnName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnName]: value
    }))
  }

  const findDuplicates = (columnName: string) => {
    const counts: Record<string, number> = {}
    data.forEach(row => {
      const value = String(row[columnName])
      counts[value] = (counts[value] || 0) + 1
    })
    
    setSelectedColumn(columnName)
    setDuplicates(counts)

    // Destacar valores duplicados
    const hasDuplicates = Object.values(counts).some(count => count > 1)
    if (hasDuplicates) {
      toast({
        title: "Análise de Duplicatas",
        description: `Foram encontrados valores duplicados na coluna ${columnName}`,
        variant: "warning"
      })
    } else {
      toast({
        title: "Análise de Duplicatas",
        description: `Não foram encontrados valores duplicados na coluna ${columnName}`,
      })
    }
  }

  const isDuplicate = (value: any, columnName: string) => {
    if (selectedColumn !== columnName) return false
    return duplicates[String(value)] > 1
  }

  const TableContent = () => (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center sticky left-0 bg-background">#</TableHead>
            {Object.keys(data[0] || {}).map((columnName) => (
              <TableHead key={columnName} className="min-w-[200px]">
                <div className="space-y-2">
                  <div className="font-medium">{columnName}</div>
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      className="h-8"
                      placeholder="Filtrar..."
                      value={filters[columnName] || ''}
                      onChange={(e) => handleFilter(columnName, e.target.value)}
                    />
                  </div>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell className="text-center text-muted-foreground sticky left-0 bg-background">
                {(page - 1) * rowsPerPage + rowIndex + 1}
              </TableCell>
              {Object.entries(row).map(([columnName, value]) => (
                <TableCell 
                  key={`${rowIndex}-${columnName}`} 
                  className={cn(
                    "p-0",
                    isDuplicate(value, columnName) && "bg-yellow-50 dark:bg-yellow-900/20"
                  )}
                >
                  <Input
                    className="h-8 px-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={value === null ? '' : String(value)}
                    onChange={(e) => {
                      const newData = [...data]
                      newData[rowIndex][columnName] = e.target.value
                      setData(newData)
                    }}
                    onBlur={(e) => handleSave(rowIndex, columnName, e.target.value)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

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
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize className="h-4 w-4" />
          </Button>
          <Button onClick={onNext}>Continuar</Button>
        </div>
      </div>

      <Card>
        <ScrollArea className="h-[600px] rounded-md border">
          <div className="min-w-[1200px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : data.length > 0 ? (
              <TableContent />
            ) : (
              <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
                Nenhum dado encontrado
              </div>
            )}
          </div>
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

      <Sheet open={isFullscreen} onOpenChange={setIsFullscreen}>
        <SheetContent side="bottom" className="h-screen w-screen p-0">
          <div className="flex h-full">
            <div className="w-[300px] border-r p-4 bg-muted/30">
              <DataAnalysisTools
                columns={Object.keys(data[0] || {})}
                onAnalyzeDuplicates={findDuplicates}
                selectedColumn={selectedColumn}
                duplicates={duplicates}
              />
            </div>
            <div className="flex-1 overflow-auto">
              <div className="sticky top-0 bg-background z-10 p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">Visualização em Tela Cheia</h3>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsFullscreen(false)}
                >
                  <Minimize className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-w-[1200px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : data.length > 0 ? (
                  <TableContent />
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-muted-foreground">
                    Nenhum dado encontrado
                  </div>
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
