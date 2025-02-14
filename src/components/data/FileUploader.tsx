
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface FileUploaderProps {
  onUploadComplete: (fileId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Arquivo não suportado",
        description: "Por favor, faça upload de arquivos CSV ou Excel.",
        variant: "destructive"
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive"
      })
      return
    }

    setSelectedFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !currentOrganization) return

    try {
      setUploading(true)

      // Criar FormData com o arquivo e organizationId
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('organizationId', currentOrganization.id)

      // Chamar a edge function para analisar o arquivo
      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: formData,
      })

      if (error) throw error

      console.log('Resultado da análise:', data)

      if (!data?.file_id) {
        throw new Error('ID do arquivo não retornado pela análise')
      }

      toast({
        title: "Upload concluído",
        description: "Seu arquivo foi enviado com sucesso.",
      })

      onUploadComplete(data.file_id)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <Card className={cn(
      "border-2 border-dashed p-8 text-center transition-colors",
      isDragging ? "border-primary bg-primary/5" : "border-muted",
      "hover:border-primary/50"
    )}>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileSelect}
        accept=".csv,.xlsx,.xls"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="space-y-6"
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <File className="h-6 w-6" />
              {selectedFile.name}
              <button
                onClick={removeFile}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <Button 
              onClick={handleUpload}
              disabled={uploading}
              className="w-full max-w-xs"
            >
              {uploading ? "Enviando..." : "Iniciar Upload"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                Arraste e solte seu arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground">
                ou clique para selecionar
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Selecionar Arquivo
            </Button>

            <p className="text-xs text-muted-foreground">
              CSV, Excel até 10MB
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
