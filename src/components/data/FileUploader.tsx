
import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ImportStatus } from "@/types/data-imports"

interface FileUploaderProps {
  onUploadComplete: (fileId: string) => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return "Formato de arquivo não suportado. Por favor, use CSV ou Excel."
    }

    if (file.size > 10 * 1024 * 1024) {
      return "Arquivo muito grande. O tamanho máximo é 10MB."
    }

    return null
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }, [validateFile, toast])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const error = validateFile(file)
      if (error) {
        toast({
          title: "Erro",
          description: error,
          variant: "destructive"
        })
        return
      }
      setSelectedFile(file)
    }
  }, [validateFile, toast])

  const simulateProgress = useCallback(() => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 10
      if (progress > 95) {
        clearInterval(interval)
        progress = 95
      }
      setUploadProgress(Math.min(progress, 95))
    }, 200)
    return interval
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !currentOrganization) return

    try {
      setUploading(true)
      setUploadProgress(0)

      // Criar registro do import
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          name: selectedFile.name,
          original_filename: selectedFile.name,
          table_name: `data_${crypto.randomUUID().replace(/-/g, '_')}`,
          file_type: selectedFile.type,
          status: 'uploading' as ImportStatus,
          row_count: 0,
          data_quality: {},
          data_validation: {},
          columns_metadata: {},
          column_analysis: {}
        })
        .select()
        .single()

      if (importError) throw importError

      // Iniciar simulação de progresso
      const progressInterval = simulateProgress()

      // Upload do arquivo
      const filePath = `${currentOrganization.id}/${importData.id}/${selectedFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, selectedFile)

      if (uploadError) throw uploadError

      // Atualizar registro com caminho do arquivo
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'uploaded' as ImportStatus
        })
        .eq('id', importData.id)

      if (updateError) throw updateError

      // Limpar intervalo e completar progresso
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Notificar sucesso
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      })

      // Chamar callback
      onUploadComplete(importData.id)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setUploading(false)
      setSelectedFile(null)
      setUploadProgress(0)
    }
  }, [selectedFile, currentOrganization, simulateProgress, toast, onUploadComplete])

  const handleCancel = useCallback(() => {
    setSelectedFile(null)
    setUploadProgress(0)
  }, [])

  return (
    <Card className="relative p-8">
      <input
        type="file"
        className="hidden"
        accept=".csv,.xls,.xlsx"
        onChange={handleFileSelect}
        id="file-input"
      />

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20",
          selectedFile ? "bg-muted/50" : "hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {selectedFile ? (
            <>
              <div className="flex items-center space-x-4">
                <File className="h-8 w-8 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {uploading ? (
                <div className="w-full space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Enviando... {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar arquivo
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Arraste seu arquivo aqui</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ou clique para selecionar
                </p>
              </div>
              <label htmlFor="file-input">
                <Button variant="outline" className="mt-2">
                  Selecionar arquivo
                </Button>
              </label>
              <p className="text-xs text-muted-foreground mt-2">
                CSV ou Excel até 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
