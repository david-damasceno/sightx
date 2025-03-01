
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"

interface FixesCardProps {
  title: string
  description: string
  isApplied: boolean
  isLoading: boolean
  onApply: () => void
}

export function FixesCard({ 
  title, 
  description, 
  isApplied, 
  isLoading,
  onApply 
}: FixesCardProps) {
  return (
    <Card className={`border ${
      isApplied ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10"
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">{title}</h4>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {isApplied ? (
            <div className="flex items-center text-green-600 text-xs font-medium">
              <CheckCircle className="h-4 w-4 mr-1" />
              Aplicado
            </div>
          ) : (
            <Button 
              variant="secondary" 
              size="sm"
              disabled={isLoading}
              onClick={onApply}
              className="text-xs"
            >
              {isLoading && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              Aplicar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
