
import { useState } from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Progress } from "@/components/ui/progress"

export function FileUploader({ onUploadSuccess }: { onUploadSuccess: (fileData: any) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()
  const { currentOrganization, user } = useAuth()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const simulateProgress = () => {
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 100)
    return interval
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer?.files?.[0]
    if (file) await processFile(file)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await processFile(file)
  }

  const processFile = async (file: File) => {
    if (!currentOrganization || !user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado e ter uma organização selecionada",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    const progressInterval = simulateProgress()

    try {
      console.log('Iniciando upload do arquivo:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        organizationId: currentOrganization.id,
        userId: user.id
      })

      // Primeiro, criar o registro na tabela data_imports
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          created_by: user.id,
          name: file.name,
          original_filename: file.name,
          file_type: file.type,
          status: 'pending',
          columns_metadata: {},
          column_analysis: {},
          data_quality: {},
          data_validation: {},
          table_name: file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, "_")
        })
        .select()
        .single()

      if (importError) {
        console.error('Erro ao criar registro de importação:', importError)
        throw importError
      }

      console.log('Registro de importação criado:', importData)

      // Upload do arquivo para o storage
      const filePath = `${currentOrganization.id}/${importData.id}/${file.name}`
      console.log('Iniciando upload para storage, caminho:', filePath)

      const { error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Erro no upload do arquivo:', uploadError)
        throw uploadError
      }

      console.log('Upload para storage concluído')

      // Atualizar o registro com o caminho do arquivo
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'uploaded'
        })
        .eq('id', importData.id)

      if (updateError) {
        console.error('Erro ao atualizar registro:', updateError)
        throw updateError
      }

      console.log('Registro atualizado com sucesso')

      // Iniciar o processamento do arquivo
      const { error: analyzeError } = await supabase.functions.invoke('analyze-file', {
        body: { fileId: importData.id }
      })

      if (analyzeError) {
        console.error('Erro ao analisar arquivo:', analyzeError)
        throw analyzeError
      }

      console.log('Arquivo processado com sucesso')
      
      setUploadProgress(100)
      toast({
        title: "Arquivo enviado com sucesso",
        description: "Agora você pode contextualizar os dados.",
      })

      onUploadSuccess(importData)
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro ao analisar arquivo",
        description: error.message || "Não foi possível processar o arquivo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
        dragActive
          ? "border-primary bg-primary/10"
          : "border-muted hover:border-primary/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center gap-2 cursor-pointer"
      >
        {isUploading ? (
          <>
            <FileText className="w-12 h-12 text-muted-foreground animate-pulse" />
            <Progress value={uploadProgress} className="w-[200px] h-2" />
            <p className="text-sm text-muted-foreground">
              Analisando arquivo...
            </p>
          </>
        ) : (
          <>
            <Upload className="w-12 h-12 text-muted-foreground animate-bounce" />
            <Button variant="outline" className="relative">
              Selecionar arquivo
              <span className="absolute -top-1 -right-1 text-[10px] text-muted-foreground">
                ou arraste aqui
              </span>
            </Button>
            <p className="text-sm text-muted-foreground">
              Arquivos suportados: CSV, Excel (.xlsx, .xls)
            </p>
          </>
        )}
      </label>
    </div>
  )
}
