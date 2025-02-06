
import { useState } from "react"
import { Upload, FileText, X } from "lucide-react"
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
  const { currentOrganization } = useAuth()

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
    if (!currentOrganization) return

    setIsUploading(true)
    const progressInterval = simulateProgress()

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('organizationId', currentOrganization.id)

      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: formData,
      })

      if (error) throw error

      setUploadProgress(100)
      toast({
        title: "Arquivo analisado com sucesso",
        description: "Agora você pode contextualizar os dados.",
      })

      onUploadSuccess(data)
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Erro ao analisar arquivo",
        description: "Não foi possível processar o arquivo. Tente novamente.",
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
