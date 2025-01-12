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
    async function checkOnboardingStatus() {
      if (session?.user && checkOnboarding) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarded')
            .eq('id', session.user.id)
            .single()

          if (error) throw error
          setIsOnboarded(data.onboarded)
        } catch (error) {
          console.error('Error checking onboarding status:', error)
          setIsOnboarded(false)
        }
      }
      setCheckingOnboarding(false)
    }

    checkOnboardingStatus()
  }, [session, checkOnboarding])

  // Se estiver na página de login e já estiver autenticado, redireciona para home
  if (location.pathname === '/login' && session) {
    return <Navigate to="/" replace />
  }

  // Se estiver na página de onboarding e não estiver autenticado, redireciona para login
  if (location.pathname === '/onboarding' && !session) {
    return <Navigate to="/login" replace />
  }

  // Mostra loading enquanto verifica a sessão
  if (loading || (checkOnboarding && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redireciona para login se não houver sessão
  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
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