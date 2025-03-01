
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { MessageSquare, PlusCircle, BarChart2, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useOrganization } from "@/hooks/useOrganization"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type NPSSurvey = {
  id: string
  title: string
  description: string | null
  status: 'draft' | 'active' | 'completed'
  created_at: string
}

type AIPromptType = 'manual' | 'recommend'

export default function Feedback() {
  const [surveys, setSurveys] = useState<NPSSurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingNewSurvey, setCreatingNewSurvey] = useState(false)
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [promptType, setPromptType] = useState<AIPromptType>("manual")
  const [generatingPrompt, setGeneratingPrompt] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useOrganization()

  useEffect(() => {
    if (currentOrganization) {
      fetchSurveys()
    }
  }, [currentOrganization])

  const fetchSurveys = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('nps_surveys')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setSurveys(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar pesquisas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as pesquisas de feedback.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSurveyWithAI = async () => {
    try {
      setGeneratingPrompt(true)
      
      let systemPrompt = ""
      
      if (promptType === "manual") {
        if (!aiPrompt.trim()) {
          throw new Error("Por favor, descreva o que você deseja avaliar.")
        }
        systemPrompt = aiPrompt
      } else {
        // Modo recomendação baseado no contexto da organização
        systemPrompt = `Minha organização é ${currentOrganization?.name}. 
          Por favor, sugira uma pesquisa de satisfação de clientes relevante para meu negócio.`
      }

      const response = await fetch(
        `${window.location.origin}/functions/v1/chat-with-dona`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `Crie uma pesquisa de feedback para clientes com as seguintes especificações:
              1. Título sugestivo e profissional
              2. Descrição clara do propósito da pesquisa
              3. Sugira 3-5 perguntas relevantes para ${systemPrompt}
              4. Para a pergunta principal de NPS, use a escala de 0-10
              5. Formate a resposta com título, descrição e lista de perguntas
              
              Responda com uma estrutura JSON assim:
              {
                "titulo": "Título da pesquisa",
                "descricao": "Descrição da pesquisa",
                "perguntas": [
                  {"tipo": "nps", "texto": "Em uma escala de 0 a 10, o quanto você recomendaria..."},
                  {"tipo": "texto", "texto": "O que podemos melhorar?"},
                  {"tipo": "opcoes", "texto": "Qual recurso você mais utiliza?", "opcoes": ["Opção 1", "Opção 2"]}
                ]
              }`
          }),
        }
      )

      const data = await response.json()
      
      if (!data.response) {
        throw new Error("Não foi possível gerar a pesquisa.")
      }

      // Tenta extrair o JSON da resposta da IA
      try {
        const jsonStart = data.response.indexOf('{')
        const jsonEnd = data.response.lastIndexOf('}') + 1
        const jsonStr = data.response.substring(jsonStart, jsonEnd)
        const parsedData = JSON.parse(jsonStr)
        
        setSurveyTitle(parsedData.titulo || "")
        setSurveyDescription(parsedData.descricao || "")
        setAiSuggestion(JSON.stringify(parsedData, null, 2))
      } catch (e) {
        // Se falhar ao extrair JSON, usa a resposta bruta
        setAiSuggestion(data.response)
        
        // Tenta extrair título e descrição do texto
        const lines = data.response.split('\n')
        if (lines.length > 0) setSurveyTitle(lines[0].replace(/^[#\s]+/, ''))
        if (lines.length > 1) setSurveyDescription(lines.slice(1, 3).join(' ').trim())
      }

    } catch (error: any) {
      console.error('Erro ao gerar pesquisa com IA:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível gerar a pesquisa com a IA.",
        variant: "destructive"
      })
    } finally {
      setGeneratingPrompt(false)
    }
  }

  const createSurvey = async () => {
    try {
      if (!surveyTitle) {
        toast({
          title: "Erro",
          description: "O título da pesquisa é obrigatório.",
          variant: "destructive"
        })
        return
      }

      if (!currentOrganization) {
        toast({
          title: "Erro",
          description: "Nenhuma organização selecionada.",
          variant: "destructive"
        })
        return
      }

      const { data, error } = await supabase
        .from('nps_surveys')
        .insert({
          organization_id: currentOrganization.id,
          title: surveyTitle,
          description: surveyDescription,
          status: 'draft',
          type: 'simple',
          settings: {
            ai_suggestion: aiSuggestion
          }
        })
        .select()

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Pesquisa de feedback criada com sucesso!",
      })

      // Limpa os campos e fecha o modal
      setSurveyTitle("")
      setSurveyDescription("")
      setAiPrompt("")
      setAiSuggestion("")
      setCreatingNewSurvey(false)
      
      // Atualiza a lista de pesquisas
      await fetchSurveys()
    } catch (error: any) {
      console.error('Erro ao criar pesquisa:', error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a pesquisa.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Feedback</h1>
          </div>
          
          <Sheet open={creatingNewSurvey} onOpenChange={setCreatingNewSurvey}>
            <SheetTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova Pesquisa
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Criar Nova Pesquisa</SheetTitle>
                <SheetDescription>
                  Use a IA para ajudar a criar um formulário de feedback eficiente ou adicione manualmente.
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Select 
                    defaultValue="manual" 
                    onValueChange={(value) => setPromptType(value as AIPromptType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o modo de criação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual - Descreva o que deseja avaliar</SelectItem>
                      <SelectItem value="recommend">Recomendado pela IA - Baseado no contexto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {promptType === "manual" && (
                  <div className="space-y-2">
                    <Label htmlFor="aiPrompt">Descreva o que você deseja avaliar</Label>
                    <Textarea 
                      id="aiPrompt" 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: Quero avaliar a satisfação dos clientes com nosso novo produto..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}

                <Button 
                  onClick={generateSurveyWithAI} 
                  disabled={generatingPrompt || (promptType === "manual" && !aiPrompt.trim())}
                  className="w-full"
                >
                  {generatingPrompt ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando pesquisa...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Gerar com IA
                    </>
                  )}
                </Button>
                
                {aiSuggestion && (
                  <Alert>
                    <AlertTitle>Sugestão da IA</AlertTitle>
                    <AlertDescription>
                      <div className="max-h-[200px] overflow-y-auto whitespace-pre-wrap text-xs">
                        {aiSuggestion}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Pesquisa</Label>
                  <Input 
                    id="title" 
                    value={surveyTitle}
                    onChange={(e) => setSurveyTitle(e.target.value)}
                    placeholder="Ex: Pesquisa de Satisfação Q2 2023"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea 
                    id="description" 
                    value={surveyDescription}
                    onChange={(e) => setSurveyDescription(e.target.value)}
                    placeholder="Descreva o propósito desta pesquisa..."
                  />
                </div>
                
                <Button onClick={createSurvey} className="w-full">
                  Criar Pesquisa
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Nenhuma pesquisa de feedback encontrada.<br />
                Crie sua primeira pesquisa para começar a coletar feedback dos clientes.
              </p>
              <Button onClick={() => setCreatingNewSurvey(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Pesquisa
              </Button>
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de pesquisas de feedback</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">{survey.title}</TableCell>
                    <TableCell>{survey.description || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        survey.status === 'active' ? 'bg-green-100 text-green-800' : 
                        survey.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {survey.status === 'active' ? 'Ativo' : 
                         survey.status === 'completed' ? 'Concluído' : 
                         'Rascunho'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(survey.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <BarChart2 className="mr-2 h-4 w-4" />
                        Análise
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  )
}
