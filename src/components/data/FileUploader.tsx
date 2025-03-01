
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { UploadCloud, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

interface FileUploaderProps {
  onUploadComplete: (fileId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
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
    setUploading(true)

    try {
      // Gerar nome de tabela único baseado no nome do arquivo
      const tableName = `data_${file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")}_${Date.now().toString().slice(-6)}`

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
          columns_metadata: {},
          column_analysis: {},
          data_quality: {},
          data_validation: {},
          table_name: tableName
        })
        .select()
        .single()

      if (importError) throw importError

      // Upload do arquivo
      const filePath = `${currentOrganization.id}/${importData.id}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Atualizar storage_path e status
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'processing'
        })
        .eq('id', importData.id)

      if (updateError) throw updateError

      // Iniciar processamento do arquivo para criar tabela
      const { error: processingError } = await supabase.functions.invoke('process-file-upload', {
        body: { 
          fileId: importData.id,
          organizationId: currentOrganization.id 
        }
      })

      if (processingError) throw processingError

      toast({
        title: "Sucesso",
        description: "Arquivo enviado e processamento iniciado",
      })

      onUploadComplete(importData.id)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }, [currentOrganization, user, toast, onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
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
        uploading && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        {uploading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando e processando arquivo...</span>
          </div>
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
          </>
        )}
      </div>
    </div>
  )
}
