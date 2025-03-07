
import { createContext, useContext, useEffect, useState } from "react"
import { Session, User } from "@supabase/supabase-js"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"
import { useToast } from "@/hooks/use-toast"

type Organization = Database['public']['Tables']['organizations']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  organizationLoading: boolean
  profileLoading: boolean
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization | null) => void
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  organizationLoading: true,
  profileLoading: true,
  currentOrganization: null,
  setCurrentOrganization: () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [organizationLoading, setOrganizationLoading] = useState(true)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            console.log('Auth state changed:', { event: _event, hasSession: !!session })
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
      setProfileLoading(true)
      if (!user) {
        if (mounted) {
          setProfile(null)
          setProfileLoading(false)
        }
        return
      }

      try {
        console.log('Loading profile for user:', user.id)
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error loading profile:', error)
          
          // Se o perfil não existir, criamos automaticamente
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating one')
            const currentTime = new Date().toISOString()
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                updated_at: currentTime,
                onboarded: false,
                default_organization_id: null
              })
              .select()
              .single()

            if (insertError) {
              console.error('Error creating profile:', insertError)
              throw insertError
            }

            if (mounted) setProfile(newProfile)
          } else {
            throw error
          }
        } else {
          console.log('Profile loaded successfully:', data)
          if (mounted) setProfile(data)
        }
      } catch (error) {
        console.error('Error in profile flow:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil. Tente recarregar a página.",
          variant: "destructive"
        })
        if (mounted) setProfile(null)
      } finally {
        if (mounted) setProfileLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [user, toast])

  // Load default organization
  useEffect(() => {
    let mounted = true

    const loadDefaultOrganization = async () => {
      setOrganizationLoading(true)
      if (!user) {
        if (mounted) {
          setCurrentOrganization(null)
          setOrganizationLoading(false)
        }
        return
      }

      try {
        console.log('Loading organization for user:', user.id)
        const { data: memberData, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (memberError) throw memberError

        if (memberData?.organization_id) {
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', memberData.organization_id)
            .maybeSingle()

          if (orgError) throw orgError
          console.log('Organization loaded:', org)
          if (mounted) setCurrentOrganization(org)
        } else {
          console.log('No organization found for user')
          if (mounted) setCurrentOrganization(null)
        }
      } catch (error) {
        console.error('Error loading default organization:', error)
        if (mounted) setCurrentOrganization(null)
      } finally {
        if (mounted) setOrganizationLoading(false)
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
      profileLoading,
      organizationLoading,
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
