
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Copy,
  FileWarning,
  RefreshCcw,
  Filter,
  Table,
  BarChart,
  Settings2,
  Search,
  XCircle,
  AlertTriangle
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { DataQualityCard } from "./analysis/DataQualityCard"
import { StatisticsCard } from "./analysis/StatisticsCard"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { DataQualityMetrics, ColumnStatistics } from "@/types/data-analysis"

interface DataAnalysisToolsProps {
  columns: string[]
  onAnalyzeDuplicates: (columnName: string) => void
  selectedColumn: string | null
  duplicates: Record<string, number>
  fileId: string
}

export function DataAnalysisTools({
  columns,
  onAnalyzeDuplicates,
  selectedColumn,
  duplicates,
  fileId
}: DataAnalysisToolsProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [isTransformOpen, setIsTransformOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("quality")
  const [selectedColumnForAnalysis, setSelectedColumnForAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetrics | null>(null)
  const [statistics, setStatistics] = useState<ColumnStatistics | null>(null)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const getDuplicatesCount = () => {
    if (!selectedColumn) return 0
    return Object.values(duplicates).filter(count => count > 1).length
  }

  const analyzeDuplicates = async (columnName: string) => {
    try {
      setLoading(true)
      onAnalyzeDuplicates(columnName)

      // Salvar análise no banco
      if (currentOrganization) {
        await supabase.from('data_analysis_results').insert({
          file_id: fileId,
          organization_id: currentOrganization.id,
          analysis_type: 'duplicates',
          column_name: columnName,
          results: duplicates
        })
      }
    } catch (error) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro",
        description: "Não foi possível realizar a análise de duplicatas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeQuality = async (columnName: string) => {
    try {
      setLoading(true)
      
      const { data: { quality } } = await supabase.functions.invoke('analyze-data-quality', {
        body: { fileId, columnName }
      })

      setQualityMetrics(quality)

      if (currentOrganization) {
        await supabase.from('data_analysis_results').insert({
          file_id: fileId,
          organization_id: currentOrganization.id,
          analysis_type: 'quality',
          column_name: columnName,
          results: quality
        })
      }
    } catch (error) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro",
        description: "Não foi possível analisar a qualidade dos dados",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const analyzeStatistics = async (columnName: string) => {
    try {
      setLoading(true)
      
      const { data: { stats } } = await supabase.functions.invoke('analyze-data-statistics', {
        body: { fileId, columnName }
      })

      setStatistics(stats)

      if (currentOrganization) {
        await supabase.from('data_analysis_results').insert({
          file_id: fileId,
          organization_id: currentOrganization.id,
          analysis_type: 'statistics',
          column_name: columnName,
          results: stats
        })
      }
    } catch (error) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro",
        description: "Não foi possível calcular as estatísticas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleColumnSelect = async (columnName: string) => {
    setSelectedColumnForAnalysis(columnName)
    
    if (activeTab === "quality") {
      await analyzeQuality(columnName)
    } else if (activeTab === "statistics") {
      await analyzeStatistics(columnName)
    }
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
                    onClick={() => analyzeDuplicates(column)}
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
        className="gap-2"
        onClick={() => setIsAnalysisOpen(true)}
      >
        <BarChart className="h-4 w-4" />
        Análise Detalhada
      </Button>

      <Button 
        variant="outline" 
        className="gap-2"
        onClick={() => setIsTransformOpen(true)}
      >
        <Settings2 className="h-4 w-4" />
        Transformações
      </Button>

      <Button variant="outline" className="gap-2">
        <Filter className="h-4 w-4" />
        Filtros Avançados
      </Button>

      <Sheet open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <SheetContent side="right" className="w-[600px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Análise Detalhada</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione uma coluna</label>
                <Select value={selectedColumnForAnalysis || ''} onValueChange={handleColumnSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedColumnForAnalysis && (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quality">Qualidade</TabsTrigger>
                    <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quality" className="mt-4">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin">
                          <FileWarning className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    ) : qualityMetrics ? (
                      <DataQualityCard metrics={qualityMetrics} />
                    ) : (
                      <div className="flex items-center justify-center p-8 text-muted-foreground">
                        Selecione uma coluna para análise
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="statistics" className="mt-4">
                    {loading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin">
                          <BarChart className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    ) : statistics ? (
                      <StatisticsCard 
                        columnName={selectedColumnForAnalysis} 
                        statistics={statistics} 
                      />
                    ) : (
                      <div className="flex items-center justify-center p-8 text-muted-foreground">
                        Selecione uma coluna para análise
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={isTransformOpen} onOpenChange={setIsTransformOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Transformações de Dados</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione uma coluna</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Transformação</label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma transformação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trim">Remover Espaços</SelectItem>
                    <SelectItem value="uppercase">Maiúsculas</SelectItem>
                    <SelectItem value="lowercase">Minúsculas</SelectItem>
                    <SelectItem value="replace">Substituir Valores</SelectItem>
                    <SelectItem value="remove_special">Remover Caracteres Especiais</SelectItem>
                    <SelectItem value="format_number">Formatar Número</SelectItem>
                    <SelectItem value="format_date">Formatar Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Parâmetros</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    disabled
                    placeholder="Valor antigo" 
                  />
                  <Input 
                    disabled
                    placeholder="Novo valor" 
                  />
                </div>
              </div>

              <Button disabled className="w-full">
                Aplicar Transformação
              </Button>

              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    As transformações de dados estarão disponíveis em breve
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
