
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UploadCloud, Loader2, FileX } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

interface FileUploaderProps {
  onUploadComplete: (fileId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const { toast } = useToast()
  const { currentOrganization, user } = useAuth()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentOrganization || !user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado ou organização não selecionada",
        variant: "destructive"
      })
      return
    }

    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadError(null)
    setUploading(true)
    setUploadProgress(0)

    try {
      console.log('Iniciando upload do arquivo:', file.name, 'tamanho:', Math.round(file.size / 1024), 'KB', 'tipo:', file.type)
      
      // Validar tamanho máximo (50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("O arquivo é muito grande. O tamanho máximo permitido é 50MB.")
      }
      
      // Gerar nome de tabela único baseado no nome do arquivo
      const tableName = `data_${file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")}_${Date.now().toString().slice(-6)}`

      console.log('Nome da tabela gerado:', tableName)
      setUploadProgress(10)
      
      // Criar registro do import
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          created_by: user.id,
          name: file.name,
          original_filename: file.name,
          file_type: file.type,
          status: 'uploading',
          context: '',
          description: '',
          metadata: {},
          columns_metadata: {},
          column_analysis: {},
          data_quality: {},
          data_validation: {},
          table_name: tableName
        })
        .select()
        .single()

      if (importError) {
        console.error('Erro ao criar registro de importação:', importError)
        throw new Error(`Erro ao criar registro: ${importError.message}`)
      }

      console.log('Registro de importação criado:', importData.id)
      setUploadProgress(20)
      
      // Upload do arquivo - certificando-se de usar o bucket correto (data_files com underscore)
      const filePath = `${currentOrganization.id}/${importData.id}/${file.name}`
      console.log('Caminho do arquivo para upload:', filePath)
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload do arquivo:', uploadError)
        throw new Error(`Erro no upload: ${uploadError.message}`)
      }

      console.log('Arquivo enviado com sucesso, atualizando status')
      setUploadProgress(60)
      
      // Atualizar storage_path e status
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'processing'
        })
        .eq('id', importData.id)

      if (updateError) {
        console.error('Erro ao atualizar registro:', updateError)
        throw new Error(`Erro ao atualizar registro: ${updateError.message}`)
      }

      console.log('Registro atualizado, iniciando processamento')
      setUploadProgress(70)
      
      // Iniciar processamento do arquivo para criar tabela automaticamente
      console.log('Chamando edge function com:', { 
        fileId: importData.id, 
        organizationId: currentOrganization.id 
      })
      
      const { data: processData, error: processingError } = await supabase.functions.invoke('process-file-upload', {
        body: { 
          fileId: importData.id,
          organizationId: currentOrganization.id 
        }
      })

      if (processingError) {
        console.error('Erro ao chamar função de processamento:', processingError)
        throw new Error(`Erro ao processar: ${processingError.message}`)
      }

      console.log('Processamento iniciado com sucesso:', processData)
      setUploadProgress(100)
      
      toast({
        title: "Sucesso",
        description: "Arquivo enviado e processamento iniciado. A tabela está sendo criada automaticamente.",
      })

      onUploadComplete(importData.id)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      setUploadError(error.message || "Não foi possível fazer o upload do arquivo")
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo",
        variant: "destructive"
      })
      
      // Atualizar o status para erro se já tivermos criado um registro
      if (error.fileId) {
        await supabase
          .from('data_imports')
          .update({
            status: 'error',
            error_message: error.message
          })
          .eq('id', error.fileId)
      }
    } finally {
      setUploading(false)
    }
  }, [currentOrganization, user, toast, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    disabled: uploading,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors",
        isDragActive && "border-primary/50 bg-primary/5",
        uploading && "opacity-70 cursor-not-allowed",
        uploadError && "border-red-500/50 bg-red-50/10"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploadError ? (
          <FileX className="h-8 w-8 text-red-500" />
        ) : (
          <UploadCloud className="h-8 w-8 text-muted-foreground" />
        )}
        
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Enviando e processando arquivo...</span>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
          </div>
        ) : uploadError ? (
          <>
            <p className="text-sm text-red-500 font-medium">
              Ocorreu um erro no upload
            </p>
            <p className="text-xs text-red-500/80 max-w-[80%]">
              {uploadError}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation()
                setUploadError(null)
              }}
            >
              Tentar novamente
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Arraste e solte seu arquivo aqui, ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              Formatos suportados: CSV, XLS, XLSX
            </p>
            <p className="mt-2 text-xs text-primary">
              O arquivo será importado diretamente para o banco de dados.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tamanho máximo: 50MB
            </p>
          </>
        )}
      </div>
    </div>
  )
}
