import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface Column {
  name: string
  type: string
  sample: any
}

interface ColumnMapperProps {
  columns: Column[]
  previewData: any[]
  onMappingComplete: (tableName: string) => void
}

export function ColumnMapper({ columns, previewData, onMappingComplete }: ColumnMapperProps) {
  const [tableName, setTableName] = useState("")
  const [columnMappings, setColumnMappings] = useState<Record<string, { description: string, type: string }>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const handleColumnDescriptionChange = (columnName: string, description: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [columnName]: { ...prev[columnName], description }
    }))
  }

  const handleColumnTypeChange = (columnName: string, type: string) => {
    setColumnMappings(prev => ({
      ...prev,
      [columnName]: { ...prev[columnName], type }
    }))
  }

  const handleCreateTable = async () => {
    if (!tableName || !currentOrganization) return

    setIsProcessing(true)
    try {
      const { error } = await supabase.functions.invoke('create-data-table', {
        body: {
          tableName,
          columns: columnMappings,
          organizationId: currentOrganization.id,
          previewData
        }
      })

      if (error) throw error

      toast({
        title: "Tabela criada com sucesso",
        description: "Os dados foram importados e contextualizados.",
      })

      onMappingComplete(tableName)
    } catch (error) {
      console.error('Error creating table:', error)
      toast({
        title: "Erro ao criar tabela",
        description: "Não foi possível criar a tabela. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="table-name">Nome da Tabela</Label>
        <Input
          id="table-name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="Ex: vendas_2024"
          className="mt-1"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Mapeamento de Colunas</h3>
        {columns.map((column) => (
          <div key={column.name} className="grid grid-cols-3 gap-4 items-center">
            <div>
              <Label>Coluna Original</Label>
              <p className="text-sm text-muted-foreground">{column.name}</p>
              <p className="text-xs text-muted-foreground">
                Exemplo: {String(column.sample)}
              </p>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={columnMappings[column.name]?.description || ""}
                onChange={(e) => handleColumnDescriptionChange(column.name, e.target.value)}
                placeholder="Descreva o significado desta coluna"
              />
            </div>
            <div>
              <Label>Tipo de Dado</Label>
              <Select
                value={columnMappings[column.name]?.type || column.type}
                onValueChange={(value) => handleColumnTypeChange(column.name, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="integer">Número Inteiro</SelectItem>
                  <SelectItem value="numeric">Número Decimal</SelectItem>
                  <SelectItem value="boolean">Booleano</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="timestamp">Data e Hora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleCreateTable}
        disabled={!tableName || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processando..." : "Criar Tabela e Importar Dados"}
      </Button>
    </div>
  )
}