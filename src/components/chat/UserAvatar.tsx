
import { User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useProfile } from "@/hooks/useProfile"

export function UserAvatar() {
  const { profile } = useProfile()
  
  return (
    <Avatar className="h-8 w-8">
      {profile.avatar_url ? (
        <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Usuário"} />
      ) : (
        <AvatarFallback className="bg-primary/10">
          <User className="h-5 w-5 text-primary" />
        </AvatarFallback>
      )}
    </Avatar>
  )
}
