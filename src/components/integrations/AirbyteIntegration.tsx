
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"

export function AirbyteIntegration() {
  const { currentOrganization } = useAuth()
  const [loading, setLoading] = useState(false)
  const [airbyte_username, setAirbyteUsername] = useState('airbyte_user')
  const [airbyte_password, setAirbytePassword] = useState('')
  const [connectionDetails, setConnectionDetails] = useState<any>(null)
  const { toast } = useToast()

  const setupAirbyteAccess = async () => {
    if (!currentOrganization) {
      toast({
        title: "Erro",
        description: "Nenhuma organização selecionada",
        variant: "destructive"
      })
      return
    }

    if (!airbyte_username || !airbyte_password) {
      toast({
        title: "Erro",
        description: "Nome de usuário e senha são obrigatórios",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      
      // Obter o schema_name das configurações da organização
      const schemaName = currentOrganization.settings?.schema_name
      
      if (!schemaName) {
        toast({
          title: "Erro",
          description: "Esquema da organização não encontrado",
          variant: "destructive"
        })
        return
      }
      
      // Chamar a função Edge para configurar o acesso
      const { data, error } = await supabase.functions.invoke('setup-airbyte-access', {
        body: {
          organizationId: currentOrganization.id,
          schemaName,
          airbyte_username,
          airbyte_password
        }
      })

      if (error) throw error
      
      if (data.success) {
        toast({
          title: "Sucesso",
          description: data.message
        })
        
        setConnectionDetails(data.connection_details)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error: any) {
      console.error("Erro ao configurar acesso Airbyte:", error)
      toast({
        title: "Erro",
        description: `Falha ao configurar acesso: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração do Airbyte</CardTitle>
        <CardDescription>
          Configure o acesso do Airbyte ao esquema 
          <code className="mx-1 px-1 py-0.5 bg-muted rounded">{currentOrganization?.settings?.schema_name}</code>
          para importar dados do Instagram
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="airbyte_username" className="text-sm font-medium">Nome de usuário do Airbyte</label>
          <Input
            id="airbyte_username"
            value={airbyte_username}
            onChange={(e) => setAirbyteUsername(e.target.value)}
            placeholder="Nome de usuário para o Airbyte"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="airbyte_password" className="text-sm font-medium">Senha do Airbyte</label>
          <Input
            id="airbyte_password"
            type="password"
            value={airbyte_password}
            onChange={(e) => setAirbytePassword(e.target.value)}
            placeholder="Senha segura para o Airbyte"
          />
        </div>
        
        {connectionDetails && (
          <div className="mt-4 p-4 border rounded bg-muted/30">
            <h4 className="font-medium mb-2">Detalhes de conexão para o Airbyte</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Host:</strong> {connectionDetails.host}</p>
              <p><strong>Porta:</strong> {connectionDetails.port}</p>
              <p><strong>Banco de dados:</strong> {connectionDetails.database}</p>
              <p><strong>Nome de usuário:</strong> {connectionDetails.username}</p>
              <p><strong>Schema:</strong> {connectionDetails.schema}</p>
              <p><strong>SSL Mode:</strong> {connectionDetails.ssl_mode}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={setupAirbyteAccess} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Configurando..." : "Configurar acesso para Airbyte"}
        </Button>
      </CardFooter>
    </Card>
  )
}
