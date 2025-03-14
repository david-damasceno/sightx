import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function SupportSettings() {
  const { addToast, toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Support settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Support</h2>
        <p className="text-sm text-muted-foreground">
          Configure support and help resources
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Support Email</Label>
          <Input type="email" placeholder="Enter support email" />
        </div>

        <div className="space-y-2">
          <Label>Help Center URL</Label>
          <Input placeholder="Enter help center URL" />
        </div>

        <div className="space-y-2">
          <Label>Custom Support Message</Label>
          <Textarea placeholder="Enter custom support message" />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
