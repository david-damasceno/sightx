import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { FacebookIntegration } from "./FacebookIntegration"

type Integration = Database['public']['Tables']['integrations']['Row']

export function IntegrationsPanel() {
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
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium">Integrações</h2>
          <p className="text-sm text-muted-foreground">
            Conecte sua conta com serviços externos
          </p>
        </div>

        <div className="space-y-4">
          {/* Facebook */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1877F2" className="h-6 w-6">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Facebook</h3>
                <p className="text-sm text-muted-foreground">
                  Integre suas páginas comerciais e anúncios
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {integrations?.find(i => i.integration_type === 'facebook') ? (
                <div className="flex items-center gap-2">
                  {getStatusIcon(integrations.find(i => i.integration_type === 'facebook')?.status || 'disconnected')}
                  <span className="text-sm">
                    {getStatusText(integrations.find(i => i.integration_type === 'facebook')?.status || 'disconnected')}
                  </span>
                </div>
              ) : (
                <FacebookIntegration />
              )}
            </div>
          </div>

          {/* Google Business Profile */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
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
        </div>
      </div>
    </Card>
  )
}
