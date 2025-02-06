import { useState } from "react"
import { FileText, List, LayoutGrid, Search, Filter, Trash2, X } from "lucide-react"
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
import { FileUploader } from "@/components/data-import/FileUploader"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/AuthContext"
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataImport } from "@/types/data-imports"

export default function DataContext() {
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [selectedFile, setSelectedFile] = useState<DataImport | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const { data: dataImports, refetch } = useQuery({
    queryKey: ['data-imports', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        toast({
          title: "Erro ao carregar arquivos",
          description: "Não foi possível carregar a lista de arquivos importados.",
          variant: "destructive",
        })
        throw error
      }

      // Transform the data to match our DataImport type
      return (data as any[]).map(item => ({
        ...item,
        columns_metadata: typeof item.columns_metadata === 'string' 
          ? JSON.parse(item.columns_metadata)
          : item.columns_metadata
      })) as DataImport[]
    },
    enabled: !!currentOrganization?.id
  })

  const handleUploadSuccess = async (data: any) => {
    if (!data) return
    await refetch()
    toast({
      title: "Arquivo importado com sucesso",
      description: "O arquivo foi processado e está pronto para contextualização.",
    })
  }

  const handleDeleteFile = async (fileId: string) => {
    try {
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

  const filteredFiles = dataImports?.filter(file =>
    file.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <Card className="col-span-3 h-[calc(100vh-12rem)]">
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buscar por nome do arquivo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {/* Sempre mostra o FileUploader */}
            <FileUploader onUploadSuccess={handleUploadSuccess} />
            
            {/* Lista de arquivos processados */}
            <div className="space-y-2 mt-4 max-h-[calc(100vh-24rem)] overflow-y-auto pr-2">
              {filteredFiles?.map((file) => (
                <div
                  key={file.id}
                  className={`relative group rounded-lg transition-all ${
                    selectedFile?.id === file.id
                      ? "bg-secondary"
                      : "hover:bg-accent"
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 p-4 h-auto pr-12"
                    onClick={() => setSelectedFile(file)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-medium truncate w-full">
                        {file.original_filename}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {file.columns_metadata.columns.length} colunas, {file.row_count} linhas • {format(new Date(file.created_at || ''), 'dd/MM/yyyy')}
                      </span>
                      <span className={`text-xs ${
                        file.status === 'completed' ? 'text-green-500' :
                        file.status === 'error' ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {file.status === 'completed' ? 'Processado' :
                         file.status === 'error' ? 'Falhou' :
                         'Pendente'}
                      </span>
                    </div>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteFile(file.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Área Principal */}
        <div className="col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Visualização de Dados</CardTitle>
                  <CardDescription>
                    {selectedFile ? (
                      `Visualizando ${selectedFile.original_filename}`
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === 'list' ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode('list')}
                            className="h-8 w-8 rounded-none"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em lista</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={viewMode === 'table' ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => setViewMode('table')}
                            className="h-8 w-8 rounded-none"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visualização em tabela</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
                      {selectedFile.columns_metadata.columns.map((column) => (
                        <div
                          key={column.name}
                          className="p-4 rounded-lg border hover:bg-accent transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{column.name}</h3>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(selectedFile.created_at || ''), 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Tipo: {column.type}
                          </p>
                          <p className="text-sm">Exemplo: {column.sample}</p>
                        </div>
                      ))}
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
                          {selectedFile.columns_metadata.columns.map((column) => (
                            <TableRow key={column.name}>
                              <TableCell className="font-medium">
                                {column.name}
                              </TableCell>
                              <TableCell>{column.type}</TableCell>
                              <TableCell>{column.sample}</TableCell>
                            </TableRow>
                          ))}
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
        </div>
      </div>
    </div>
  )
}