import { useState, useRef } from "react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleDrop = (e: React.DragEvent) => {
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

      // Criar entrada no banco de dados
      const { data: fileMetadata, error: dbError } = await supabase
        .from('data_files_metadata')
        .insert({
          organization_id: currentOrganization.id,
          file_name: selectedFile.name,
          original_filename: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          status: 'uploading'
        })
        .select()
        .single()

      if (dbError) throw dbError

      // Iniciar análise do arquivo
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('organizationId', currentOrganization.id)

      const response = await fetch('/api/analyze-file', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro ao analisar arquivo')
      }

      const analysisResult = await response.json()

      // Atualizar metadados com resultado da análise
      const { error: updateError } = await supabase
        .from('data_files_metadata')
        .update({
          status: 'ready',
          columns_metadata: analysisResult.columns,
          preview_data: analysisResult.previewData
        })
        .eq('id', fileMetadata.id)

      if (updateError) throw updateError

      toast({
        title: "Upload concluído",
        description: "Seu arquivo foi enviado com sucesso.",
      })

      onUploadComplete(fileMetadata.id)
    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card className={cn(
      "border-2 border-dashed p-8 text-center transition-colors",
      isDragging ? "border-primary bg-primary/5" : "border-muted",
      "hover:border-primary/50"
    )}>
      <input
        ref={fileInputRef}
        type="file"
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
              onClick={() => fileInputRef.current?.click()}
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
