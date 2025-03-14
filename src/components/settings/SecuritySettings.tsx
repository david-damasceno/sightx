import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function SecuritySettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Security settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Security</h2>
        <p className="text-sm text-muted-foreground">
          Manage security settings and access controls
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>API Key</Label>
          <Input type="password" placeholder="Enter API key" />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>IP Whitelisting</Label>
            <p className="text-sm text-muted-foreground">
              Restrict access to specific IP addresses
            </p>
          </div>
          <Switch />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Audit Logging</Label>
            <p className="text-sm text-muted-foreground">
              Track all system activities
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}