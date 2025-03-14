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
import { useToast } from "@/hooks/use-toast"
import { Users, UserPlus, Mail, Shield, Building, Loader2 } from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function MembersSettings() {
  const [inviteEmail, setInviteEmail] = useState("")
  const { addToast, toast } = useToast()
  const { 
    loading, 
    currentOrganization, 
    members, 
    inviteMember 
  } = useOrganization()

  const handleInvite = async () => {
    if (!inviteEmail || !currentOrganization) return

    try {
      await inviteMember(currentOrganization.id, inviteEmail, 'member')
      setInviteEmail("")
      toast({
        title: "Convite enviado",
        description: `Um convite foi enviado para ${inviteEmail}`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o convite",
        variant: "destructive",
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

            <div className="flex gap-4">
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
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Gerenciar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
