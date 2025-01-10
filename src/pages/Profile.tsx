import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { User, Mail, Phone, Building, MapPin } from "lucide-react"

export default function Profile() {
  const { toast } = useToast()

  const handleSave = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    })
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
      </div>

      <Card className="p-6">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder.svg" alt="Foto do perfil" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Foto do Perfil</h2>
              <p className="text-sm text-muted-foreground">
                Esta foto será exibida em seu perfil e em outras áreas do sistema.
              </p>
              <Button variant="outline">Alterar foto</Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" className="pl-9" placeholder="Seu nome completo" defaultValue="Administrador" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pl-9" type="email" placeholder="Seu email" defaultValue="admin@sightx.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="phone" className="pl-9" placeholder="Seu telefone" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="company" className="pl-9" placeholder="Nome da empresa" defaultValue="SightX" />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="address" className="pl-9" placeholder="Seu endereço completo" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}