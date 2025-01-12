import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Building } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useOrganization } from "@/hooks/useOrganization"

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [orgName, setOrgName] = useState("")
  const { session } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createOrganization } = useOrganization()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira o nome da organização",
      })
      return
    }

    try {
      setLoading(true)
      const org = await createOrganization(orgName.trim())

      // Atualizar o perfil do usuário com a organização padrão
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          default_organization_id: org.id,
          onboarded: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session?.user.id)

      if (profileError) throw profileError

      toast({
        title: "Sucesso!",
        description: "Sua organização foi criada com sucesso.",
      })

      navigate('/')
    } catch (error: any) {
      console.error('Erro ao criar organização:', error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível criar a organização. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    // Fazer logout e redirecionar para a página de login
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <Building className="w-12 h-12 mx-auto text-primary" />
            <h1 className="text-2xl font-bold">Bem-vindo ao SightX</h1>
            <p className="text-sm text-muted-foreground">
              Para começar, crie sua organização
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nome da organização</Label>
              <Input
                id="orgName"
                placeholder="Digite o nome da sua organização"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Criando..." : "Criar organização"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}