
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Loader2, WandSparkles, Fingerprint, Scaling, RefreshCw, FileCheck2, Sparkles, FileCog } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface DataQualityToolsProps {
  fileId: string
  onTransformApplied?: () => void
}

type TransformationType = 
  | "clean_whitespace" 
  | "standardize_case" 
  | "fix_dates" 
  | "standardize_phone" 
  | "remove_duplicates"
  | "fill_missing_values"
  | "normalize_text"

type ValidationRule = {
  id: string
  name: string
  description: string
  column: string
  rule: string
  enabled: boolean
}

export function DataQualityTools({ fileId, onTransformApplied }: DataQualityToolsProps) {
  const [selectedTransformation, setSelectedTransformation] = useState<TransformationType | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string>("")
  const [columns, setColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [transformParameters, setTransformParameters] = useState<Record<string, any>>({})
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [validationResults, setValidationResults] = useState<{
    passed: number
    failed: number
    rules: Record<string, { passed: number, failed: number }>
  } | null>(null)
  const [openDialog, setOpenDialog] = useState<"transform" | "validate" | "rules" | null>(null)
  const { toast } = useToast()

  // Função para carregar as colunas disponíveis
  const loadColumns = async () => {
    try {
      setIsLoading(true)
      
      // Em um cenário real, buscaríamos as colunas do arquivo
      // const { data, error } = await supabase
      //   .from('data_file_columns')
      //   .select('original_name')
      //   .eq('file_id', fileId)
      
      // Simulando colunas
      const sampleColumns = [
        "Nome", "Email", "Telefone", "Data de Cadastro", "Data de Nascimento",
        "Endereço", "Cidade", "Estado", "CEP", "Valor"
      ]
      
      setColumns(sampleColumns)
    } catch (error) {
      console.error("Erro ao carregar colunas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as colunas do arquivo",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar regras de validação existentes
  const loadValidationRules = async () => {
    try {
      setIsLoading(true)
      
      // Em um cenário real, buscaríamos as regras do banco de dados
      // const { data, error } = await supabase
      //   .from('data_validation_rules')
      //   .select('*')
      //   .eq('file_id', fileId)
      
      // Simulando regras de validação
      const sampleRules: ValidationRule[] = [
        {
          id: "rule1",
          name: "Email válido",
          description: "Verifica se os emails estão em formato válido",
          column: "Email",
          rule: "regex:^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$",
          enabled: true
        },
        {
          id: "rule2",
          name: "Telefone formatado",
          description: "Verifica se os telefones estão no formato correto",
          column: "Telefone",
          rule: "regex:^\\(?[1-9]{2}\\)? ?(?:[2-8]|9[1-9])[0-9]{3}\\-?[0-9]{4}$",
          enabled: true
        },
        {
          id: "rule3",
          name: "Data de nascimento válida",
          description: "Verifica se a data está no passado e é válida",
          column: "Data de Nascimento",
          rule: "date_past",
          enabled: false
        }
      ]
      
      setValidationRules(sampleRules)
    } catch (error) {
      console.error("Erro ao carregar regras de validação:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Executar quando o componente é montado ou o fileId muda
  useState(() => {
    if (fileId) {
      loadColumns()
      loadValidationRules()
    }
  })

  const applyTransformation = async () => {
    if (!selectedTransformation || !selectedColumn) {
      toast({
        title: "Informações incompletas",
        description: "Selecione uma transformação e uma coluna para continuar",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      // Simulando o processamento da transformação
      // Em um cenário real, chamaríamos uma função do Supabase
      // await supabase.functions.invoke('apply-data-transformation', {
      //   body: { 
      //     fileId, 
      //     transformation: selectedTransformation, 
      //     column: selectedColumn,
      //     parameters: transformParameters 
      //   }
      // })
      
      // Simulando uma espera
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Transformação aplicada",
        description: `A transformação foi aplicada com sucesso na coluna ${selectedColumn}`,
      })
      
      // Se houver um callback, notifica o componente pai
      if (onTransformApplied) {
        onTransformApplied()
      }
      
      // Limpa os estados
      setSelectedTransformation(null)
      setSelectedColumn("")
      setTransformParameters({})
      setOpenDialog(null)
      
    } catch (error) {
      console.error("Erro ao aplicar transformação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aplicar a transformação",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const runValidation = async () => {
    try {
      setIsValidating(true)
      
      // Simulando o processo de validação
      // Em um cenário real, chamaríamos uma função do Supabase
      // const { data, error } = await supabase.functions.invoke('validate-data', {
      //   body: { fileId, rules: validationRules.filter(r => r.enabled) }
      // })
      
      // Simulando uma espera e resultado
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Resultado simulado
      const results = {
        passed: 92,
        failed: 8,
        rules: {
          "rule1": { passed: 95, failed: 5 },
          "rule2": { passed: 88, failed: 12 },
          "rule3": { passed: 100, failed: 0 }
        }
      }
      
      setValidationResults(results)
      
      toast({
        title: "Validação concluída",
        description: `${results.passed} registros aprovados e ${results.failed} com falhas`,
      })
      
    } catch (error) {
      console.error("Erro na validação:", error)
      toast({
        title: "Erro",
        description: "Não foi possível executar a validação",
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  }

  const addValidationRule = (rule: ValidationRule) => {
    setValidationRules(prev => [...prev, rule])
  }

  const toggleRuleStatus = (ruleId: string) => {
    setValidationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled } 
          : rule
      )
    )
  }

  const deleteRule = (ruleId: string) => {
    setValidationRules(prev => prev.filter(rule => rule.id !== ruleId))
  }

  // Renderiza os parâmetros específicos para cada tipo de transformação
  const renderTransformationParameters = () => {
    switch (selectedTransformation) {
      case "standardize_case":
        return (
          <div className="space-y-4 mt-4">
            <Label htmlFor="case_type">Tipo de padronização:</Label>
            <Select 
              value={transformParameters.case_type || ""}
              onValueChange={(value) => setTransformParameters({...transformParameters, case_type: value})}
            >
              <SelectTrigger id="case_type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upper">MAIÚSCULAS</SelectItem>
                <SelectItem value="lower">minúsculas</SelectItem>
                <SelectItem value="title">Primeira Letra Maiúscula</SelectItem>
                <SelectItem value="sentence">Primeira letra da frase</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
        
      case "fill_missing_values":
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fill_strategy">Estratégia:</Label>
              <Select 
                value={transformParameters.fill_strategy || ""}
                onValueChange={(value) => setTransformParameters({...transformParameters, fill_strategy: value})}
              >
                <SelectTrigger id="fill_strategy">
                  <SelectValue placeholder="Selecione a estratégia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Valor fixo</SelectItem>
                  <SelectItem value="mean">Média (campos numéricos)</SelectItem>
                  <SelectItem value="median">Mediana (campos numéricos)</SelectItem>
                  <SelectItem value="mode">Moda (valor mais frequente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {transformParameters.fill_strategy === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixed_value">Valor para preenchimento:</Label>
                <Input 
                  id="fixed_value"
                  value={transformParameters.fixed_value || ""}
                  onChange={(e) => setTransformParameters({...transformParameters, fixed_value: e.target.value})}
                  placeholder="Digite o valor a ser usado"
                />
              </div>
            )}
          </div>
        )
        
      case "normalize_text":
        return (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remove_accents" 
                  checked={transformParameters.remove_accents || false}
                  onChange={(e) => setTransformParameters({...transformParameters, remove_accents: e.target.checked})}
                />
                <Label htmlFor="remove_accents">Remover acentos</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remove_special" 
                  checked={transformParameters.remove_special || false}
                  onChange={(e) => setTransformParameters({...transformParameters, remove_special: e.target.checked})}
                />
                <Label htmlFor="remove_special">Remover caracteres especiais</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="trim_spaces" 
                  checked={transformParameters.trim_spaces || false}
                  onChange={(e) => setTransformParameters({...transformParameters, trim_spaces: e.target.checked})}
                />
                <Label htmlFor="trim_spaces">Remover espaços em excesso</Label>
              </div>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  const transformationOptions = [
    { value: "clean_whitespace", label: "Limpar espaços em branco", icon: <Sparkles className="h-4 w-4" /> },
    { value: "standardize_case", label: "Padronizar maiúsculas/minúsculas", icon: <Scaling className="h-4 w-4" /> },
    { value: "fix_dates", label: "Corrigir formatos de data", icon: <RefreshCw className="h-4 w-4" /> },
    { value: "standardize_phone", label: "Padronizar telefones", icon: <FileCog className="h-4 w-4" /> },
    { value: "remove_duplicates", label: "Remover duplicatas", icon: <Fingerprint className="h-4 w-4" /> },
    { value: "fill_missing_values", label: "Preencher valores ausentes", icon: <FileCheck2 className="h-4 w-4" /> },
    { value: "normalize_text", label: "Normalizar texto", icon: <WandSparkles className="h-4 w-4" /> }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {/* Botão para transformações */}
        <Dialog open={openDialog === "transform"} onOpenChange={(open) => setOpenDialog(open ? "transform" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <WandSparkles className="h-4 w-4" />
              Transformações
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Aplicar Transformação</DialogTitle>
              <DialogDescription>
                Selecione uma coluna e o tipo de transformação que deseja aplicar para melhorar a qualidade dos dados.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="column">Coluna:</Label>
                <Select 
                  value={selectedColumn}
                  onValueChange={setSelectedColumn}
                  disabled={isLoading}
                >
                  <SelectTrigger id="column">
                    <SelectValue placeholder="Selecione uma coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transformation">Transformação:</Label>
                <Select 
                  value={selectedTransformation || ""}
                  onValueChange={(value) => setSelectedTransformation(value as TransformationType)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="transformation">
                    <SelectValue placeholder="Selecione uma transformação" />
                  </SelectTrigger>
                  <SelectContent>
                    {transformationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedTransformation && renderTransformationParameters()}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog(null)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={applyTransformation}
                disabled={!selectedTransformation || !selectedColumn || isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aplicar Transformação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Botão para validação */}
        <Dialog open={openDialog === "validate"} onOpenChange={(open) => setOpenDialog(open ? "validate" : null)}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileCheck2 className="h-4 w-4" />
              Validar Dados
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Validação de Dados</DialogTitle>
              <DialogDescription>
                Execute a validação dos dados de acordo com as regras configuradas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium">Regras de Validação Ativas</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenDialog("rules")}
                  >
                    Gerenciar Regras
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Regra</TableHead>
                        <TableHead>Coluna</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.name}</TableCell>
                          <TableCell>{rule.column}</TableCell>
                          <TableCell>
                            <Badge variant={rule.enabled ? "default" : "outline"}>
                              {rule.enabled ? "Ativa" : "Inativa"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {validationRules.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                            Nenhuma regra de validação configurada
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {validationResults && (
                  <div className="space-y-4 mt-6">
                    <h4 className="text-sm font-medium">Resultados da Validação</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Registros validados:</span>
                        <span className="font-medium">{validationResults.passed + validationResults.failed}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Taxa de aprovação:</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            {Math.round((validationResults.passed / (validationResults.passed + validationResults.failed)) * 100)}%
                          </Badge>
                        </div>
                        <span className="font-medium text-green-600">{validationResults.passed} aprovados</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Falhas na validação:</span>
                        <span className="font-medium text-red-600">{validationResults.failed} falhas</span>
                      </div>
                      
                      <Progress 
                        value={(validationResults.passed / (validationResults.passed + validationResults.failed)) * 100} 
                        className="h-2 mt-2" 
                      />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <h5 className="text-sm font-medium">Detalhes por regra:</h5>
                      
                      {Object.entries(validationResults.rules).map(([ruleId, result]) => {
                        const rule = validationRules.find(r => r.id === ruleId)
                        if (!rule) return null
                        
                        const total = result.passed + result.failed
                        const passRate = (result.passed / total) * 100
                        
                        return (
                          <div key={ruleId} className="p-3 border rounded-md bg-muted/20">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-sm">{rule.name}</span>
                              <Badge variant={passRate >= 90 ? "default" : passRate >= 70 ? "secondary" : "destructive"}>
                                {Math.round(passRate)}%
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {rule.description}
                            </div>
                            <Progress value={passRate} className="h-1.5" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                onClick={runValidation}
                disabled={validationRules.filter(r => r.enabled).length === 0 || isValidating}
              >
                {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {validationResults ? "Executar Novamente" : "Executar Validação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Modal para gerenciar regras */}
        <Dialog open={openDialog === "rules"} onOpenChange={(open) => setOpenDialog(open ? "rules" : null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Gerenciar Regras de Validação</DialogTitle>
              <DialogDescription>
                Configure regras para validar a qualidade dos dados.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="border rounded-md max-h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Regra</TableHead>
                      <TableHead>Coluna</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.column}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              checked={rule.enabled} 
                              onChange={() => toggleRuleStatus(rule.id)} 
                              className="mr-2 h-4 w-4 rounded border-gray-300"
                            />
                            <span>{rule.enabled ? "Ativa" : "Inativa"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteRule(rule.id)}
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Excluir</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {validationRules.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          Nenhuma regra configurada
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Formulário para adicionar nova regra */}
              <div className="border rounded-md p-4 space-y-4 mt-4">
                <h4 className="text-sm font-medium">Adicionar Nova Regra</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rule_name">Nome da Regra:</Label>
                    <Input id="rule_name" placeholder="Ex: Email válido" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rule_column">Coluna:</Label>
                    <Select>
                      <SelectTrigger id="rule_column">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {columns.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule_type">Tipo de Validação:</Label>
                  <Select>
                    <SelectTrigger id="rule_type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regex">Expressão Regular</SelectItem>
                      <SelectItem value="required">Campo Obrigatório</SelectItem>
                      <SelectItem value="min_length">Tamanho Mínimo</SelectItem>
                      <SelectItem value="max_length">Tamanho Máximo</SelectItem>
                      <SelectItem value="range">Intervalo Numérico</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rule_description">Descrição:</Label>
                  <Textarea 
                    id="rule_description" 
                    placeholder="Descreva o propósito desta regra de validação"
                    rows={2}
                  />
                </div>
                
                <Button className="w-full">
                  Adicionar Regra
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setOpenDialog("validate")}
              >
                Voltar para Validação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
