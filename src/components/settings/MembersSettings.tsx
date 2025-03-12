
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Mail, Shield, Building, Loader2, MoreHorizontal, 
         UserMinus, RefreshCw, Clock, XCircle } from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function MembersSettings() {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member")
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [selectedMember, setSelectedMember] = useState<any>(null)
  const [newRole, setNewRole] = useState<"member" | "admin" | "owner">("member")
  const { toast } = useToast()
  const { user } = useAuth()
  const { 
    loading, 
    currentOrganization, 
    members, 
    invites,
    inviteMember,
    cancelInvite,
    resendInvite,
    removeMember,
    updateMemberRole
  } = useOrganization()

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrganization) return

    try {
      await inviteMember(currentOrganization.id, inviteEmail, inviteRole)
      setInviteEmail("")
    } catch (error) {
      console.error("Erro ao enviar convite:", error)
    }
  }

  const handleRoleUpdate = async () => {
    if (!selectedMember || !currentOrganization) return

    try {
      await updateMemberRole(selectedMember.id, newRole, currentOrganization.id)
      setShowRoleDialog(false)
    } catch (error) {
      console.error("Erro ao atualizar função:", error)
    }
  }

  const handleRemoveMember = async () => {
    if (!selectedMember || !currentOrganization) return

    try {
      await removeMember(selectedMember.id, currentOrganization.id)
      setShowRemoveDialog(false)
    } catch (error) {
      console.error("Erro ao remover membro:", error)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelInvite(inviteId)
    } catch (error) {
      console.error("Erro ao cancelar convite:", error)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    try {
      await resendInvite(inviteId)
    } catch (error) {
      console.error("Erro ao reenviar convite:", error)
    }
  }

  const openRoleDialog = (member: any) => {
    setSelectedMember(member)
    setNewRole(member.role)
    setShowRoleDialog(true)
  }

  const openRemoveDialog = (member: any) => {
    setSelectedMember(member)
    setShowRemoveDialog(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getInviteStatusBadge = (status: string | null, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date()
    
    if (isExpired) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expirado
        </Badge>
      )
    }
    
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Aceito
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendente
          </Badge>
        )
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Proprietário'
      case 'admin':
        return 'Administrador'
      default:
        return 'Membro'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            {currentOrganization?.name || "Carregando..."}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Gerencie sua organização e membros. Convide novos membros para colaborar.
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          {/* Seção de Convite */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Convidar Novo Membro</h2>
              <p className="text-sm text-muted-foreground">
                Envie um convite por email para adicionar novos membros à sua organização.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email">Email do novo membro</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    placeholder="email@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-[200px] space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select 
                  value={inviteRole} 
                  onValueChange={(value) => setInviteRole(value as "member" | "admin")}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleInvite} disabled={loading || !inviteEmail}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Convidar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de Convites Pendentes */}
          {invites && invites.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Convites Pendentes</h2>
                    <p className="text-sm text-muted-foreground">
                      {invites.length} {invites.length === 1 ? 'convite' : 'convites'} aguardando aceitação
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invites.length}
                  </Badge>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data do Convite</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invites.map((invite) => (
                      <TableRow key={invite.id}>
                        <TableCell className="font-medium">
                          {invite.email}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={`${getRoleBadgeColor(invite.role || '')} flex w-fit items-center gap-1`}
                          >
                            <Shield className="h-3 w-3" />
                            {getRoleName(invite.role || '')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getInviteStatusBadge(invite.status, invite.expires_at)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(invite.created_at || ''), { 
                            addSuffix: true,
                            locale: ptBR
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleResendInvite(invite.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Reenviar
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive"
                              onClick={() => handleCancelInvite(invite.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          <Separator />

          {/* Lista de Membros */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Membros Atuais</h2>
                  <p className="text-sm text-muted-foreground">
                    {members.length} {members.length === 1 ? 'membro' : 'membros'} na organização
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {members.length}
                </Badge>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10">
                            {member.full_name?.charAt(0) || member.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {member.full_name || "Sem nome"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={`${getRoleBadgeColor(member.role || '')} flex w-fit items-center gap-1`}
                        >
                          <Shield className="h-3 w-3" />
                          {getRoleName(member.role || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user?.id !== member.user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openRoleDialog(member)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Alterar função
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openRemoveDialog(member)}
                              >
                                <UserMinus className="mr-2 h-4 w-4" />
                                Remover membro
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal para alterar função */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Função do Membro</DialogTitle>
            <DialogDescription>
              Altere a função de {selectedMember?.full_name || selectedMember?.email} na organização.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">Nova Função</Label>
              <Select 
                value={newRole} 
                onValueChange={(value) => setNewRole(value as "member" | "admin" | "owner")}
              >
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Selecione a nova função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="owner">Proprietário</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold">Proprietário:</span> Controle total da organização e membros<br />
                <span className="font-semibold">Administrador:</span> Pode gerenciar membros e configurações<br />
                <span className="font-semibold">Membro:</span> Pode visualizar e colaborar no sistema
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancelar</Button>
            <Button onClick={handleRoleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para remover membro */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Membro</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover {selectedMember?.full_name || selectedMember?.email} da organização?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveMember} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Remover membro"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
