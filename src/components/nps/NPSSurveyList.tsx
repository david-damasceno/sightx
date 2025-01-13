import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Link, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/integrations/supabase/types"

type NPSSurvey = Database['public']['Tables']['nps_surveys']['Row']

interface NPSSurveyListProps {
  surveys: NPSSurvey[]
}

export function NPSSurveyList({ surveys }: NPSSurveyListProps) {
  const { toast } = useToast()

  const getStatusColor = (status: NPSSurvey['status']) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      case "draft":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "archived":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
    }
  }

  const handleShare = (surveyId: string) => {
    const surveyUrl = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(surveyUrl)
    toast({
      title: "Link copiado!",
      description: "O link da pesquisa foi copiado para sua área de transferência."
    })
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <Card key={survey.id} className="p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{survey.title}</h3>
                <Badge variant="secondary" className={getStatusColor(survey.status)}>
                  {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{survey.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  <MessageSquare className="h-4 w-4 inline mr-1" />
                  0 respostas
                </span>
                <span>Criada em: {new Date(survey.created_at || '').toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleShare(survey.id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <Button variant="outline" size="sm">
                <Link className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}