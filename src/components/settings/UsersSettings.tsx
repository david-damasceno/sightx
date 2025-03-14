import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function UsersSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "User settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Users & Permissions</h2>
        <p className="text-sm text-muted-foreground">
          Manage user access and security settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Two-Factor Authentication (2FA)</Label>
            <p className="text-sm text-muted-foreground">
              Require 2FA for all user accounts
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Password Expiration</Label>
            <p className="text-sm text-muted-foreground">
              Require password change every 90 days
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Session Timeout</Label>
            <p className="text-sm text-muted-foreground">
              Automatically log out inactive users after 30 minutes
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}