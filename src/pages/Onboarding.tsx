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

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [orgName, setOrgName] = useState("")
  const { session } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

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

      // Criar a organização
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName.trim(),
          slug: orgName.trim().toLowerCase().replace(/\s+/g, '-'),
          status: 'active'
        })
        .select()
        .single()

      if (orgError) throw orgError

      // Adicionar o usuário como membro (owner) da organização
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: session?.user.id,
          role: 'owner'
        })

      if (memberError) throw memberError

      // Atualizar o perfil do usuário
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

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Criando..." : "Criar organização"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}