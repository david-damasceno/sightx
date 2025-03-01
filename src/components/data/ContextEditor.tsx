
import { useState, useEffect } from "react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  PenLine, 
  Sparkles, 
  ArrowRight, 
  Info 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { ColumnMetadata } from "@/types/data-import-flow"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ContextEditorProps {
  fileId: string
  tableName: string
  onComplete: () => void
}

export function ContextEditor({ fileId, tableName, onComplete }: ContextEditorProps) {
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [tableDescription, setTableDescription] = useState("")
  const [importName, setImportName] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Buscar dados da importação
        const { data: importData, error: importError } = await supabase
          .from('data_imports')
          .select('*')
          .eq('id', fileId)
          .single()
        
        if (importError) throw importError
        
        if (importData) {
          setImportName(importData.name)
          setTableDescription(importData.description || "")
        }
        
        // Buscar metadados das colunas
        const { data: columnsData, error: columnsError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)
        
        if (columnsError) throw columnsError
        
        setColumns(columnsData || [])
      } catch (error: any) {
        console.error('Erro ao buscar dados de contexto:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os metadados da tabela",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [fileId, toast])

  const handleColumnNameChange = (id: string, newName: string) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === id ? { ...col, display_name: newName } : col
      )
    )
  }

  const handleColumnDescriptionChange = (id: string, newDescription: string) => {
    setColumns(prevColumns => 
      prevColumns.map(col => 
        col.id === id ? { ...col, description: newDescription } : col
      )
    )
  }

  const analyzeWithAI = async () => {
    try {
      setAnalyzing(true)
      
      // Chamar a função serverless para análise
      const { error: analysisError } = await supabase.functions.invoke('analyze-table-context', {
        body: { 
          fileId,
          tableName,
          description: tableDescription 
        }
      })
      
      if (analysisError) throw analysisError
      
      // Recarregar os dados atualizados
      const { data: updatedColumns, error: reloadError } = await supabase
        .from('column_metadata')
        .select('*')
        .eq('import_id', fileId)
      
      if (reloadError) throw reloadError
      
      setColumns(updatedColumns || [])
      
      toast({
        title: "Análise Completa",
        description: "A IA analisou os dados e atualizou as sugestões",
      })
    } catch (error: any) {
      console.error('Erro na análise com IA:', error)
      toast({
        title: "Erro",
        description: "Não foi possível realizar a análise com IA",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const saveChanges = async () => {
    try {
      setLoading(true)
      
      // Atualizar descrição da importação
      const { error: importError } = await supabase
        .from('data_imports')
        .update({
          description: tableDescription
        })
        .eq('id', fileId)
      
      if (importError) throw importError
      
      // Atualizar metadados das colunas
      for (const column of columns) {
        const { error: columnError } = await supabase
          .from('column_metadata')
          .update({
            display_name: column.display_name,
            description: column.description
          })
          .eq('id', column.id)
        
        if (columnError) throw columnError
      }
      
      toast({
        title: "Sucesso",
        description: "Contexto e metadados salvos com sucesso",
      })
      
      onComplete()
    } catch (error: any) {
      console.error('Erro ao salvar contexto:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-border/40 shadow-sm">
        <CardContent className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Carregando metadados da tabela...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <PenLine className="h-5 w-5" />
              Contextualização dos Dados
            </CardTitle>
            <CardDescription>
              Refine os nomes e descrições das colunas para melhor entendimento
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={analyzeWithAI}
              disabled={analyzing}
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {analyzing ? "Analisando..." : "Analisar com IA"}
            </Button>
            <Button onClick={saveChanges}>
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-medium">Tabela: </h3>
            <span className="text-muted-foreground">{tableName}</span>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Nome do Arquivo</h3>
            <Input 
              value={importName} 
              onChange={(e) => setImportName(e.target.value)}
              placeholder="Nome do arquivo"
            />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Descrição da Tabela</h3>
            <Textarea 
              value={tableDescription} 
              onChange={(e) => setTableDescription(e.target.value)}
              placeholder="Descreva o conteúdo desta tabela e seu propósito"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Uma boa descrição ajuda a IA a gerar melhores análises
            </p>
          </div>
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Original</TableHead>
                <TableHead>Nome Amigável</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Amostra</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column) => (
                <TableRow key={column.id}>
                  <TableCell className="font-mono text-xs">
                    {column.original_name}
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={column.display_name || ''} 
                      onChange={(e) => handleColumnNameChange(column.id, e.target.value)}
                      placeholder="Nome amigável"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea 
                      value={column.description || ''} 
                      onChange={(e) => handleColumnDescriptionChange(column.id, e.target.value)}
                      placeholder="Descreva esta coluna"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {column.data_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm">
                          <p className="font-medium text-xs mb-1">Amostra de valores:</p>
                          <div className="text-xs">
                            {column.sample_values && 
                              (Array.isArray(column.sample_values) 
                                ? column.sample_values.map((val, i) => 
                                    <div key={i} className="mb-1">{String(val)}</div>
                                  )
                                : JSON.stringify(column.sample_values)
                              )
                            }
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <p className="text-sm text-muted-foreground">
          {columns.length} colunas configuradas
        </p>
        <Button onClick={saveChanges} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              Salvar e Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
