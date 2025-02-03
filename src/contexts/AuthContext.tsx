import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

type Organization = Database['public']['Tables']['organizations']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization | null) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  currentOrganization: null,
  setCurrentOrganization: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Load user profile
  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      if (!user) {
        if (mounted) setProfile(null)
        return
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        if (mounted) setProfile(data)
      } catch (error) {
        console.error('Error loading profile:', error)
        if (mounted) setProfile(null)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [user])

  // Load default organization
  useEffect(() => {
    let mounted = true

    const loadDefaultOrganization = async () => {
      if (!user) {
        if (mounted) setCurrentOrganization(null)
        return
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('default_organization_id')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) throw profileError

        if (profile?.default_organization_id && mounted) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', profile.default_organization_id)
            .maybeSingle()

          if (orgError) throw orgError
          if (org && mounted) setCurrentOrganization(org)
        }
      } catch (error) {
        console.error('Error loading default organization:', error)
        if (mounted) setCurrentOrganization(null)
      }
    }

    loadDefaultOrganization()

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
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