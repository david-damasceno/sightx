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
} from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Check, X } from "lucide-react"

interface ColumnSuggestion {
  original_name: string
  suggested_name: string
  type: string
  description: string
}

interface ColumnSuggestionsProps {
  columns: string[]
  sampleData: any[]
  onSuggestionsApplied: (suggestions: { [key: string]: string }) => void
}

export function ColumnSuggestions({ columns, sampleData, onSuggestionsApplied }: ColumnSuggestionsProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<ColumnSuggestion[]>([])
  const [customNames, setCustomNames] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  const handleGetSuggestions = async () => {
    if (!description) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, forneça uma descrição dos dados para obter sugestões.",
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
          sampleData: sampleData.slice(0, 10)
        },
      })

      if (error) throw error

      setSuggestions(data.suggestions)
      
      // Inicializa os nomes customizados com as sugestões
      const initialCustomNames = data.suggestions.reduce((acc: any, curr: ColumnSuggestion) => {
        acc[curr.original_name] = curr.suggested_name
        return acc
      }, {})
      setCustomNames(initialCustomNames)

    } catch (error) {
      console.error('Error getting suggestions:', error)
      toast({
        title: "Erro ao obter sugestões",
        description: "Não foi possível obter sugestões para as colunas. Tente novamente.",
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
          Descreva o conteúdo dos dados para receber sugestões de nomes mais descritivos para as colunas
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
            className="w-full"
          >
            {isLoading ? "Gerando sugestões..." : "Obter Sugestões"}
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Sugestões Geradas</h3>
              <Button onClick={handleAcceptAll} variant="outline">
                Aplicar Todos
              </Button>
            </div>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.original_name}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{suggestion.original_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo sugerido: {suggestion.type}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAcceptSuggestion(suggestion)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRejectSuggestion(suggestion.original_name)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  
                  <Input
                    value={customNames[suggestion.original_name] || suggestion.original_name}
                    onChange={(e) => handleCustomNameChange(suggestion.original_name, e.target.value)}
                    className="mt-2"
                  />
                  
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}