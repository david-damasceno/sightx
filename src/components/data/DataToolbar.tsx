
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { 
  Copy, 
  FileText, 
  Filter, 
  Search, 
  Columns, 
  Download, 
  BarChart,
  X
} from "lucide-react"

interface DataToolbarProps {
  columns: string[]
  visibleColumns: string[]
  onToggleColumn: (columnName: string) => void
  onSearch: (query: string) => void
  searchQuery: string
  onAnalyzeDuplicates: (columnName: string) => void
  selectedColumn: string | null
  duplicates: Record<string, number>
  fileId: string
}

export function DataToolbar({
  columns,
  visibleColumns,
  onToggleColumn,
  onSearch,
  searchQuery,
  onAnalyzeDuplicates,
  selectedColumn,
  duplicates,
  fileId
}: DataToolbarProps) {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchQuery)

  const getDuplicatesCount = () => {
    if (!selectedColumn) return 0
    return Object.values(duplicates).filter(count => count > 1).length
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDebouncedSearchValue(value)
    
    // Debounce para evitar muitas requisições durante a digitação
    const timeoutId = setTimeout(() => {
      onSearch(value)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const clearSearch = () => {
    setDebouncedSearchValue("")
    onSearch("")
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-accent/20 rounded-lg">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nos dados..."
          className="pl-8 pr-8"
          value={debouncedSearchValue}
          onChange={handleSearchChange}
        />
        {debouncedSearchValue && (
          <button 
            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Columns className="h-4 w-4" />
            <span>Colunas</span>
            <Badge variant="secondary" className="ml-1 px-1">
              {visibleColumns.length}/{columns.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <ScrollArea className="h-[300px]">
            {columns.map(column => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={visibleColumns.includes(column)}
                onCheckedChange={() => onToggleColumn(column)}
                className="capitalize"
              >
                {column}
              </DropdownMenuCheckboxItem>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicatas</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Selecione uma coluna</h4>
              <p className="text-sm text-muted-foreground">
                Escolha uma coluna para analisar valores duplicados
              </p>
            </div>
            <Separator />
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {columns.map(column => (
                  <Button
                    key={column}
                    variant={selectedColumn === column ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => onAnalyzeDuplicates(column)}
                  >
                    {column}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            {selectedColumn && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Resultados</h4>
                  <p className="text-sm text-muted-foreground">
                    {getDuplicatesCount()} valores duplicados encontrados
                  </p>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1"
      >
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1"
      >
        <BarChart className="h-4 w-4" />
        <span>Análise</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-1 ml-auto"
      >
        <Download className="h-4 w-4" />
        <span>Exportar</span>
      </Button>
    </div>
  )
}
