
import { Brain } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

interface DonaAvatarProps {
  className?: string;
}

export function DonaAvatar({ className }: DonaAvatarProps) {
  return (
    <Avatar className={`h-8 w-8 bg-primary/10 flex items-center justify-center ${className || ''}`}>
      <Brain className="h-5 w-5 text-primary" />
    </Avatar>
  )
}
