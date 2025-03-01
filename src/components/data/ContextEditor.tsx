
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronRight, Loader2, Sparkles, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnMetadata, DataImport } from "@/types/data-imports"

interface ContextEditorProps {
  fileId: string | null
  onNext: () => void
}

export function ContextEditor({ fileId, onNext }: ContextEditorProps) {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [fileInfo, setFileInfo] = useState<DataImport | null>(null)
  const [columns, setColumns] = useState<ColumnMetadata[]>([])
  const [tableContext, setTableContext] = useState("")
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  useEffect(() => {
    if (!fileId || !currentOrganization) return

    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar informações do arquivo
        const { data: fileData, error: fileError } = await supabase
          .from('data_imports')
          .select('*')
          .eq('id', fileId)
          .single()

        if (fileError) throw fileError
        setFileInfo(fileData)
        setTableContext(fileData.context || "")

        // Buscar metadados das colunas
        const { data: columnsData, error: columnsError } = await supabase
          .from('column_metadata')
          .select('*')
          .eq('import_id', fileId)

        if (columnsError) throw columnsError
        setColumns(columnsData || [])
      } catch (error: any) {
        console.error('Erro ao carregar dados:', error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os metadados",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fileId, currentOrganization, toast])

  const updateColumnMetadata = async (id: string, updates: Partial<ColumnMetadata>) => {
    try {
      const { error } = await supabase
        .from('column_metadata')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Atualizar estado local
      setColumns(prev => 
        prev.map(col => 
          col.id === id ? { ...col, ...updates } : col
        )
      )
    } catch (error: any) {
      console.error('Erro ao atualizar coluna:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a coluna",
        variant: "destructive"
      })
    }
  }

  const updateTableContext = async () => {
    if (!fileId || !fileInfo) return

    try {
      const { error } = await supabase
        .from('data_imports')
        .update({
          context: tableContext
        })
        .eq('id', fileId)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Contexto da tabela atualizado com sucesso"
      })
    } catch (error: any) {
      console.error('Erro ao atualizar contexto:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o contexto",
        variant: "destructive"
      })
    }
  }

  const analyzeWithAI = async () => {
    if (!fileId || !fileInfo) return

    try {
      setAnalyzing(true)
      
      const { error } = await supabase.functions.invoke('analyze-table-context', {
        body: { 
          fileId,
          organizationId: currentOrganization?.id
        }
      })

      if (error) throw error

      // Recarregar dados após análise
      const { data: updatedFile } = await supabase
        .from('data_imports')
        .select('*')
        .eq('id', fileId)
        .single()

      if (updatedFile) {
        setFileInfo(updatedFile)
        setTableContext(updatedFile.context || "")
      }

      // Recarregar metadados das colunas
      const { data: updatedColumns } = await supabase
        .from('column_metadata')
        .select('*')
        .eq('import_id', fileId)

      if (updatedColumns) {
        setColumns(updatedColumns)
      }

      toast({
        title: "Análise concluída",
        description: "Sugestões de contexto e metadados foram geradas com sucesso"
      })
    } catch (error: any) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar a análise",
        variant: "destructive"
      })
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <Card className="shadow-md border border-border/40 bg-background">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle>Contextualização dos Dados</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">
                Carregando metadados...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium">Descrição dos Dados</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={analyzeWithAI}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {analyzing ? "Analisando..." : "Gerar com IA"}
                </Button>
              </div>
              <Textarea 
                value={tableContext} 
                onChange={(e) => setTableContext(e.target.value)}
                placeholder="Descreva o contexto desses dados (ex: Este conjunto de dados contém informações sobre vendas mensais...)"
                className="min-h-24"
              />
              <div className="flex justify-end">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={updateTableContext}
                >
                  Salvar Descrição
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-md font-medium">Metadados das Colunas</h3>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Nome Original</TableHead>
                      <TableHead className="w-[200px]">Nome para Exibição</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-[120px]">Tipo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {columns.map(column => (
                      <TableRow key={column.id}>
                        <TableCell className="font-medium">
                          {column.original_name}
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={column.display_name || ''} 
                            onChange={(e) => updateColumnMetadata(column.id, { display_name: e.target.value })}
                            placeholder="Nome para exibição"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={column.description || ''} 
                            onChange={(e) => updateColumnMetadata(column.id, { description: e.target.value })}
                            placeholder="Descrição da coluna"
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          {column.data_type}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6 pt-0">
        <div>
          {fileInfo && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Tabela:</span> {fileInfo.table_name}
            </p>
          )}
        </div>
        <Button 
          onClick={onNext} 
          disabled={loading}
          className="gap-1"
        >
          Prosseguir para Análise de Qualidade
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
