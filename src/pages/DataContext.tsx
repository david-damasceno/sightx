import { useState } from "react"
import { FileText, List, LayoutGrid, Search, Filter, X } from "lucide-react"
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

      // Mapear os dados para o formato esperado pelo FileList
      return data?.map(item => ({
        id: item.id,
        file_name: item.original_filename,
        file_type: 'csv', // ou determinar dinamicamente baseado no nome do arquivo
        created_at: item.created_at || '',
        status: item.status || '',
        preview_data: item.columns_metadata
      })) || []
    },
    enabled: !!currentOrganization?.id
  })

  const handleUploadSuccess = async (data: any) => {
    setUploadedFile(data)
    await refetch()
    toast({
      title: "Arquivo processado",
      description: "Agora você pode contextualizar os dados.",
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

  const handleToggleSelect = (fileId: string) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId)
      }
      return [...prev, fileId]
    })
  }

  const handleMappingComplete = async (tableName: string) => {
    toast({
      title: "Dados importados",
      description: `Os dados foram importados para a tabela ${tableName}.`,
    })
    setUploadedFile(null)
    await refetch()
  }

  const filteredFiles = dataImports?.filter(file =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Uploader de arquivos */}
            <FileUploader onUploadSuccess={handleUploadSuccess} />
            
            {/* Lista de arquivos processados */}
            {filteredFiles && filteredFiles.length > 0 && (
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
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Contextualização dos Dados</CardTitle>
                    <CardDescription>
                      Descreva o conteúdo dos dados para receber sugestões de nomes mais descritivos
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ColumnMapper
                  columns={uploadedFile.columns}
                  previewData={uploadedFile.preview_data}
                  onMappingComplete={handleMappingComplete}
                />
              </CardContent>
            </Card>
          ) : (
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
                        {selectedFile.columns_metadata.columns.map((column: any) => (
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
                            {selectedFile.columns_metadata.columns.map((column: any) => (
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
          )}
        </div>
      </div>
    </div>
  )
}