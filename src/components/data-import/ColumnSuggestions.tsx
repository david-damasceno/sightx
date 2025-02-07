
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Check, X, ArrowRight, Wand2, Loader2, AlertTriangle } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ColumnSuggestion {
  original_name: string
  suggested_name: string
  type: string
  description: string
  needs_review?: boolean
  validation_message?: string
}

interface ColumnSuggestionsProps {
  columns: string[]
  sampleData: any[]
  onSuggestionsApplied: (suggestions: { [key: string]: string }) => void
  onCancel: () => void
  onContinue: () => void
}

export function ColumnSuggestions({ 
  columns, 
  sampleData, 
  onSuggestionsApplied, 
  onCancel,
  onContinue 
}: ColumnSuggestionsProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<ColumnSuggestion[]>([])
  const [customNames, setCustomNames] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()
  const { session } = useAuth()

  const handleGetSuggestions = async () => {
    if (!description) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, forneça uma descrição dos dados para obter sugestões.",
        variant: "destructive",
      })
      return
    }

    if (!session) {
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar autenticado para usar esta funcionalidade.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('suggest-column-names', {
        body: {
          description,
          columns,
          sampleData: sampleData?.slice(0, 5) || []
        },
      })

      if (error) {
        console.error('Erro ao obter sugestões:', error)
        throw error
      }

      if (!data?.suggestions) {
        throw new Error('Resposta inválida da API')
      }

      setSuggestions(data.suggestions)
      
      // Inicializa os nomes customizados com as sugestões
      const initialCustomNames = data.suggestions.reduce((acc: any, curr: ColumnSuggestion) => {
        acc[curr.original_name] = curr.suggested_name
        return acc
      }, {})
      setCustomNames(initialCustomNames)

    } catch (error: any) {
      console.error('Erro detalhado:', error)
      toast({
        title: "Erro ao obter sugestões",
        description: error.message || "Não foi possível obter sugestões para as colunas. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomNameChange = (originalName: string, newName: string) => {
    setCustomNames(prev => ({
      ...prev,
      [originalName]: newName
    }))
  }

  const handleAcceptAll = () => {
    onSuggestionsApplied(customNames)
  }

  const handleAcceptSuggestion = (suggestion: ColumnSuggestion) => {
    handleCustomNameChange(suggestion.original_name, suggestion.suggested_name)
  }

  const handleRejectSuggestion = (originalName: string) => {
    handleCustomNameChange(originalName, originalName)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sugestões de Nomes para Colunas</CardTitle>
        <CardDescription>
          Descreva o conteúdo dos dados para receber sugestões de nomes mais descritivos para as colunas.
          Os nomes serão validados de acordo com as regras do PostgreSQL.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição dos Dados</Label>
          <Textarea
            id="description"
            placeholder="Ex: Esta planilha contém dados de vendas mensais por região, incluindo produtos vendidos, valores e informações dos clientes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleGetSuggestions}
            disabled={isLoading || !description}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando sugestões...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Obter Sugestões
              </>
            )}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Sugestões Geradas</h3>
              <Button onClick={handleAcceptAll} variant="outline" className="gap-2">
                <Check className="h-4 w-4" />
                Aplicar Todos
              </Button>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.original_name}
                  className={`p-4 border rounded-lg space-y-2 hover:bg-accent/5 transition-colors ${
                    suggestion.needs_review ? 'border-yellow-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{suggestion.original_name}</p>
                        {suggestion.needs_review && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{suggestion.validation_message}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tipo sugerido: {suggestion.type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                        className="hover:text-green-500"
                        title="Aceitar sugestão"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRejectSuggestion(suggestion.original_name)}
                        className="hover:text-red-500"
                        title="Rejeitar sugestão"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Input
                    value={customNames[suggestion.original_name] || suggestion.original_name}
                    onChange={(e) => handleCustomNameChange(suggestion.original_name, e.target.value)}
                    className={`mt-2 ${suggestion.needs_review ? 'border-yellow-500' : ''}`}
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                  
                  {suggestion.needs_review && (
                    <p className="text-sm text-yellow-600">
                      {suggestion.validation_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancelar
        </Button>
        <Button onClick={onContinue} className="gap-2">
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
