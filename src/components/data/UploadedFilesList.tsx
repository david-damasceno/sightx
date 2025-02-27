
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Eye, Download, Clock, FileText, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useNavigate } from "react-router-dom"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface UploadedFile {
  id: string
  name: string
  original_filename: string
  storage_path: string | null
  created_at: string
  status: string
}

export function UploadedFilesList() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { currentOrganization } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentOrganization) {
      loadFiles()
    }
  }, [currentOrganization])

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('data_imports')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setFiles(data)
    } catch (error: any) {
      toast({
        title: "Erro ao carregar arquivos",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (file: UploadedFile) => {
    if (!file.storage_path) {
      toast({
        title: "Erro ao baixar arquivo",
        description: "Caminho do arquivo não encontrado",
        variant: "destructive"
      })
      return
    }

    try {
      setDownloadingId(file.id)
      
      const { data, error } = await supabase.storage
        .from('data_files')
        .download(file.storage_path)

      if (error) throw error

      // Criar URL do blob e trigger download
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = file.original_filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()

      toast({
        title: "Download concluído",
        description: "O arquivo foi baixado com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao baixar arquivo",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (file: UploadedFile) => {
    if (!file.storage_path) {
      toast({
        title: "Erro ao excluir arquivo",
        description: "Caminho do arquivo não encontrado",
        variant: "destructive"
      })
      return
    }

    try {
      setDeletingId(file.id)

      // 1. Excluir o arquivo do storage
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('data_files')
          .remove([file.storage_path])

        if (storageError) throw storageError
      }

      // 2. Excluir o registro do banco de dados
      const { error: dbError } = await supabase
        .from('data_imports')
        .delete()
        .eq('id', file.id)
        .eq('organization_id', currentOrganization?.id)

      if (dbError) throw dbError

      // 3. Atualizar a lista de arquivos
      setFiles(files.filter(f => f.id !== file.id))

      toast({
        title: "Arquivo excluído",
        description: "O arquivo foi excluído com sucesso",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir arquivo",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (file: UploadedFile) => {
    navigate(`/reports/data-context/${file.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-medium text-lg">Nenhum arquivo importado</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Seus arquivos importados aparecerão aqui
            </p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-card hover:bg-accent rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{file.name}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(file.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleView(file)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file.id || !file.storage_path}
                >
                  {downloadingId === file.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      disabled={deletingId === file.id}
                    >
                      {deletingId === file.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir o arquivo "{file.name}"? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => handleDelete(file)}
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  )
}
