
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function UsersSettings() {
  const { addToast, toast } = useToast()
  const { user, currentOrganization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [passwordExpiration, setPasswordExpiration] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(true)
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(true)
  
  const handleSave = async () => {
    if (!user || !currentOrganization) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado e ter uma organização para salvar configurações de usuários.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Verificar permissões do usuário
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', user.id)
        .single()
      
      if (memberError) throw memberError
      
      // Verificar se o usuário é administrador ou proprietário
      if (memberData.role !== 'owner' && memberData.role !== 'admin') {
        throw new Error("Você não tem permissão para alterar estas configurações")
      }
      
      // Verificar se settings já existe na organização
      const currentOrgSettings = currentOrganization.settings || {};
      
      // Tipagem segura para o objeto de configurações
      const securitySettings = {
        twoFactorEnabled,
        passwordExpiration,
        sessionTimeout,
        maxLoginAttempts
      };
      
      // Atualizar configurações da organização
      const { error } = await supabase
        .from('organizations')
        .update({
          settings: {
            ...currentOrgSettings,
            security: securitySettings
          }
        })
        .eq('id', currentOrganization.id)
      
      if (error) throw error
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de usuários foram atualizadas com sucesso.",
        variant: "default",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Usuários e Permissões</h2>
        <p className="text-sm text-muted-foreground">
          Gerenciar acesso de usuários e configurações de segurança
        </p>
      </div>

      <Alert variant="default">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Estas configurações afetam todos os usuários da sua organização. Algumas alterações podem exigir que os usuários façam login novamente.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="twoFactorAuth">Autenticação de Dois Fatores (2FA)</Label>
            <p className="text-sm text-muted-foreground">
              Exigir 2FA para todas as contas de usuário
            </p>
          </div>
          <Switch 
            id="twoFactorAuth"
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
            defaultChecked 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="passwordExpiration">Expiração de Senha</Label>
            <p className="text-sm text-muted-foreground">
              Exigir alteração de senha a cada 90 dias
            </p>
          </div>
          <Switch 
            id="passwordExpiration"
            checked={passwordExpiration}
            onCheckedChange={setPasswordExpiration}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sessionTimeout">Timeout de Sessão</Label>
            <p className="text-sm text-muted-foreground">
              Desconectar automaticamente usuários inativos após 30 minutos
            </p>
          </div>
          <Switch 
            id="sessionTimeout"
            checked={sessionTimeout}
            onCheckedChange={setSessionTimeout}
            defaultChecked 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="maxLoginAttempts">Limitar Tentativas de Login</Label>
            <p className="text-sm text-muted-foreground">
              Bloquear acesso após 5 tentativas de login malsucedidas
            </p>
          </div>
          <Switch 
            id="maxLoginAttempts"
            checked={maxLoginAttempts}
            onCheckedChange={setMaxLoginAttempts}
            defaultChecked
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  )
}
