import { useState } from "react"
import { Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useOrganization } from "@/hooks/useOrganization"

export function FileUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const { organization } = useOrganization()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !organization) return

    try {
      setIsUploading(true)

      // Upload arquivo para o storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${organization.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('data-files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Criar registro na tabela data_files
      const { error: dbError } = await supabase
        .from('data_files')
        .insert({
          organization_id: organization.id,
          file_name: file.name,
          file_path: filePath,
          file_type: fileExt?.toLowerCase(),
          file_size: file.size,
          content_type: file.type,
        })

      if (dbError) throw dbError

      toast({
        title: "Arquivo enviado com sucesso",
        description: "O arquivo será processado em breve para análise.",
      })

    } catch (error) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-muted">
      <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
      <p className="mb-2 text-sm text-muted-foreground">
        Arraste arquivos ou clique para fazer upload
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Suporta arquivos CSV, Excel, Access e JSON
      </p>
      <Button disabled={isUploading} className="relative">
        {isUploading ? "Enviando..." : "Selecionar arquivo"}
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".csv,.xlsx,.xls,.mdb,.accdb,.json"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
      </Button>
    </div>
  )
}