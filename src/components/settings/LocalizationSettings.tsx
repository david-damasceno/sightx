import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

export function LocalizationSettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Localization settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Localization</h2>
        <p className="text-sm text-muted-foreground">
          Configure regional and language settings
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Default Language</Label>
          <Select defaultValue="en">
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date Format</Label>
          <Select defaultValue="mdy">
            <SelectTrigger>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
              <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
              <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Number Format</Label>
          <Select defaultValue="us">
            <SelectTrigger>
              <SelectValue placeholder="Select number format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">1,234.56</SelectItem>
              <SelectItem value="eu">1.234,56</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}