
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Brain } from "lucide-react"

interface DonaAvatarProps {
  className?: string;
}

export function DonaAvatar({ className }: DonaAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src="/icons/dona-avatar.png" alt="DONA" />
      <AvatarFallback className="bg-primary/10">
        <Brain className="h-4 w-4 text-primary" />
      </AvatarFallback>
    </Avatar>
  )
}
