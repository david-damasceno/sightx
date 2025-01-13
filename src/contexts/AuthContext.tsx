import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  // Carregar sessão atual
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Session loaded:", session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", _event, session)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carregar organização padrão do usuário
  useEffect(() => {
    const loadDefaultOrganization = async () => {
      if (!user) {
        setCurrentOrganization(null)
        return
      }

      try {
        console.log("Loading default organization for user:", user.id)
        
        // Primeiro, tenta carregar a organização padrão do perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('default_organization_id')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError

        let organizationId = profile?.default_organization_id

        // Se não houver organização padrão, tenta carregar a primeira organização do usuário
        if (!organizationId) {
          const { data: memberData, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

          if (memberError && memberError.code !== 'PGRST116') throw memberError
          organizationId = memberData?.organization_id
        }

        // Se encontrou alguma organização, carrega seus detalhes
        if (organizationId) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .single()

          if (orgError) throw orgError

          console.log("Default organization loaded:", org)
          setCurrentOrganization(org)
        } else {
          console.log("No organization found for user")
          toast({
            title: "Aviso",
            description: "Você precisa criar ou ser convidado para uma organização.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error loading default organization:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar sua organização.",
          variant: "destructive",
        })
      }
    }

    loadDefaultOrganization()
  }, [user, toast])

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