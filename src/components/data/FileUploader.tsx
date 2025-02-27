
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      // Criar registro do import
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          created_by: user.id,
          name: file.name,
          original_filename: file.name,
          file_type: file.type,
          status: 'pending',
          context: '',
          columns_metadata: {},
          column_analysis: {},
          data_quality: {},
          data_validation: {},
          table_name: file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, "_")
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
          status: 'uploaded'
        })
        .eq('id', importData.id)

      if (updateError) throw updateError

      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso",
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
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span>Enviando arquivo...</span>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Arraste e solte seu arquivo aqui, ou clique para selecionar
            </p>
            <p className="text-xs text-muted-foreground">
              CSV, XLS, XLSX
            </p>
          </>
        )}
      </div>
    </div>
  )
}
