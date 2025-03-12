
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AcceptInvite() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteDetails, setInviteDetails] = useState<{
    organizationName: string;
    email: string;
    role: string;
  } | null>(null)
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted'>('loading')

  const token = searchParams.get('token')

  useEffect(() => {
    const checkInvite = async () => {
      if (!token) {
        setError("Link de convite inválido. Nenhum token fornecido.")
        setStatus('invalid')
        setLoading(false)
        return
      }

      try {
        // Verificar se o convite existe e está válido
        const { data: invite, error: inviteError } = await supabase
          .from('organization_invites')
          .select('*, organizations(name)')
          .eq('token', token)
          .single()

        if (inviteError || !invite) {
          setError("Este convite não existe ou já expirou.")
          setStatus('invalid')
          setLoading(false)
          return
        }

        // Verificar se o convite já foi aceito
        if (invite.status === 'accepted') {
          setStatus('accepted')
          setLoading(false)
          return
        }

        // Verificar se o convite expirou
        const expiresAt = new Date(invite.expires_at)
        if (expiresAt < new Date()) {
          setError("Este convite expirou.")
          setStatus('invalid')
          setLoading(false)
          return
        }

        // Tudo certo, mostrar detalhes do convite
        setInviteDetails({
          organizationName: invite.organizations?.name || "Organização",
          email: invite.email,
          role: invite.role
        })
        setStatus('valid')
        setLoading(false)
      } catch (err) {
        console.error("Erro ao verificar convite:", err)
        setError("Ocorreu um erro ao verificar o convite.")
        setStatus('invalid')
        setLoading(false)
      }
    }

    checkInvite()
  }, [token])

  const handleAcceptInvite = async () => {
    if (!token || !user) return
    
    setLoading(true)
    
    try {
      const response = await supabase.functions.invoke('accept-invite', {
        body: { token, userId: user.id }
      })
      
      if (response.error) throw new Error(response.error.message)
      
      toast({
        title: "Convite aceito com sucesso",
        description: "Você agora é membro da organização",
      })
      
      setStatus('accepted')
      
      // Navegar para o dashboard após 2 segundos
      setTimeout(() => {
        navigate('/settings/members')
      }, 2000)
    } catch (err: any) {
      console.error("Erro ao aceitar convite:", err)
      toast({
        title: "Erro ao aceitar convite",
        description: err.message || "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const handleSignIn = () => {
    navigate(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${token}`)}`)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-center text-muted-foreground">Verificando o convite...</p>
        </div>
      )
    }

    if (status === 'invalid') {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Convite Inválido</h3>
          <p className="text-center text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Voltar para Início
          </Button>
        </div>
      )
    }

    if (status === 'accepted') {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Convite Aceito</h3>
          <p className="text-center text-muted-foreground mb-4">
            Você agora é membro da organização {inviteDetails?.organizationName}.
          </p>
          <Button onClick={() => navigate('/settings/members')}>
            Ir para Configurações
          </Button>
        </div>
      )
    }

    // Valid status
    return (
      <>
        <CardHeader>
          <CardTitle>Convite para Organização</CardTitle>
          <CardDescription>
            Você foi convidado para se juntar à organização {inviteDetails?.organizationName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Organização:</p>
            <p className="text-base">{inviteDetails?.organizationName}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Email:</p>
            <p className="text-base">{inviteDetails?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Função:</p>
            <p className="text-base capitalize">
              {inviteDetails?.role === 'owner' ? 'Proprietário' : 
               inviteDetails?.role === 'admin' ? 'Administrador' : 'Membro'}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {!user ? (
            <>
              <Button variant="outline" onClick={() => navigate('/')}>
                Rejeitar
              </Button>
              <Button onClick={handleSignIn}>
                Entrar para Aceitar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/')}>
                Rejeitar
              </Button>
              <Button onClick={handleAcceptInvite} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Aceitar Convite"
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        {renderContent()}
      </Card>
    </div>
  )
}
