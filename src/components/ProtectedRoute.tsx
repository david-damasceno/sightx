
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

interface ProtectedRouteProps {
  children: React.ReactNode
  checkOnboarding?: boolean
}

export function ProtectedRoute({ children, checkOnboarding = false }: ProtectedRouteProps) {
  const { session, loading, organizationLoading, profileLoading, currentOrganization, profile } = useAuth()
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const location = useLocation()

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function checkOnboardingStatus() {
      if (session?.user && checkOnboarding) {
        try {
          const signal = controller.signal
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarded')
            .eq('id', session.user.id)
            .maybeSingle()
            // A API atual do Supabase não suporta abortSignal diretamente desta forma
            // Removeremos esta linha problemática

          if (error) throw error
          if (mounted) setIsOnboarded(data?.onboarded ?? false)
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Erro ao verificar status de onboarding:', error)
            if (mounted) setIsOnboarded(false)
          }
        }
      } else {
        // Se não precisamos verificar onboarding, setamos como true para não bloquear
        if (mounted) setIsOnboarded(true)
      }
      if (mounted) setCheckingOnboarding(false)
    }

    checkOnboardingStatus()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [session, checkOnboarding])

  // Adicionando logs mais detalhados para debug
  console.log('ProtectedRoute state:', { 
    loading, 
    profileLoading, 
    organizationLoading, 
    checkingOnboarding,
    session: !!session,
    isOnboarded,
    profile: !!profile,
    path: location.pathname,
    hasOrg: !!currentOrganization,
    onboardingFlag: profile?.onboarded
  })

  // Estado de carregamento - mostra um indicador de progresso
  if (loading || (checkOnboarding && checkingOnboarding) || profileLoading || organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-gray-500">Carregando...</p>
      </div>
    )
  }

  // Se não estiver autenticado, redireciona para login com o caminho atual como estado
  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Verificação específica para a página de onboarding
  if (location.pathname === '/onboarding') {
    // Se já tiver uma organização, redireciona para home
    if (currentOrganization) {
      console.log('Usuário já tem organização, redirecionando para home')
      return <Navigate to="/" replace />
    }
    // Se estiver na página de onboarding, permitimos renderizar o conteúdo mesmo sem ter organização
    return <>{children}</>
  }

  // Se não tiver organização e não estiver na página de onboarding, redireciona para onboarding
  if (!currentOrganization && location.pathname !== '/onboarding') {
    console.log('Usuário não tem organização, redirecionando para onboarding')
    return <Navigate to="/onboarding" replace />
  }

  // Se chegou até aqui, é uma rota protegida normal que pode ser renderizada
  return <>{children}</>
}
