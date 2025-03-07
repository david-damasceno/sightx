
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Building, Loader2, Users, Briefcase, ArrowRight, Info, MapPin } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useOrganization } from "@/hooks/useOrganization"

type OnboardingStep = 1 | 2 | 3

export default function Onboarding() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [step, setStep] = useState<OnboardingStep>(1)
  const [orgName, setOrgName] = useState("")
  const [sector, setSector] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [description, setDescription] = useState("")
  const [companySize, setCompanySize] = useState("")
  const { session, currentOrganization, setCurrentOrganization } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { createOrganization } = useOrganization()

  // Verificar se já existe uma organização e redirecionar se necessário
  useEffect(() => {
    let mounted = true
    
    // Função para verificar redirecionamento
    const checkRedirection = () => {
      if (currentOrganization && mounted) {
        console.log("Usuário já tem organização, redirecionando para home")
        navigate('/')
        return true
      }

      if (!session?.user && mounted) {
        console.log("Usuário não autenticado, redirecionando para login")
        navigate('/login')
        return true
      }
      
      return false
    }
    
    // Verifica agora
    if (!checkRedirection() && mounted) {
      setInitialLoading(false)
    }
    
    return () => {
      mounted = false
    }
  }, [session, currentOrganization, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      console.log("Criando organização:", {
        orgName,
        sector,
        city,
        state,
        description
      })

      const org = await createOrganization(
        orgName.trim(),
        sector.trim(),
        city.trim(),
        state.trim(),
        description.trim()
      )

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

      // Atualizar o contexto de autenticação com a nova organização
      if (setCurrentOrganization) {
        setCurrentOrganization(org)
      }

      toast({
        title: "Sucesso!",
        description: "Sua organização foi criada com sucesso.",
      })

      // Redireciona imediatamente para a página inicial
      navigate('/', { replace: true })
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

  const validateForm = (): boolean => {
    if (!orgName.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira o nome da organização",
      })
      return false
    }

    if (step >= 2 && !sector.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione o setor de atuação",
      })
      return false
    }

    if (step >= 3 && !city.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe a cidade",
      })
      return false
    }

    if (step >= 3 && !state.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe o estado",
      })
      return false
    }

    return true
  }

  const handleCancel = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nextStep = () => {
    if (!validateForm()) return
    setStep(prev => (prev < 3 ? (prev + 1) as OnboardingStep : prev))
  }

  const previousStep = () => {
    setStep(prev => (prev > 1 ? (prev - 1) as OnboardingStep : prev))
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Resto do componente permanece o mesmo
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

          <div className="flex justify-center space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full ${
                  s === step
                    ? "bg-primary"
                    : s < step
                    ? "bg-gray-400"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {step === 1 && (
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
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building className="w-5 h-5 text-primary/80" />
                  <h2 className="text-lg font-semibold">Setor e descrição</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conte-nos mais sobre o que sua empresa faz
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sector" className="text-gray-700 dark:text-gray-300">
                    Setor de atuação
                  </Label>
                  <select
                    id="sector"
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="technology">Tecnologia</option>
                    <option value="retail">Varejo</option>
                    <option value="manufacturing">Indústria</option>
                    <option value="services">Serviços</option>
                    <option value="healthcare">Saúde</option>
                    <option value="education">Educação</option>
                    <option value="finance">Finanças</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Descrição da empresa
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva brevemente o que sua empresa faz..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 min-h-[100px]"
                  />
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Voltar
                  </Button>
                  <Button 
                    onClick={nextStep}
                    className="gap-2 bg-primary/90 hover:bg-primary"
                  >
                    Próximo passo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-primary/80" />
                  <h2 className="text-lg font-semibold">Localização</h2>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Onde sua empresa está localizada?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                    Cidade
                  </Label>
                  <Input
                    id="city"
                    placeholder="Digite a cidade"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">
                    Estado
                  </Label>
                  <Input
                    id="state"
                    placeholder="Digite o estado"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  />
                </div>

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
            {step === 3 && (
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
