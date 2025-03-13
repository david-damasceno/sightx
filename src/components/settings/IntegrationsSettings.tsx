
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { AlertCircle, CheckCircle2, XCircle, Loader2, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type Integration = Database['public']['Tables']['integrations']['Row']
type IntegrationType = Database['public']['Enums']['integration_type']

export function IntegrationsSettings() {
  const { toast } = useToast()
  const { currentOrganization } = useAuth()
  const [isConnecting, setIsConnecting] = useState<IntegrationType | null>(null)

  const { data: integrations, isLoading, refetch } = useQuery({
    queryKey: ['integrations', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization?.id) {
        throw new Error('Organização não selecionada')
      }
      
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
      
      if (error) throw error
      return data as Integration[]
    },
    enabled: !!currentOrganization?.id
  })

  const handleConnect = async (type: IntegrationType) => {
    try {
      setIsConnecting(type)
      
      if (!currentOrganization?.id) {
        throw new Error('Organização não selecionada')
      }

      // Verificar se já existe uma integração pendente
      const existingIntegration = integrations?.find(i => 
        i.integration_type === type && i.status === 'pending'
      )
      
      if (existingIntegration) {
        // Se já existe uma integração pendente, use-a
        initiateOAuthFlow(type, existingIntegration.id, currentOrganization.id)
        return
      }

      // Criar registro de integração
      const { data: integration, error: integrationError } = await supabase
        .from('integrations')
        .insert({
          organization_id: currentOrganization.id,
          integration_type: type,
          status: 'pending'
        })
        .select()
        .single()

      if (integrationError) throw integrationError
      
      // Iniciar fluxo OAuth com o ID da integração criada
      initiateOAuthFlow(type, integration.id, currentOrganization.id)
    } catch (error) {
      console.error('Error starting integration:', error)
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a integração. Tente novamente mais tarde.",
        variant: "destructive"
      })
      setIsConnecting(null)
    }
  }
  
  const initiateOAuthFlow = (type: IntegrationType, integrationId: string, organizationId: string) => {
    // Parâmetros OAuth comuns sanitizados
    const state = `${integrationId}|${organizationId}`
    
    // Construir URL de redirecionamento para callback seguro
    const redirectUri = `${window.location.origin}/settings/integrations/callback`
    
    // Configurar parâmetros específicos por tipo de integração
    switch (type) {
      case 'google_business':
        // Informações da API do Google Business Profile
        const clientId = 'YOUR_GOOGLE_CLIENT_ID' // Substituir pelo cliente real
        const scope = 'https://www.googleapis.com/auth/business.manage'
        
        // Construir URL de autorização
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope,
          state,
          access_type: 'offline',
          prompt: 'consent'
        })}`
        
        // Redirecionar para página de autorização do Google
        window.location.href = authUrl
        break
        
      case 'google_analytics':
        // Configuração para Google Analytics
        const gaClientId = 'YOUR_GA_CLIENT_ID'
        const gaScope = 'https://www.googleapis.com/auth/analytics.readonly'
        
        const gaAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: gaClientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: gaScope,
          state,
          access_type: 'offline',
          prompt: 'consent'
        })}`
        
        window.location.href = gaAuthUrl
        break
        
      case 'slack':
        // Configuração para Slack
        const slackClientId = 'YOUR_SLACK_CLIENT_ID'
        const slackScope = 'chat:write,channels:read'
        
        const slackAuthUrl = `https://slack.com/oauth/v2/authorize?${new URLSearchParams({
          client_id: slackClientId,
          redirect_uri: redirectUri,
          scope: slackScope,
          state,
          user_scope: ''
        })}`
        
        window.location.href = slackAuthUrl
        break
        
      default:
        throw new Error(`Tipo de integração não suportado: ${type}`)
    }
    
    toast({
      title: "Iniciando integração",
      description: "Você será redirecionado para autorizar o acesso.",
    })
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
      
      <Alert>
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Segurança de dados</AlertTitle>
        <AlertDescription>
          Ao conectar serviços externos, você concede permissões de acesso aos dados. 
          Revisamos cuidadosamente cada integração, mas recomendamos verificar as permissões solicitadas.
        </AlertDescription>
      </Alert>

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
                  disabled={isConnecting === 'google_business'}
                >
                  {isConnecting === 'google_business' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conectando...
                    </>
                  ) : 'Conectar'}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Google Analytics */}
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

            <Button 
              variant="outline"
              onClick={() => handleConnect('google_analytics')}
              disabled={isConnecting === 'google_analytics'}
            >
              {isConnecting === 'google_analytics' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : 'Conectar'}
            </Button>
          </div>
        </Card>

        {/* Slack */}
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

            <Button 
              variant="outline"
              onClick={() => handleConnect('slack')}
              disabled={isConnecting === 'slack'}
            >
              {isConnecting === 'slack' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Conectando...
                </>
              ) : 'Conectar'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
