import { Navigate } from "react-router-dom"
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

  if (loading || (checkOnboarding && checkingOnboarding)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (checkOnboarding && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}