import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Profile } from "@/hooks/useProfile"

interface ProfileHeaderProps {
  profile: Profile
  onAvatarClick: () => void
}

export function ProfileHeader({ profile, onAvatarClick }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(' ')
      .map((n) => n[0])
      .filter((_, index, array) => index === 0 || index === array.length - 1)
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={profile.avatar_url} alt="Foto do perfil" />
        <AvatarFallback>
          {profile.full_name ? getInitials(profile.full_name) : ""}
        </AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Foto do Perfil</h2>
        <p className="text-sm text-muted-foreground">
          Esta foto será exibida em seu perfil e em outras áreas do sistema.
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onAvatarClick}
          >
            {profile.avatar_url ? "Editar foto" : "Alterar foto"}
          </Button>
        </div>
      </div>
    </div>
  )
}