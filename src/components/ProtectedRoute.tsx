import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

interface ProtectedRouteProps {
  children: React.ReactNode
  checkOnboarding?: boolean
}

export function ProtectedRoute({ children, checkOnboarding = false }: ProtectedRouteProps) {
  const { session, loading } = useAuth()
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
          console.error('Error checking onboarding status:', error)
          if (mounted) setIsOnboarded(false)
        }
      }
      if (mounted) setCheckingOnboarding(false)
    }

    checkOnboardingStatus()

    return () => {
      mounted = false
    }
  }, [session, checkOnboarding])

  // Mostra loading apenas durante a verificação inicial
  if (loading || (checkOnboarding && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se estiver na página de login e já estiver autenticado, redireciona para home
  if (location.pathname === '/login' && session) {
    return <Navigate to="/" replace />
  }

  // Se não estiver autenticado, redireciona para login
  if (!session) {
    // Salva a URL atual para redirecionar de volta após o login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Redireciona para onboarding se necessário
  if (checkOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  // Se já estiver onboarded e tentar acessar a página de onboarding, redireciona para home
  if (isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}