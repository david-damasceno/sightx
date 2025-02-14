
import { Button } from "@/components/ui/button"
import {
  Copy,
  FileWarning,
  RefreshCcw,
  Filter,
  Table,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DataAnalysisToolsProps {
  columns: string[]
  onAnalyzeDuplicates: (columnName: string) => void
  selectedColumn: string | null
  duplicates: Record<string, number>
}

export function DataAnalysisTools({
  columns,
  onAnalyzeDuplicates,
  selectedColumn,
  duplicates
}: DataAnalysisToolsProps) {
  const getDuplicatesCount = () => {
    if (!selectedColumn) return 0
    return Object.values(duplicates).filter(count => count > 1).length
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Análise de Duplicatas
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

      <Button variant="outline" className="gap-2" disabled>
        <FileWarning className="h-4 w-4" />
        Qualidade dos Dados
      </Button>

      <Button variant="outline" className="gap-2" disabled>
        <RefreshCcw className="h-4 w-4" />
        Transformações
      </Button>

      <Button variant="outline" className="gap-2" disabled>
        <Filter className="h-4 w-4" />
        Filtros Avançados
      </Button>

      <Button variant="outline" className="gap-2" disabled>
        <Table className="h-4 w-4" />
        Estatísticas
      </Button>
    </div>
  )
}
