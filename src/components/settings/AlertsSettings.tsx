import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function AlertsSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Alert settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Alerts & Notifications</h2>
        <p className="text-sm text-muted-foreground">
          Configure your notification preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive important updates via email
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Get real-time alerts on your device
            </p>
          </div>
          <Switch defaultChecked />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>SMS Alerts</Label>
            <p className="text-sm text-muted-foreground">
              Receive critical alerts via SMS
            </p>
          </div>
          <Switch />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}