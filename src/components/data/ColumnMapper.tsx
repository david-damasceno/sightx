
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wand2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface Column {
  name: string
  type: string
  sample: any
}

interface ColumnMapperProps {
  fileId: string
  columns: Column[]
  onMappingComplete: () => void
}

export function ColumnMapper({ fileId, columns, onMappingComplete }: ColumnMapperProps) {
  const [mappings, setMappings] = useState<Record<string, { 
    mappedName: string
    dataType: string 
  }>>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Inicializar mapeamentos com valores padrão
    const initialMappings: Record<string, { mappedName: string; dataType: string }> = {}
    columns.forEach(col => {
      initialMappings[col.name] = {
        mappedName: col.name,
        dataType: col.type
      }
    })
    setMappings(initialMappings)
  }, [columns])

  const handleSuggestions = async () => {
    try {
      const response = await fetch('/api/suggest-column-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          columns: columns.map(c => ({
            name: c.name,
            type: c.type,
            sample: c.sample
          }))
        })
      })

      if (!response.ok) throw new Error('Falha ao obter sugestões')

      const suggestions = await response.json()

      setMappings(prev => {
        const newMappings = { ...prev }
        Object.keys(suggestions).forEach(originalName => {
          if (newMappings[originalName]) {
            newMappings[originalName].mappedName = suggestions[originalName]
          }
        })
        return newMappings
      })

      toast({
        title: "Sugestões aplicadas",
        description: "Os nomes das colunas foram atualizados com base nas sugestões.",
      })
    } catch (error) {
      console.error('Erro ao obter sugestões:', error)
      toast({
        title: "Erro",
        description: "Não foi possível obter sugestões para os nomes das colunas.",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      const mappingsArray = Object.entries(mappings).map(([originalName, mapping]) => ({
        file_id: fileId,
        original_name: originalName,
        mapped_name: mapping.mappedName,
        data_type: mapping.dataType,
      }))

      const { error } = await supabase
        .from('column_mappings')
        .upsert(mappingsArray)

      if (error) throw error

      toast({
        title: "Mapeamento salvo",
        description: "As configurações de colunas foram salvas com sucesso.",
      })

      onMappingComplete()
    } catch (error) {
      console.error('Erro ao salvar mapeamento:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o mapeamento das colunas.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Mapeamento de Colunas</h2>
          <p className="text-sm text-muted-foreground">
            Configure como seus dados serão importados
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSuggestions}
            className="flex items-center gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Sugerir Nomes
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Mapeamento"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {columns.map((column) => (
          <Card key={column.name} className="p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Original</Label>
                <div className="flex items-center gap-2">
                  <Input value={column.name} disabled />
                  <Badge variant="secondary">
                    {column.type}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nome no Sistema</Label>
                <div className="flex gap-2">
                  <Input
                    value={mappings[column.name]?.mappedName || ''}
                    onChange={(e) => setMappings(prev => ({
                      ...prev,
                      [column.name]: {
                        ...prev[column.name],
                        mappedName: e.target.value
                      }
                    }))}
                  />
                  <Select
                    value={mappings[column.name]?.dataType}
                    onValueChange={(value) => setMappings(prev => ({
                      ...prev,
                      [column.name]: {
                        ...prev[column.name],
                        dataType: value
                      }
                    }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tipo de dado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="number">Número</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="boolean">Booleano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
