import { useState } from "react"
import { Upload, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

export function FileUploader({ onUploadSuccess }: { onUploadSuccess: (fileData: any) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentOrganization) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('organizationId', currentOrganization.id)

      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: formData,
      })

      if (error) throw error

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
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted">
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
          <FileText className="w-12 h-12 text-muted-foreground animate-pulse" />
        ) : (
          <Upload className="w-12 h-12 text-muted-foreground" />
        )}
        <Button variant="outline" disabled={isUploading}>
          {isUploading ? "Analisando..." : "Selecionar arquivo"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Arquivos suportados: CSV, Excel (.xlsx, .xls)
        </p>
      </label>
    </div>
  )
}