import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Link, Share2, Plus, Star, Users, BarChart3 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface NPSSurvey {
  id: string
  title: string
  description: string
  status: "active" | "inactive" | "draft"
  responses: number
  averageScore: number
  createdAt: string
  lastResponse?: string
}

const mockSurveys: NPSSurvey[] = [
  {
    id: "1",
    title: "Satisfação Geral 2024",
    description: "Pesquisa para avaliar a satisfação geral dos clientes com nossos produtos e serviços",
    status: "active",
    responses: 145,
    averageScore: 8.7,
    createdAt: "2024-01-15",
    lastResponse: "2024-03-10"
  },
  {
    id: "2",
    title: "Feedback Pós-Atendimento",
    description: "Avaliação do atendimento ao cliente",
    status: "active",
    responses: 89,
    averageScore: 9.2,
    createdAt: "2024-02-01",
    lastResponse: "2024-03-09"
  },
  {
    id: "3",
    title: "Pesquisa de Produto Novo",
    description: "Feedback sobre o lançamento do novo produto",
    status: "draft",
    responses: 0,
    averageScore: 0,
    createdAt: "2024-03-08"
  }
]

export default function Feedback() {
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const getStatusColor = (status: NPSSurvey["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "inactive":
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
      case "draft":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    }
  }

  const handleShare = (surveyId: string) => {
    navigator.clipboard.writeText(`https://app.example.com/survey/${surveyId}`)
    toast({
      title: "Link copiado!",
      description: "O link da pesquisa foi copiado para sua área de transferência."
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6 animate-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Pesquisas NPS</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pesquisa
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-2 text-green-500">
              <Star className="h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">NPS Médio</p>
                <p className="text-2xl font-bold">67</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-2 text-blue-500">
              <Users className="h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Respostas</p>
                <p className="text-2xl font-bold">234</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-2 text-purple-500">
              <BarChart3 className="h-5 w-5" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Resposta</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <Input
              placeholder="Buscar pesquisas..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {mockSurveys.map((survey) => (
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
                      <span>{survey.responses} respostas</span>
                      {survey.averageScore > 0 && (
                        <span>NPS médio: {survey.averageScore}</span>
                      )}
                      <span>Criada em: {survey.createdAt}</span>
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
        </Card>
      </main>
    </div>
  )
}