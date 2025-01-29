import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

type Integration = Database['public']['Tables']['integrations']['Row']

export function IntegrationsSettings() {
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations', currentOrganization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
      
      if (error) throw error
      return data as Integration[]
    },
    enabled: !!currentOrganization?.id
  })

  const handleConnect = async (type: string) => {
    toast({
      title: "Iniciando integração",
      description: "Você será redirecionado para autorizar o acesso.",
    })
    // TODO: Implementar fluxo de OAuth
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Conectado'
      case 'error':
        return 'Erro'
      case 'pending':
        return 'Pendente'
      default:
        return 'Desconectado'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Conecte sua conta com serviços externos
          </p>
        </div>
        <Card className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integrações</h2>
        <p className="text-sm text-muted-foreground">
          Conecte sua conta com serviços externos
        </p>
      </div>

      <div className="space-y-4">
        {/* Google Business Profile */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img 
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                  alt="Google Business Profile" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="font-medium">Google Business Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações comerciais no Google
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {integrations?.find(i => i.integration_type === 'google_business') ? (
                <div className="flex items-center gap-2">
                  {getStatusIcon(integrations.find(i => i.integration_type === 'google_business')?.status || 'disconnected')}
                  <span className="text-sm">
                    {getStatusText(integrations.find(i => i.integration_type === 'google_business')?.status || 'disconnected')}
                  </span>
                </div>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => handleConnect('google_business')}
                >
                  Conectar
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Outros serviços podem ser adicionados aqui */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img 
                  src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                  alt="Google Analytics" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="font-medium">Google Analytics</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o tráfego e comportamento dos usuários
                </p>
              </div>
            </div>

            <Button variant="outline">Conectar</Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img 
                  src="https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" 
                  alt="Slack" 
                  className="h-6 w-6"
                />
              </div>
              <div>
                <h3 className="font-medium">Slack</h3>
                <p className="text-sm text-muted-foreground">
                  Receba notificações e atualizações nos seus canais
                </p>
              </div>
            </div>

            <Button variant="outline">Conectar</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}