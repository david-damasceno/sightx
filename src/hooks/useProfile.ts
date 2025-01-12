import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_url: string
  phone: string
  company: string
  address: string
  updated_at: string
  default_organization_id: string | null
  onboarded: boolean
}

export function useProfile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    id: "",
    full_name: "",
    email: "",
    avatar_url: "",
    phone: "",
    company: "",
    address: "",
    updated_at: "",
    default_organization_id: null,
    onboarded: false
  })

  const getProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const currentTime = new Date().toISOString()
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              updated_at: currentTime,
              onboarded: false,
              default_organization_id: null
            })

          if (insertError) throw insertError

          data = {
            id: user.id,
            email: user.email,
            full_name: "",
            avatar_url: "",
            phone: "",
            company: "",
            address: "",
            updated_at: currentTime,
            default_organization_id: null,
            onboarded: false
          }
        } else {
          throw error
        }
      }

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          email: data.email || "",
          avatar_url: data.avatar_url || "",
          phone: data.phone || "",
          company: data.company || "",
          address: data.address || "",
          updated_at: data.updated_at || "",
          default_organization_id: data.default_organization_id,
          onboarded: data.onboarded || false
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (newProfile: Profile) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        })
        return
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...newProfile,
          id: user.id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setProfile(newProfile)
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar o perfil.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getProfile()
  }, [])

  return {
    profile,
    setProfile,
    loading,
    updateProfile
  }
}