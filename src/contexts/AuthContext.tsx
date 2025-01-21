import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

type Organization = Database['public']['Tables']['organizations']['Row']

interface AuthContextType {
  session: Session | null
  user: User | null
  loading: boolean
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization | null) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  currentOrganization: null,
  setCurrentOrganization: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    // Primeiro, tentar recuperar a sessão do localStorage
    const savedSession = localStorage.getItem('supabase.auth.token')
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession)
        if (parsed?.currentSession) {
          setSession(parsed.currentSession)
          setUser(parsed.currentSession.user)
        }
      } catch (error) {
        console.error('Error parsing saved session:', error)
      }
    }

    // Então, verificar a sessão atual com o Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Salvar a sessão no localStorage
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: session,
          expiresAt: session.expires_at
        }))
      } else {
        localStorage.removeItem('supabase.auth.token')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Carregar organização padrão do usuário
  useEffect(() => {
    const loadDefaultOrganization = async () => {
      if (!user) {
        setCurrentOrganization(null)
        return
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('default_organization_id')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) throw profileError

        if (profile?.default_organization_id) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.default_organization_id)
            .maybeSingle()

          if (orgError) throw orgError
          if (org) setCurrentOrganization(org)
        }
      } catch (error) {
        console.error('Error loading default organization:', error)
        setCurrentOrganization(null)
      }
    }

    loadDefaultOrganization()
  }, [user])

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      currentOrganization,
      setCurrentOrganization
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}