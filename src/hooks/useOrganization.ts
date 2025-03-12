
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Database } from "@/integrations/supabase/types"

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationMember = Database['public']['Views']['organization_members_with_profiles']['Row']
type OrganizationInvite = Database['public']['Tables']['organization_invites']['Row']

export function useOrganization() {
  const [loading, setLoading] = useState(false)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<OrganizationInvite[]>([])
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
      console.error('Error fetching organizations:', error)
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

      if (rpcError) throw rpcError

      if (!result) throw new Error('Nenhum resultado retornado da função RPC')

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
      console.error('Error creating organization:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a organização.",
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
      console.error('Error fetching members:', error)
      // Removemos o toast de erro aqui também pois é esperado não ter membros no início
    } finally {
      setLoading(false)
    }
  }

  const fetchInvites = async (organizationId: string) => {
    if (!organizationId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organizationId)
        .neq('status', 'accepted')

      if (error) throw error

      setInvites(data || [])
    } catch (error: any) {
      console.error('Error fetching invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (organizationId: string, email: string, role: 'member' | 'admin') => {
    try {
      setLoading(true)
      const token = crypto.randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      // Verificar se já existe um convite ativo para este email nesta organização
      const { data: existingInvites } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('email', email)
        .neq('status', 'accepted')

      if (existingInvites && existingInvites.length > 0) {
        toast({
          title: "Convite já enviado",
          description: "Este usuário já possui um convite pendente.",
          variant: "destructive"
        })
        return
      }

      // Obter informações do usuário que está convidando
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Obter nome do perfil do usuário que está convidando
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Obter nome da organização
      const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', organizationId)
        .single()

      if (!organization) {
        throw new Error('Organização não encontrada')
      }

      // Criar o convite no banco de dados
      const { data: invite, error } = await supabase
        .from('organization_invites')
        .insert({
          organization_id: organizationId,
          email,
          role,
          token,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Gerar link de convite
      const baseUrl = window.location.origin
      const inviteLink = `${baseUrl}/accept-invite?token=${token}`

      // Enviar email de convite usando Edge Function
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: { 
          email, 
          inviterName: inviterProfile?.full_name || null,
          organizationName: organization.name, 
          role,
          token,
          inviteLink
        }
      })

      if (emailError) {
        console.error('Erro ao enviar email:', emailError)
        // Não vamos falhar a operação se apenas o email falhar
        toast({
          title: "Atenção",
          description: "Convite criado, mas houve um problema ao enviar o email.",
          variant: "default"
        })
      } else {
        toast({
          title: "Sucesso",
          description: "Convite enviado com sucesso.",
        })
      }

      // Atualizar a lista de convites
      await fetchInvites(organizationId)
      
      return invite
    } catch (error: any) {
      console.error('Error inviting member:', error)
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

  const cancelInvite = async (inviteId: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('organization_invites')
        .delete()
        .eq('id', inviteId)
      
      if (error) throw error
      
      toast({
        title: "Convite cancelado",
        description: "O convite foi cancelado com sucesso.",
      })
      
      // Atualizar a lista de convites se houver uma organização atual
      if (currentOrganization) {
        await fetchInvites(currentOrganization.id)
      }
    } catch (error: any) {
      console.error('Error canceling invite:', error)
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o convite.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const resendInvite = async (inviteId: string) => {
    try {
      setLoading(true)
      
      // Obter detalhes do convite
      const { data: invite, error: inviteError } = await supabase
        .from('organization_invites')
        .select('*, organizations(name)')
        .eq('id', inviteId)
        .single()
      
      if (inviteError || !invite) throw new Error('Convite não encontrado')
      
      // Obter nome do perfil do usuário que está convidando
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')
      
      const { data: inviterProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      // Atualizar a data de expiração
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)
      
      const { error: updateError } = await supabase
        .from('organization_invites')
        .update({
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .eq('id', inviteId)
      
      if (updateError) throw updateError
      
      // Gerar link de convite
      const baseUrl = window.location.origin
      const inviteLink = `${baseUrl}/accept-invite?token=${invite.token}`
      
      // Enviar email de convite
      const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
        body: { 
          email: invite.email, 
          inviterName: inviterProfile?.full_name || null,
          organizationName: invite.organizations?.name, 
          role: invite.role,
          token: invite.token,
          inviteLink
        }
      })
      
      if (emailError) {
        console.error('Erro ao reenviar email:', emailError)
        toast({
          title: "Atenção",
          description: "Convite atualizado, mas houve um problema ao reenviar o email.",
          variant: "default"
        })
      } else {
        toast({
          title: "Convite reenviado",
          description: "O convite foi reenviado com sucesso.",
        })
      }
      
      // Atualizar a lista de convites
      if (currentOrganization) {
        await fetchInvites(currentOrganization.id)
      }
    } catch (error: any) {
      console.error('Error resending invite:', error)
      toast({
        title: "Erro",
        description: "Não foi possível reenviar o convite.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string, organizationId: string) => {
    try {
      setLoading(true)
      
      // Verificar se é o último owner da organização
      const { data: owners } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('role', 'owner')
      
      const { data: memberToRemove } = await supabase
        .from('organization_members')
        .select('role')
        .eq('id', memberId)
        .single()
      
      if (memberToRemove?.role === 'owner' && owners && owners.length <= 1) {
        toast({
          title: "Operação não permitida",
          description: "Não é possível remover o último proprietário da organização.",
          variant: "destructive"
        })
        return
      }
      
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
      
      if (error) throw error
      
      toast({
        title: "Membro removido",
        description: "O membro foi removido da organização com sucesso.",
      })
      
      // Atualizar a lista de membros
      await fetchMembers(organizationId)
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o membro.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (memberId: string, role: 'member' | 'admin' | 'owner', organizationId: string) => {
    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
      
      if (error) throw error
      
      toast({
        title: "Função atualizada",
        description: "A função do membro foi atualizada com sucesso.",
      })
      
      // Atualizar a lista de membros
      await fetchMembers(organizationId)
    } catch (error: any) {
      console.error('Error updating member role:', error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a função do membro.",
        variant: "destructive"
      })
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
      fetchInvites(currentOrganization.id)
    }
  }, [currentOrganization])

  return {
    loading,
    organizations,
    currentOrganization,
    setCurrentOrganization,
    members,
    invites,
    createOrganization,
    inviteMember,
    cancelInvite,
    resendInvite,
    removeMember,
    updateMemberRole,
    fetchMembers,
    fetchInvites
  }
}
