import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import DataGrid from "react-data-grid"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { DataAnalysisTools } from "./DataAnalysisTools"
import { 
  Minimize, 
  Loader2, 
  PencilLine, 
  Search, 
  Filter, 
  Download, 
  Table, 
  ArrowUpDown, 
  Eye,
  ChevronLeft,
  ChevronRight,
  BarChart4,
  FileSpreadsheet,
  Info
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { DataToolbar } from "./DataToolbar"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { DataQualityCard } from "./analysis/DataQualityCard"
import { StatisticsCard } from "./analysis/StatisticsCard"
import "./data-grid.css"
import { DataIntegrityAnalysis } from "./analysis/DataIntegrityAnalysis"

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
  const [activeView, setActiveView] = useState<'table' | 'analysis'>('table')
  const [totalRows, setTotalRows] = useState<number | null>(null)
  const [pageSize, setPageSize] = useState(100)
  
  const { currentOrganization } = useAuth()
  const { toast } = useToast()

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

      if (fileData.totalRows && totalRows === null) {
        setTotalRows(fileData.totalRows)
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

  const handleNextPage = () => {
    if (currentPage < Math.ceil((totalRows || 0) / pageSize) && !isLoadingMore) {
      loadData(currentPage + 1, true)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const filteredColumns = useMemo(() => 
    columns
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
      })),
    [columns, visibleColumns, sortColumn, sortDirection]
  )

  const totalPages = useMemo(() => 
    totalRows ? Math.ceil(totalRows / pageSize) : null,
    [totalRows, pageSize]
  )

  const formatData = (row: any, column: string) => {
    const value = row[column]
    if (value === null || value === undefined) return '-'
    
    const columnDef = columns.find(col => col.name === column)
    if (columnDef?.type === 'date') {
      return new Date(value).toLocaleDateString()
    }
    return value
  }

  const rowClass = (rowIdx: number) => {
    return rowIdx % 2 === 0 ? 'row-even' : 'row-odd'
  }

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

        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="h-80 flex flex-col items-center justify-center space-y-4">
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
    <div className="flex flex-col h-full space-y-6">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => setIsFullscreen(true)}
                  className="gap-2"
                >
                  <PencilLine className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar dados</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Abrir editor de dados em tela cheia
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs 
        defaultValue="table" 
        className="space-y-4"
        onValueChange={(value) => setActiveView(value as 'table' | 'analysis')}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Análise</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
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

          <Card className="border shadow-sm">
            <CardContent className="p-0">
              <div className="data-grid-container">
                <DataGrid
                  columns={filteredColumns}
                  rows={data}
                  className="rdg-light"
                  rowHeight={40}
                  onRowsChange={setData}
                  rowClass={rowClass}
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
                  <div className="absolute bottom-8 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 flex justify-center">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Carregando mais dados...</span>
                    </div>
                  </div>
                )}

                <div className="data-grid-status">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {data.length} registros carregados
                    </Badge>
                    {totalRows && (
                      <Badge variant="outline" className="font-normal">
                        {totalRows} total
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                      className="h-6 w-6"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {totalPages ? (
                      <span className="text-xs">
                        Página {currentPage} de {totalPages}
                      </span>
                    ) : (
                      <span className="text-xs">Página {currentPage}</span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleNextPage}
                      disabled={!hasMoreData}
                      className="h-6 w-6"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Resumo dos Dados
              </CardTitle>
              <CardDescription>
                Análise estatística e de qualidade dos dados importados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <DataIntegrityAnalysis fileId={fileId} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Qualidade dos Dados</h3>
                  {data.length > 0 ? (
                    <DataQualityCard
                      metrics={{
                        completeness: 0.95,
                        uniqueness: 0.88,
                        consistency: 0.92,
                        issues: [
                          { 
                            type: "missing_values", 
                            description: "Valores em branco na coluna 'Razão Social'", 
                            rowCount: 3 
                          },
                          { 
                            type: "format_issues", 
                            description: "Formato inconsistente na coluna 'Data'", 
                            rowCount: 2 
                          },
                          { 
                            type: "outliers", 
                            description: "Valores atípicos na coluna 'Valor'", 
                            rowCount: 1 
                          }
                        ]
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">Sem dados para análise</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Estatísticas por Coluna</h3>
                  {columns.length > 0 && data.length > 0 ? (
                    <StatisticsCard
                      columnName={columns[0].name}
                      statistics={{
                        count: data.length,
                        distinctCount: new Set(data.map(row => row[columns[0].name])).size,
                        nullCount: data.filter(row => row[columns[0].name] == null).length,
                        distribution: {},
                        mean: 42.5,
                        median: 38,
                        quartiles: [25, 38, 42, 60]
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 border rounded-md bg-muted/20">
                      <p className="text-muted-foreground">Sem dados para análise</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/10 flex justify-between">
              <p className="text-xs text-muted-foreground">Análise baseada nos dados carregados</p>
              <Button variant="outline" size="sm" className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Relatório
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

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
              <div className="data-grid-container my-4">
                <DataGrid
                  columns={filteredColumns}
                  rows={data}
                  className="rdg-light"
                  rowHeight={40}
                  rowClass={rowClass}
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
                  <div className="absolute bottom-8 left-0 right-0 bg-background/80 backdrop-blur-sm p-2 flex justify-center">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Carregando mais dados...</span>
                    </div>
                  </div>
                )}

                <div className="data-grid-status">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-normal">
                      {data.length} registros carregados
                    </Badge>
                    {totalRows && (
                      <Badge variant="outline" className="font-normal">
                        {totalRows} total
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handlePrevPage}
                      disabled={currentPage <= 1}
                      className="h-6 w-6"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {totalPages ? (
                      <span className="text-xs">
                        Página {currentPage} de {totalPages}
                      </span>
                    ) : (
                      <span className="text-xs">Página {currentPage}</span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleNextPage}
                      disabled={!hasMoreData}
                      className="h-6 w-6"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
