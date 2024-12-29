import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function IntegrationsSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Integration settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect with external services and platforms
        </p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Google Analytics</h3>
          <p className="text-sm text-muted-foreground mb-4">Track website traffic and user behavior</p>
          <Button variant="outline">Connect</Button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Salesforce</h3>
          <p className="text-sm text-muted-foreground mb-4">Sync customer data and sales information</p>
          <Button variant="outline">Connect</Button>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="font-medium">Slack</h3>
          <p className="text-sm text-muted-foreground mb-4">Get notifications and updates in your Slack channels</p>
          <Button variant="outline">Connect</Button>
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}