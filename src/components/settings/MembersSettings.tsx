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
import { useToast } from "@/components/ui/use-toast"
import { Users, UserPlus, Mail, Shield } from "lucide-react"
import { useOrganization } from "@/hooks/useOrganization"

export function MembersSettings() {
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Membros da Organização</h1>
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
                <Button onClick={handleInvite} disabled={loading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de Membros */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Membros Atuais</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie os membros atuais da sua organização e suas permissões.
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.user_id}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {member.role}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </TableCell>
                    <TableCell>
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
      </Card>
    </div>
  )
}