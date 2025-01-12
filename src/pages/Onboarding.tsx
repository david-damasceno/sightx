import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Building, Loader2, Users, Briefcase } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useOrganization } from "@/hooks/useOrganization"

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [orgName, setOrgName] = useState("")
  const [companySize, setCompanySize] = useState("")
  const { session } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createOrganization } = useOrganization()

  const ensureProfileExists = async () => {
    if (!session?.user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          updated_at: new Date().toISOString(),
          onboarded: false
        })

      if (createError) {
        console.error('Error creating profile:', createError)
        return false
      }
    }

    return true
  }

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

      const profileExists = await ensureProfileExists()
      if (!profileExists) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível criar seu perfil. Tente novamente.",
        })
        return
      }

      const org = await createOrganization(orgName.trim())

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          default_organization_id: org.id,
          onboarded: true,
          company: orgName.trim(),
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
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <Card className="p-6 space-y-8">
          <div className="space-y-2 text-center">
            <Building className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">Bem-vindo ao SightX</h1>
            <p className="text-lg text-muted-foreground">
              Vamos configurar sua organização para começar
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2 col-span-full">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Sobre sua organização</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Estas informações ajudarão a personalizar sua experiência
              </p>
            </div>

            <div className="col-span-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nome da organização</Label>
                <Input
                  id="orgName"
                  placeholder="Digite o nome da sua empresa"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize">Tamanho da empresa</Label>
                <select
                  id="companySize"
                  className="w-full px-3 py-2 border rounded-md"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecione...</option>
                  <option value="1-10">1-10 funcionários</option>
                  <option value="11-50">11-50 funcionários</option>
                  <option value="51-200">51-200 funcionários</option>
                  <option value="201-500">201-500 funcionários</option>
                  <option value="501+">501+ funcionários</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Você poderá convidar membros da equipe depois de criar sua organização
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="sm:w-[200px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar organização"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}