
import { useState } from "react"
import { FileText, List, LayoutGrid, Search, Filter, X, Trash2, FileUp, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { FileUploader } from "@/components/data-import/FileUploader"
import { ColumnMapper } from "@/components/data-import/ColumnMapper"
import { FileList } from "@/components/chat/FileList"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"

export default function DataContext() {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [suggestedAnalyses, setSuggestedAnalyses] = useState<any[]>([])
  const [selectedAnalyses, setSelectedAnalyses] = useState<any[]>([])
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const { data: dataImports, refetch } = useQuery({
    queryKey: ['data-imports', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) {
        return []
      }

      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar arquivos",
          description: "Não foi possível carregar a lista de arquivos importados.",
          variant: "destructive",
        })
        throw error
      }

      return data?.map(item => ({
        id: item.id,
        file_name: item.original_filename || 'Arquivo sem nome',
        file_type: 'csv',
        created_at: item.created_at || new Date().toISOString(),
        status: item.status || 'pending',
        preview_data: item.columns_metadata || {}
      })) || []
    },
    enabled: !!currentOrganization?.id
  })

  const handleUploadSuccess = async (data: any) => {
    if (!data) {
      toast({
        title: "Erro no upload",
        description: "Dados do arquivo não foram recebidos corretamente.",
        variant: "destructive",
      })
      return
    }

    setUploadedFile(data)
    await refetch()
    toast({
      title: "Arquivo processado",
      description: "Agora você pode contextualizar os dados.",
    })
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
      if (!fileId) {
        throw new Error("ID do arquivo não fornecido")
      }

      const { error } = await supabase
        .from('data_imports')
        .delete()
        .eq('id', fileId)

      if (error) throw error

      if (selectedFile?.id === fileId) {
        setSelectedFile(null)
      }

      await refetch()

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi removido com sucesso.",
      })
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: "Erro ao excluir arquivo",
        description: "Não foi possível excluir o arquivo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleToggleSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId)
      }
      return [...prev, fileId]
    })
  }

  const handleAnalyzeData = async (tableName: string, previewData: any) => {
    if (!currentOrganization?.id || !uploadedFile?.id) {
      toast({
        title: "Erro na análise",
        description: "Informações necessárias não encontradas.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-data-insights', {
        body: {
          previewData,
          importId: uploadedFile.id,
          organizationId: currentOrganization.id,
          description: `Dados importados da tabela ${tableName}`
        }
      })

      if (error) throw error

      setSuggestedAnalyses(data.suggestions)
      toast({
        title: "Análise concluída",
        description: "Sugestões de análise foram geradas com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao analisar dados:', error)
      toast({
        title: "Erro na análise",
        description: "Não foi possível gerar sugestões de análise.",
        variant: "destructive",
      })
    }
  }

  const handleMappingComplete = async (tableName: string, previewData: any) => {
    if (!tableName) {
      toast({
        title: "Erro na importação",
        description: "Nome da tabela não fornecido.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Dados importados",
      description: `Os dados foram importados para a tabela ${tableName}.`,
    })

    // Analisar os dados após a importação
    await handleAnalyzeData(tableName, previewData)
    
    setUploadedFile(null)
    await refetch()
  }

  const handleCancelContext = () => {
    setUploadedFile(null)
    setSuggestedAnalyses([])
    setSelectedAnalyses([])
  }

  const filteredFiles = dataImports?.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contextualização de Dados</h1>
          <p className="text-muted-foreground">
            Gerencie e contextualize seus dados de forma inteligente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Arquivos */}
        <Card className="col-span-3 h-[calc(100vh-12rem)] bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-background">
          <CardHeader>
            <CardTitle className="text-lg">Arquivos</CardTitle>
            <CardDescription>Seus arquivos de dados</CardDescription>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Buscar arquivo..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="icon" className="shrink-0">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Uploader de arquivos */}
            <FileUploader onUploadSuccess={handleUploadSuccess} />
            
            {/* Lista de arquivos processados */}
            {Array.isArray(filteredFiles) && filteredFiles.length > 0 && (
              <FileList
                files={filteredFiles}
                onDelete={handleDeleteFile}
                selectedFiles={selectedFiles}
                onToggleSelect={handleToggleSelect}
              />
            )}
          </CardContent>
        </Card>

        {/* Área Principal */}
        <div className="col-span-9 space-y-6">
          {uploadedFile ? (
            <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-background">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Contextualização dos Dados</CardTitle>
                    <CardDescription>
                      Descreva o conteúdo dos dados para receber sugestões de nomes mais descritivos
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. O arquivo será permanentemente excluído.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            if (uploadedFile?.id) {
                              handleDeleteFile(uploadedFile.id)
                              setUploadedFile(null)
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent>
                <ColumnMapper
                  columns={uploadedFile.columns || []}
                  previewData={uploadedFile.preview_data || []}
                  onMappingComplete={handleMappingComplete}
                  onCancel={handleCancelContext}
                />

                {suggestedAnalyses.length > 0 && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold">Sugestões de Análise</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione as análises que você gostaria de realizar com estes dados:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {suggestedAnalyses.map((analysis, index) => (
                        <Card key={index} className="relative">
                          <CardHeader>
                            <CardTitle className="text-lg">{analysis.title}</CardTitle>
                            <CardDescription>{analysis.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Métricas:</span>
                                <span className="text-sm text-muted-foreground">
                                  {analysis.metrics.join(', ')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Visualização:</span>
                                <span className="text-sm text-muted-foreground">
                                  {analysis.visualization}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          <Button
                            variant={selectedAnalyses.includes(index) ? "secondary" : "outline"}
                            className="absolute top-2 right-2"
                            size="sm"
                            onClick={() => {
                              setSelectedAnalyses(prev => {
                                if (prev.includes(index)) {
                                  return prev.filter(i => i !== index)
                                }
                                return [...prev, index]
                              })
                            }}
                          >
                            {selectedAnalyses.includes(index) ? "Selecionado" : "Selecionar"}
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/10 dark:to-background">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Visualização de Dados</CardTitle>
                    <CardDescription>
                      {selectedFile ? (
                        `Visualizando ${selectedFile.original_filename || 'Arquivo sem nome'}`
                      ) : (
                        'Selecione um arquivo para visualizar os dados'
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {selectedFile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedFile(null)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex border rounded-md p-1">
                      <Button
                        variant={viewMode === 'list' ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode('list')}
                        className="h-8 w-8 rounded-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? "secondary" : "ghost"}
                        size="icon"
                        onClick={() => setViewMode('table')}
                        className="h-8 w-8 rounded-none"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtrar
                    </Button>
                    <Button variant="outline">Exportar</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <div className="animate-fade-in">
                    {viewMode === 'list' ? (
                      <div className="space-y-4">
                        {selectedFile.columns_metadata?.columns?.map((column: any) => (
                          <div
                            key={column.name}
                            className="p-4 rounded-lg border hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{column.name || 'Coluna sem nome'}</h3>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(selectedFile.created_at || new Date()), 'dd/MM/yyyy')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Tipo: {column.type || 'Não especificado'}
                            </p>
                            <p className="text-sm">Exemplo: {column.sample || 'Sem exemplo'}</p>
                          </div>
                        )) || <p>Nenhuma coluna encontrada</p>}
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Coluna</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Exemplo</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedFile.columns_metadata?.columns?.map((column: any) => (
                              <TableRow key={column.name || 'unnamed'}>
                                <TableCell className="font-medium">
                                  {column.name || 'Coluna sem nome'}
                                </TableCell>
                                <TableCell>{column.type || 'Não especificado'}</TableCell>
                                <TableCell>{column.sample || 'Sem exemplo'}</TableCell>
                              </TableRow>
                            )) || (
                              <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                  Nenhuma coluna encontrada
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum arquivo selecionado. Selecione um arquivo da lista para visualizar seus dados.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
