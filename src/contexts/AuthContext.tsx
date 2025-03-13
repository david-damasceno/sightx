
import { createContext, useContext, useEffect, useState, useRef } from "react"
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
  
  // Usar useRef para controlar o cancelamento de solicitações quando o componente for desmontado
  const mountedRef = useRef(true)

  // Limpar a referência quando o componente for desmontado
  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (mountedRef.current) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mountedRef.current) {
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
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeAuth()
  }, [])

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true)
      if (!user) {
        if (mountedRef.current) {
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
            
            // Buscar dados do usuário
            const { data: userData } = await supabase.auth.getUser()
            if (!userData?.user) throw new Error('Usuário não encontrado')
            
            // Inserir novo perfil
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userData.user.id,
                email: userData.user.email,
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

            if (mountedRef.current) setProfile(newProfile)
          } else {
            throw error
          }
        } else {
          console.log('Profile loaded successfully:', data)
          if (mountedRef.current) setProfile(data)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error in profile flow:', error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar seu perfil. Tente recarregar a página.",
            variant: "destructive"
          })
          if (mountedRef.current) setProfile(null)
        }
      } finally {
        if (mountedRef.current) setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user, toast])

  // Load default organization
  useEffect(() => {
    const loadDefaultOrganization = async () => {
      setOrganizationLoading(true)
      if (!user) {
        if (mountedRef.current) {
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

        if (memberError) {
          console.error('Error loading organization membership:', memberError)
          if (mountedRef.current) setCurrentOrganization(null)
        } else if (memberData?.organization_id) {
          console.log('Found organization membership:', memberData.organization_id)
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', memberData.organization_id)
            .maybeSingle()

          if (orgError) {
            console.error('Error loading organization details:', orgError)
            if (mountedRef.current) setCurrentOrganization(null)
          } else {
            console.log('Organization loaded:', org)
            if (mountedRef.current && org) setCurrentOrganization(org)
            else if (mountedRef.current) setCurrentOrganization(null)
          }
        } else {
          console.log('No organization found for user')
          if (mountedRef.current) setCurrentOrganization(null)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading default organization:', error)
          if (mountedRef.current) setCurrentOrganization(null)
        }
      } finally {
        if (mountedRef.current) setOrganizationLoading(false)
      }
    }

    loadDefaultOrganization()
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
