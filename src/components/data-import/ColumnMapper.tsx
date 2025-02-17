import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnSuggestions } from "./ColumnSuggestions"

interface Column {
  name: string
  type: string
  sample: any
}

interface ColumnMapperProps {
  fileId: string
  columns: Column[]
  previewData: any[]
  onMappingComplete: (tableName: string, previewData: any) => void
  onCancel?: () => void
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error'
  tableName?: string
  errorMessage?: string
}

export function ColumnMapper({ 
  fileId,
  columns, 
  previewData, 
  onMappingComplete, 
  onCancel,
  processingStatus = 'pending',
  tableName,
  errorMessage
}: ColumnMapperProps) {
  const [tableNameInput, setTableNameInput] = useState(tableName || "")
  const [columnMappings, setColumnMappings] = useState<Record<string, { description: string, type: string, validation?: string[] }>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  useEffect(() => {
    if (processingStatus === 'processing' && tableName) {
      const interval = setInterval(async () => {
        const { data, error } = await supabase
          .from('data_processing_results')
          .select('progress, status, error_message')
          .eq('table_name', tableName)
          .single()

        if (error) {
          console.error('Erro ao buscar progresso:', error)
          return
        }

        if (data) {
          setProgress(data.progress || 0)
          
          if (data.status === 'completed') {
            clearInterval(interval)
            onMappingComplete(tableName, previewData)
          } else if (data.status === 'error') {
            clearInterval(interval)
            toast({
              title: "Erro no processamento",
              description: data.error_message || "Ocorreu um erro ao processar os dados",
              variant: "destructive",
            })
          }
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [processingStatus, tableName])

  const dataTypes = [
    // Texto
    { value: "character varying", label: "Texto Variável (VARCHAR)" },
    { value: "text", label: "Texto Longo (TEXT)" },
    { value: "char", label: "Texto Fixo (CHAR)" },
    
    // Números
    { value: "smallint", label: "Número Inteiro Pequeno (-32768 a 32767)" },
    { value: "integer", label: "Número Inteiro (-2147483648 a 2147483647)" },
    { value: "bigint", label: "Número Inteiro Grande" },
    { value: "decimal", label: "Decimal (Precisão Exata)" },
    { value: "numeric", label: "Numérico (Precisão Exata)" },
    { value: "real", label: "Número Real (Precisão Aproximada)" },
    { value: "double precision", label: "Número Real Duplo (Precisão Aproximada)" },
    
    // Data/Hora
    { value: "date", label: "Data" },
    { value: "time", label: "Hora" },
    { value: "timestamp", label: "Data e Hora" },
    { value: "timestamp with time zone", label: "Data e Hora com Fuso" },
    { value: "interval", label: "Intervalo de Tempo" },
    
    // Outros
    { value: "boolean", label: "Booleano (Verdadeiro/Falso)" },
    { value: "uuid", label: "UUID" },
    { value: "jsonb", label: "JSON" },
    { value: "ARRAY", label: "Array" }
  ]

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

  const handleSuggestionsApplied = (suggestions: { [key: string]: string }) => {
    const newMappings: Record<string, { description: string, type: string }> = {}
    Object.entries(suggestions).forEach(([originalName, suggestedName]) => {
      const sampleValue = String(columns.find(c => c.name === originalName)?.sample || '')
      const inferredType = inferColumnType(sampleValue)
      
      newMappings[suggestedName] = { 
        description: "", 
        type: inferredType || "text"
      }
    })
    setColumnMappings(newMappings)
    setShowSuggestions(false)
  }

  const inferColumnType = (sampleValue: string): string => {
    // Inferência básica de tipos
    if (!sampleValue) return "text"
    
    // Tenta converter para número
    if (!isNaN(Number(sampleValue))) {
      if (sampleValue.includes('.')) return "numeric"
      const num = parseInt(sampleValue)
      if (num >= -32768 && num <= 32767) return "smallint"
      if (num >= -2147483648 && num <= 2147483647) return "integer"
      return "bigint"
    }
    
    // Tenta converter para data
    const date = new Date(sampleValue)
    if (!isNaN(date.getTime())) {
      if (sampleValue.includes(':')) return "timestamp with time zone"
      return "date"
    }
    
    // Verifica se é booleano
    const booleanValues = ['true', 'false', 't', 'f', 'yes', 'no', 'sim', 'não', '1', '0']
    if (booleanValues.includes(sampleValue.toLowerCase())) return "boolean"
    
    // Se nada mais servir, usa text
    return "text"
  }

  const handleCreateTable = async () => {
    if (!tableNameInput || !currentOrganization) return

    setIsProcessing(true)
    try {
      console.log('Enviando dados para criar tabela:', {
        tableName: tableNameInput,
        columns: columnMappings,
        previewData
      })

      const { data, error } = await supabase.functions.invoke('create-data-table', {
        body: {
          tableName: tableNameInput,
          columns: columnMappings,
          organizationId: currentOrganization.id,
          previewData,
          columnAnalysis: [],
          suggestedIndexes: [],
          dataValidation: {}
        }
      })

      if (error) throw error

      console.log('Resposta da criação da tabela:', data)

      toast({
        title: "Tabela criada com sucesso",
        description: "Os dados foram importados e contextualizados.",
      })

      onMappingComplete(tableNameInput, previewData)
    } catch (error: any) {
      console.error('Error creating table:', error)
      toast({
        title: "Erro ao criar tabela",
        description: error.message || "Não foi possível criar a tabela. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {showSuggestions ? (
        <ColumnSuggestions
          columns={columns.map(c => c.name)}
          sampleData={previewData}
          onSuggestionsApplied={handleSuggestionsApplied}
          onCancel={onCancel}
          onContinue={() => setShowSuggestions(false)}
        />
      ) : (
        <>
          <div>
            <Label htmlFor="table-name">Nome da Tabela</Label>
            <Input
              id="table-name"
              value={tableNameInput}
              onChange={(e) => setTableNameInput(e.target.value)}
              placeholder="Ex: vendas_2024"
              className="mt-1"
              disabled={isProcessing}
            />
          </div>

          {(processingStatus === 'processing' || isProcessing) && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando dados...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium">Mapeamento de Colunas</h3>
            {columns.map((column) => (
              <div key={column.name} className="grid grid-cols-3 gap-4 items-start p-4 rounded-lg border hover:bg-accent/5">
                <div>
                  <Label>Coluna Original</Label>
                  <p className="text-sm text-muted-foreground">{column.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exemplo: {String(column.sample)}
                  </p>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={columnMappings[column.name]?.description || ""}
                    onChange={(e) => handleColumnDescriptionChange(column.name, e.target.value)}
                    placeholder="Descreva o significado desta coluna"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label>Tipo de Dado</Label>
                  <Select
                    value={columnMappings[column.name]?.type || column.type}
                    onValueChange={(value) => handleColumnTypeChange(column.name, value)}
                    disabled={isProcessing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={!tableNameInput || isProcessing}
            >
              {isProcessing ? "Processando..." : "Criar Tabela e Importar Dados"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
