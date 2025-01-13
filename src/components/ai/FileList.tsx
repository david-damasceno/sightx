import { useQuery } from "@tanstack/react-query"
import { FileText, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useOrganization } from "@/hooks/useOrganization"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function FileList() {
  const { organization } = useOrganization()

  const { data: files, isLoading } = useQuery({
    queryKey: ['data-files', organization?.id],
    queryFn: async () => {
      if (!organization) return []
      const { data, error } = await supabase
        .from('data_files')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    enabled: !!organization,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!files?.length) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum arquivo enviado ainda
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <Card key={file.id} className="p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.file_name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(file.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Status: {file.status}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}