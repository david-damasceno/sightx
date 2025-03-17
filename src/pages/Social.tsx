
import { Card } from "@/components/ui/card"
import { Share2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { FacebookIntegration } from "@/components/integrations/FacebookIntegration"
import { Loader2 } from "lucide-react"

type Integration = Database['public']['Tables']['integrations']['Row']

export default function Social() {
  const { currentOrganization } = useAuth()
  const { toast } = useToast()
  const [postText, setPostText] = useState("")
  const [isPublishing, setIsPublishing] = useState(false)

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .eq('integration_type', 'facebook')
      
      if (error) throw error
      return data as Integration[]
    },
    enabled: !!currentOrganization?.id
  })

  const hasFacebookIntegration = integrations?.some(i => i.integration_type === 'facebook' && i.status === 'active')

  const handlePublish = async () => {
    if (!postText.trim()) {
      toast({
        title: "Erro",
        description: "O texto da publicação não pode estar vazio.",
        variant: "destructive"
      })
      return
    }

    setIsPublishing(true)

    try {
      // Aqui você enviaria o post para a API do Facebook
      // Usando o token de acesso armazenado na integração
      
      // Simulação de publicação bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Sucesso",
        description: "Sua publicação foi enviada para o Facebook.",
      })
      
      setPostText("")
    } catch (error) {
      console.error("Erro ao publicar no Facebook:", error)
      toast({
        title: "Erro na publicação",
        description: "Não foi possível publicar no Facebook. Tente novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Análise de Redes Sociais</h1>
        </div>
        
        {isLoading ? (
          <Card className="p-4 md:p-6">
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          </Card>
        ) : hasFacebookIntegration ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-4 md:p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Publicar no Facebook</h2>
                <Textarea 
                  placeholder="O que você gostaria de compartilhar?" 
                  className="min-h-[120px]"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handlePublish}
                    disabled={isPublishing || !postText.trim()}
                  >
                    {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publicar
                  </Button>
                </div>
              </div>
            </Card>
            
            <Card className="p-4 md:p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-medium">Análise de Engajamento</h2>
                <p className="text-muted-foreground">
                  A análise detalhada de engajamento estará disponível em breve.
                </p>
                <div className="bg-muted rounded-md p-4 flex justify-center items-center h-[200px]">
                  <p className="text-center text-muted-foreground">
                    Dados de engajamento serão exibidos aqui
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-4 md:p-6">
            <div className="flex flex-col items-center justify-center h-[300px] md:h-[400px] space-y-4">
              <p className="text-muted-foreground text-center">
                Conecte sua conta do Facebook para habilitar análise de redes sociais
              </p>
              <FacebookIntegration />
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
