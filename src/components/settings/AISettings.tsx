import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

export function AISettings() {
  const { toast } = useToast()
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "AI settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">AI Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure AI analysis and prediction preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Analysis Frequency</Label>
          <Select defaultValue="daily">
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Automated Insights</Label>
            <p className="text-sm text-muted-foreground">
              Generate AI-powered business insights
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}