import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function LocationsSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Location settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Locations</h2>
        <p className="text-sm text-muted-foreground">
          Manage your business locations and geography settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Default Location</Label>
          <Input placeholder="Enter default location" />
        </div>

        <div className="space-y-2">
          <Label>Radius (km)</Label>
          <Input type="number" placeholder="Enter radius" defaultValue={10} />
        </div>

        <div className="space-y-2">
          <Label>Google Maps API Key</Label>
          <Input type="password" placeholder="Enter API key" />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}