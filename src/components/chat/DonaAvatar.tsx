
import { Brain } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"

export function DonaAvatar() {
  return (
    <Avatar className="h-8 w-8 bg-primary/10 flex items-center justify-center">
      <Brain className="h-5 w-5 text-primary" />
    </Avatar>
  )
}
