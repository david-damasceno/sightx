
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { 
  Copy, 
  FileSearch, 
  FileWarning,
  Filter,
  RefreshCcw,
  Table,
  ChevronRight
} from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Ferramentas de Análise</h3>
        <p className="text-sm text-muted-foreground">
          Selecione uma ferramenta para analisar seus dados
        </p>
      </div>

      <ScrollArea className="flex-1">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="duplicates">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                <span>Análise de Duplicatas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 py-2">
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione uma coluna para encontrar valores duplicados
                </p>
                {columns.map(column => (
                  <Button
                    key={column}
                    variant={selectedColumn === column ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onAnalyzeDuplicates(column)}
                  >
                    <ChevronRight className="h-4 w-4 mr-2" />
                    {column}
                  </Button>
                ))}
                {selectedColumn && (
                  <div className="mt-4 p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium">Resultados da Análise</p>
                    <p className="text-sm text-muted-foreground">
                      {getDuplicatesCount()} valores duplicados encontrados
                    </p>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="quality">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <FileWarning className="h-4 w-4" />
                <span>Qualidade dos Dados</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground py-4">
                Em breve: análise de valores nulos, inconsistências e formatos
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transform">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                <span>Transformações</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground py-4">
                Em breve: conversão de tipos, normalização e padronização
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="filter">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtros Avançados</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground py-4">
                Em breve: filtros complexos e condicionais
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="stats">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                <span>Estatísticas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground py-4">
                Em breve: análises estatísticas básicas
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  )
}
