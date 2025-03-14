import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ReportsSettings() {
  const { addToast } = useToast()
  
  const handleSave = () => {
    addToast({
      title: "Settings saved",
      description: "Report settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Reports</h2>
        <p className="text-sm text-muted-foreground">
          Customize your report preferences and schedules
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Default Export Format</Label>
          <Select defaultValue="pdf">
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Report Schedule</Label>
          <Select defaultValue="weekly">
            <SelectTrigger>
              <SelectValue placeholder="Select schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </div>
  )
}
