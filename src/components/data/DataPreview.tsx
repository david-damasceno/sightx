
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import DataGrid from "react-data-grid"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { DataAnalysisTools } from "./DataAnalysisTools"
import { Minimize, Loader2, PencilLine, Search, Filter, Download, Table, ArrowUpDown, Eye } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { DataToolbar } from "./DataToolbar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns.map(col => col.name))
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC')
  const [hasMoreData, setHasMoreData] = useState(true)
  
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

  const loadData = async (page: number, isMore = false) => {
    if (!currentOrganization || !fileId) {
      return
    }

    try {
      if (isMore) {
        setIsLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const { data: fileData, error } = await supabase.functions.invoke('read-file-data', {
        body: { 
          fileId, 
          page, 
          pageSize,
          organizationId: currentOrganization.id,
          sortColumn,
          sortDirection,
          searchQuery: searchQuery.length > 2 ? searchQuery : undefined
        }
      })

      if (error) {
        throw error
      }

      if (!fileData?.data || fileData.data.length === 0) {
        if (page > 1) {
          setHasMoreData(false)
          return
        }
        throw new Error('Nenhum dado encontrado no arquivo')
      }

      if (fileData.data.length < pageSize) {
        setHasMoreData(false)
      }

      setData(prevData => {
        if (page === 1) {
          return [...fileData.data]
        }
        const newData = [...prevData]
        fileData.data.forEach((row: any, index: number) => {
          newData[(page - 1) * pageSize + index] = row
        })
        return newData
      })
      setCurrentPage(page)
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os dados do arquivo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (fileId && currentOrganization) {
      setCurrentPage(1)
      setHasMoreData(true)
      loadData(1)
    }
  }, [fileId, currentOrganization, sortColumn, sortDirection, searchQuery])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortColumn(column)
      setSortDirection('ASC')
    }
  }

  const toggleColumnVisibility = (columnName: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnName) 
        ? prev.filter(col => col !== columnName)
        : [...prev, columnName]
    )
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredColumns = columns
    .filter(col => visibleColumns.includes(col.name))
    .map(col => ({
      key: col.name,
      name: col.name,
      width: 150,
      resizable: true,
      sortable: true,
      headerRenderer: () => (
        <div 
          className="flex items-center justify-between cursor-pointer w-full h-full px-2"
          onClick={() => handleSort(col.name)}
        >
          <span className="truncate">{col.name}</span>
          {sortColumn === col.name && (
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" 
              style={{ transform: sortDirection === 'DESC' ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </div>
      )
    }))

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Visualização dos Dados</h3>
            <p className="text-sm text-muted-foreground">
              Carregando dados do arquivo...
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <Card className="border">
          <CardContent className="p-0">
            <div className="h-[600px] flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Carregando dados...
              </p>
            </div>
          </CardContent>
        </Card>
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

      <DataToolbar 
        columns={columns.map(col => col.name)}
        visibleColumns={visibleColumns}
        onToggleColumn={toggleColumnVisibility}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onAnalyzeDuplicates={findDuplicates}
        selectedColumn={selectedColumn}
        duplicates={duplicates}
        fileId={fileId}
      />

      <Card className="border">
        <CardContent className="p-0">
          <div className="h-[600px] relative">
            <DataGrid
              columns={filteredColumns}
              rows={data}
              className="rdg-light"
              rowHeight={35}
              onRowsChange={setData}
              onScroll={async (event) => {
                const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
                if (
                  scrollHeight - scrollTop - clientHeight < 200 &&
                  !loading &&
                  !isLoadingMore &&
                  hasMoreData
                ) {
                  await loadData(currentPage + 1, true)
                }
              }}
            />
            
            {isLoadingMore && (
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 flex justify-center">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Carregando mais dados...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            <div className="flex-1 overflow-auto px-4 relative">
              <div className="h-full relative">
                <DataGrid
                  columns={filteredColumns}
                  rows={data}
                  className="h-full rdg-light"
                  rowHeight={35}
                  onRowsChange={setData}
                  onScroll={async (event) => {
                    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget
                    if (
                      scrollHeight - scrollTop - clientHeight < 200 &&
                      !loading &&
                      !isLoadingMore &&
                      hasMoreData
                    ) {
                      await loadData(currentPage + 1, true)
                    }
                  }}
                />
                
                {isLoadingMore && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 flex justify-center">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Carregando mais dados...</span>
                    </div>
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
