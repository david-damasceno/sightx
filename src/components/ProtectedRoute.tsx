
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

    async function checkOnboardingStatus() {
      if (session?.user && checkOnboarding) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarded')
            .eq('id', session.user.id)
            .maybeSingle()

          if (error) throw error
          if (mounted) setIsOnboarded(data?.onboarded ?? false)
        } catch (error) {
          console.error('Erro ao verificar status de onboarding:', error)
          if (mounted) setIsOnboarded(false)
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
    onboardingFlag: profile?.onboarded,
    orgData: currentOrganization ? {
      id: currentOrganization.id,
      name: currentOrganization.name,
      hasSchema: !!(currentOrganization.settings && (currentOrganization.settings as any).schema_name)
    } : null
  })

  // Garante que não renderizemos nada até que o estado inicial seja carregado
  if (loading || (checkOnboarding && checkingOnboarding) || profileLoading || organizationLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-gray-500">Carregando...</p>
      </div>
    )
  }

  // Se estiver na página de login e já estiver autenticado, redireciona para home
  if (location.pathname === '/login' && session) {
    return <Navigate to="/" replace />
  }

  // Se não estiver autenticado, redireciona para login
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
