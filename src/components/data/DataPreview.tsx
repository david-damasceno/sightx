
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import DataGrid from "react-data-grid"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { DataAnalysisTools } from "./DataAnalysisTools"
import { Minimize, Loader2, PencilLine } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import "./data-grid.css"

interface DataPreviewProps {
  columns: { name: string; type: string; sample: any }[]
  previewData: any[]
  fileId: string
  onNext: () => void
}

export function DataPreview({ columns, previewData, fileId, onNext }: DataPreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [duplicates, setDuplicates] = useState<Record<string, number>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const { currentOrganization } = useAuth()
  const { toast } = useToast()
  const pageSize = 100

  const findDuplicates = (columnName: string) => {
    setSelectedColumn(columnName)
    const counts: Record<string, number> = {}
    data.forEach(row => {
      const value = row[columnName]
      counts[value] = (counts[value] || 0) + 1
    })
    setDuplicates(counts)
  }

  const loadData = async (page: number) => {
    if (!currentOrganization || !fileId) {
      return
    }

    try {
      setLoading(true)
      console.log('Carregando dados:', { fileId, page, pageSize, organizationId: currentOrganization.id })
      
      const { data: fileData, error } = await supabase.functions.invoke('read-file-data', {
        body: { 
          fileId, 
          page, 
          pageSize,
          organizationId: currentOrganization.id
        }
      })

      if (error) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do arquivo.",
          variant: "destructive"
        })
        return
      }

      if (!fileData?.data) {
        console.error('Dados não encontrados')
        return
      }

      setData(prevData => {
        const newData = [...prevData]
        fileData.data.forEach((row: any, index: number) => {
          newData[(page - 1) * pageSize + index] = row
        })
        return newData
      })
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao tentar carregar os dados.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (fileId && currentOrganization) {
      loadData(1)
    }
  }, [fileId, currentOrganization])

  const gridColumns = columns.map(col => ({
    key: col.name,
    name: col.name,
    width: 150,
    resizable: true,
    sortable: true
  }))

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Carregando dados...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Visualização dos Dados</h3>
          <p className="text-sm text-muted-foreground">
            Visualize e analise seus dados antes de prosseguir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onNext}>
            Prosseguir
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsFullscreen(true)}
            className="gap-2"
          >
            <PencilLine className="h-4 w-4" />
            Editar dados
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ScrollArea className="h-[600px]">
          <DataGrid
            columns={gridColumns}
            rows={data}
            className="h-full rdg-light"
            rowHeight={35}
            onRowsChange={setData}
            onScroll={async (event) => {
              const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
              if (
                scrollHeight - scrollTop - clientHeight < 100 &&
                !loading &&
                data.length === currentPage * pageSize
              ) {
                await loadData(currentPage + 1)
              }
            }}
          />
        </ScrollArea>
      </div>

      <Sheet open={isFullscreen} onOpenChange={setIsFullscreen}>
        <SheetContent side="bottom" className="h-screen w-screen p-0">
          <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-background z-10 border-b">
              <div className="container py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Edição de Dados</h3>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setIsFullscreen(false)}
                  >
                    <Minimize className="h-4 w-4" />
                  </Button>
                </div>
                <DataAnalysisTools
                  columns={columns.map(col => col.name)}
                  onAnalyzeDuplicates={findDuplicates}
                  selectedColumn={selectedColumn}
                  duplicates={duplicates}
                  fileId={fileId}
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto px-4">
              <ScrollArea className="h-full">
                <DataGrid
                  columns={gridColumns}
                  rows={data}
                  className="h-full rdg-light"
                  rowHeight={35}
                  onRowsChange={setData}
                  onScroll={async (event) => {
                    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
                    if (
                      scrollHeight - scrollTop - clientHeight < 100 &&
                      !loading &&
                      data.length === currentPage * pageSize
                    ) {
                      await loadData(currentPage + 1)
                    }
                  }}
                />
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
