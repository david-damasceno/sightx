
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationMember = Database['public']['Views']['organization_members_with_profiles']['Row']

export function useOrganization() {
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const { toast } = useToast()

  const fetchOrganizations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organizations')
        .select('*')

      if (error) throw error

      setOrganizations(data || [])
      
      if (data && data.length > 0) {
        setCurrentOrganization(data[0])
      } else {
        setCurrentOrganization(null)
      }
    } catch (error: any) {
      console.error('Erro ao buscar organizações:', error)
      // Removemos o toast de erro aqui pois é esperado não ter organizações no início
    } finally {
      setLoading(false)
    }
  }

  const generateUniqueSlug = async (baseSlug: string): Promise<string> => {
    let slug = baseSlug
    let counter = 1
    let isUnique = false

    while (!isUnique) {
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)

      if (!data || data.length === 0) {
        isUnique = true
      } else {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    return slug
  }

  const createOrganization = async (
    name: string, 
    sector: string,
    city: string,
    state: string,
    description: string
  ) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const baseSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const uniqueSlug = await generateUniqueSlug(baseSlug)

      // Utilizamos a função SQL modificada para criar a organização, esquema e bucket
      const { data: result, error: rpcError } = await supabase.rpc(
        'create_organization_with_owner',
        {
          p_name: name,
          p_slug: uniqueSlug,
          p_user_id: user.id,
          p_sector: sector,
          p_city: city,
          p_state: state,
          p_description: description
        }
      )

      if (rpcError) {
        console.error('Erro ao criar organização (RPC):', rpcError)
        throw rpcError
      }

      if (!result) throw new Error('Nenhum resultado retornado da função RPC')

      console.log('Organização criada com sucesso:', result)

      // Atualiza imediatamente o estado com a nova organização
      await fetchOrganizations()
      
      // Garantir que a nova organização seja definida como atual
      if (result) {
        setCurrentOrganization(result as Organization)
      }

      toast({
        title: "Sucesso",
        description: "Organização criada com sucesso.",
      })

      return result as Organization
    } catch (error: any) {
      console.error('Erro ao criar organização:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a organização: " + error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async (organizationId: string) => {
    if (!organizationId) return // Não busca membros se não houver organização

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organization_members_with_profiles')
        .select('*')
        .eq('organization_id', organizationId)

      if (error) throw error

      setMembers(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar membros:', error)
      // Removemos o toast de erro aqui também pois é esperado não ter membros no início
    } finally {
      setLoading(false)
    }
  }

  const getOrganizationSchema = (organization: Organization | null): string | null => {
    if (!organization || !organization.settings) return null
    
    // Extrai o nome do esquema das configurações da organização
    const settings = organization.settings as Record<string, any>
    return settings.schema_name || null
  }

  const getOrganizationBucket = (organization: Organization | null): string | null => {
    if (!organization) return null
    
    // O ID da organização é o ID do bucket
    return organization.id
  }

  const inviteMember = async (organizationId: string, email: string, role: 'member' | 'admin') => {
    try {
      setLoading(true)
      // Invocamos a edge function para processar o convite
      const { data, error } = await supabase.functions.invoke('process-invite', {
        body: {
          email,
          organizationId,
          role
        }
      })

      if (error) throw error

      // Se o usuário já existia e foi adicionado diretamente, atualizar a lista de membros
      if (data.userExists) {
        await fetchMembers(organizationId)
      }

      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso.",
      })
    } catch (error: any) {
      console.error('Erro ao convidar membro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite.",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers(currentOrganization.id)
    }
  }, [currentOrganization])

  return {
    loading,
    organizations,
    currentOrganization,
    setCurrentOrganization,
    members,
    createOrganization,
    inviteMember,
    fetchMembers,
    getOrganizationSchema,
    getOrganizationBucket
  }
}
