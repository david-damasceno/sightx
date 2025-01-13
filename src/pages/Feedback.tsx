import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { CreateSurveyForm } from "@/components/nps/CreateSurveyForm"
import { NPSBreakdownChart } from "@/components/nps/NPSBreakdownChart"
import { SentimentAnalysis } from "@/components/nps/SentimentAnalysis"
import { TrendAnalysis } from "@/components/nps/TrendAnalysis"
import { NPSMetricsCard } from "@/components/nps/NPSMetricsCard"
import { NPSSurveyList } from "@/components/nps/NPSSurveyList"
import type { Database } from "@/integrations/supabase/types"

type NPSSurvey = Database['public']['Tables']['nps_surveys']['Row']

export default function Feedback() {
  const [searchTerm, setSearchTerm] = useState("")
  const [surveys, setSurveys] = useState<NPSSurvey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { currentOrganization } = useAuth()

  useEffect(() => {
    async function fetchSurveys() {
      if (!currentOrganization) return

      try {
        const { data, error } = await supabase
          .from('nps_surveys')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setSurveys(data || [])
      } catch (error) {
        console.error('Error fetching surveys:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSurveys()
  }, [currentOrganization])

  const filteredSurveys = surveys.filter(survey => 
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Pesquisas NPS</h1>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Pesquisa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Pesquisa NPS</DialogTitle>
              </DialogHeader>
              <CreateSurveyForm />
            </DialogContent>
          </Dialog>
        </div>

        <NPSMetricsCard 
          npsScore={67} 
          totalResponses={234} 
          responseRate={78} 
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <NPSBreakdownChart />
          <TrendAnalysis />
        </div>

        <SentimentAnalysis />

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Input
              placeholder="Buscar pesquisas..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Carregando pesquisas...</p>
          ) : (
            <NPSSurveyList surveys={filteredSurveys} />
          )}
        </Card>
      </main>
    </div>
  )
}