import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Building, Loader2, Users, Briefcase, ArrowRight, Info } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useOrganization } from "@/hooks/useOrganization"

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState("")
  const [companySize, setCompanySize] = useState("")
  const { session } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createOrganization } = useOrganization()

  useEffect(() => {
    let mounted = true

    const checkExistingOrganization = async () => {
      if (!session?.user) {
        if (mounted) {
          setInitialLoading(false)
          navigate('/login')
        }
        return
      }

      try {
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (memberError) throw memberError

        if (memberData && mounted) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ onboarded: true })
            .eq('id', session.user.id)

          if (profileError) throw profileError

          navigate('/')
          return
        }
      } catch (error) {
        console.error('Error checking organization:', error)
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível verificar sua organização. Tente novamente.",
        })
      } finally {
        if (mounted) {
          setInitialLoading(false)
        }
      }
    }

    checkExistingOrganization()

    return () => {
      mounted = false
    }
  }, [session, navigate, toast])

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

  const nextStep = () => {
    if (!orgName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira o nome da organização",
      })
      return
    }
    setStep(2)
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-lg animate-fade-in">
        <Card className="p-8 space-y-8 shadow-lg backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-2 text-center">
            <Building className="w-16 h-16 mx-auto text-primary/80 animate-fade-in" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Bem-vindo ao SightX
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Vamos configurar sua organização para começar
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Briefcase className="w-5 h-5 text-primary/80" />
                  <h2 className="text-lg font-semibold">Sobre sua organização</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Estas informações ajudarão a personalizar sua experiência
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-gray-700 dark:text-gray-300">
                    Nome da organização
                  </Label>
                  <Input
                    id="orgName"
                    placeholder="Digite o nome da sua empresa"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    autoFocus
                  />
                </div>

                <Button 
                  onClick={nextStep}
                  className="w-full gap-2 bg-primary/90 hover:bg-primary"
                >
                  Próximo passo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="w-5 h-5 text-primary/80" />
                  <h2 className="text-lg font-semibold">Tamanho da equipe</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Isso nos ajudará a otimizar sua experiência
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companySize" className="text-gray-700 dark:text-gray-300">
                    Número de funcionários
                  </Label>
                  <select
                    id="companySize"
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="1-10">1-10 funcionários</option>
                    <option value="11-50">11-50 funcionários</option>
                    <option value="51-200">51-200 funcionários</option>
                    <option value="201-500">201-500 funcionários</option>
                    <option value="501+">501+ funcionários</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Você poderá convidar membros da equipe depois de criar sua organização
                  </span>
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-gray-200 dark:bg-gray-700" />

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
            >
              Cancelar
            </Button>
            {step === 2 && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="sm:w-[200px] gap-2 bg-primary/90 hover:bg-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Criar organização
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}