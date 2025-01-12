import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Building, MapPin, Loader2 } from "lucide-react"
import { Profile } from "@/hooks/useProfile"

interface ProfileFormProps {
  profile: Profile
  loading: boolean
  onProfileChange: (profile: Profile) => void
  onSubmit: () => void
}

export function ProfileForm({ profile, loading, onProfileChange, onSubmit }: ProfileFormProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            className="pl-9"
            placeholder="Seu nome completo"
            value={profile.full_name}
            onChange={(e) => onProfileChange({ ...profile, full_name: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            className="pl-9"
            type="email"
            placeholder="Seu email"
            value={profile.email}
            onChange={(e) => onProfileChange({ ...profile, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            className="pl-9"
            placeholder="Seu telefone"
            value={profile.phone}
            onChange={(e) => onProfileChange({ ...profile, phone: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Empresa</Label>
        <div className="relative">
          <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="company"
            className="pl-9"
            placeholder="Nome da empresa"
            value={profile.company}
            onChange={(e) => onProfileChange({ ...profile, company: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="address">Endereço</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="address"
            className="pl-9"
            placeholder="Seu endereço completo"
            value={profile.address}
            onChange={(e) => onProfileChange({ ...profile, address: e.target.value })}
          />
        </div>
      </div>

      <div className="md:col-span-2 flex justify-end">
        <Button onClick={onSubmit} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </div>
  )
}