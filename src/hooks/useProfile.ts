import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface Profile {
  full_name: string
  email: string
  avatar_url: string
  phone: string
  company: string
  address: string
}

export function useProfile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    email: "",
    avatar_url: "",
    phone: "",
    company: "",
    address: ""
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
              updated_at: currentTime
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
            updated_at: currentTime
          }
        } else {
          throw error
        }
      }

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          avatar_url: data.avatar_url || "",
          phone: data.phone || "",
          company: data.company || "",
          address: data.address || ""
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
          id: user.id,
          ...newProfile,
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