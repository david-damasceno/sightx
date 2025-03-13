
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { useTranslation } from "react-i18next"

export function SecuritySettings() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [ipWhitelisting, setIpWhitelisting] = useState(false)
  const [auditLogging, setAuditLogging] = useState(true)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  
  // Função utilitária para sanitizar entradas
  const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>&"']/g, '');
  }
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para salvar configurações de segurança.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    
    try {
      // Sanitizar dados
      const sanitizedApiKey = sanitizeInput(apiKey)
      
      // Verificar se o usuário está logado
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        throw new Error("Sessão expirada. Faça login novamente.")
      }
      
      // Atualizar configurações na tabela de perfis
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            security: {
              ipWhitelisting,
              auditLogging,
              twoFactorAuth,
              apiKeySet: !!sanitizedApiKey
            }
          }
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de segurança foram atualizadas com sucesso.",
        variant: "success",
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
        <h2 className="text-lg font-medium">Segurança</h2>
        <p className="text-sm text-muted-foreground">
          Gerencie configurações de segurança e controles de acesso
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Chave de API</Label>
          <Input 
            id="apiKey"
            type="password" 
            placeholder="Insira a chave de API" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            aria-describedby="apiKeyHint"
          />
          <p id="apiKeyHint" className="text-xs text-muted-foreground">
            Nunca compartilhe suas chaves de API. As chaves são armazenadas de forma segura.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ipWhitelist">Lista de IPs permitidos</Label>
            <p className="text-sm text-muted-foreground">
              Restringir acesso a endereços IP específicos
            </p>
          </div>
          <Switch 
            id="ipWhitelist"
            checked={ipWhitelisting}
            onCheckedChange={setIpWhitelisting}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auditLog">Registro de Auditoria</Label>
            <p className="text-sm text-muted-foreground">
              Monitorar todas as atividades do sistema
            </p>
          </div>
          <Switch 
            id="auditLog"
            checked={auditLogging}
            onCheckedChange={setAuditLogging}
            defaultChecked 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="twoFactor">Autenticação de Dois Fatores (2FA)</Label>
            <p className="text-sm text-muted-foreground">
              Exigir verificação adicional ao fazer login
            </p>
          </div>
          <Switch 
            id="twoFactor"
            checked={twoFactorAuth}
            onCheckedChange={setTwoFactorAuth}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </div>
  )
}
