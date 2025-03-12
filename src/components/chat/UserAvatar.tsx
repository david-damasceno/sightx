
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

export function UserAvatar() {
  const { profile } = useAuth()
  
  return (
    <Avatar className="h-8 w-8">
      <AvatarImage 
        src={profile?.avatar_url || ''} 
        alt="Avatar do usuário" 
      />
      <AvatarFallback className="bg-primary text-primary-foreground">
        <User className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  )
}
