
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info,
  BarChart4,
  Database,
  Shield,
  FileCheck
} from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

interface DataIntegrityAnalysisProps {
  fileId: string;
}

export function DataIntegrityAnalysis({ fileId }: DataIntegrityAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [integrityScore, setIntegrityScore] = useState<number>(0)
  const [completeness, setCompleteness] = useState<number>(0)
  const [consistencyScore, setConsistencyScore] = useState<number>(0)
  const [validationScore, setValidationScore] = useState<number>(0)
  const [integrityStatus, setIntegrityStatus] = useState<'high' | 'medium' | 'low'>('medium')
  const { currentOrganization } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const analyzeDataIntegrity = async () => {
      try {
        if (!fileId || !currentOrganization) return
        
        setLoading(true)
        
        // Em um cenário real, isso chamaria uma função do Supabase para analisar a integridade dos dados
        // Por enquanto, simularemos dados de integridade
        
        // Simulação de chamada de API:
        // const { data, error } = await supabase.functions.invoke('analyze-data-integrity', {
        //   body: { fileId, organizationId: currentOrganization.id }
        // })
        
        // if (error) throw error
        
        // Para demonstração, usaremos valores simulados
        const simulatedData = {
          integrityScore: 0.85,
          completeness: 0.92,
          consistencyScore: 0.78,
          validationScore: 0.88,
          integrityStatus: 'medium' as 'high' | 'medium' | 'low'
        }
        
        // Simula um pouco de delay para parecer uma chamada real
        setTimeout(() => {
          setIntegrityScore(simulatedData.integrityScore)
          setCompleteness(simulatedData.completeness)
          setConsistencyScore(simulatedData.consistencyScore)
          setValidationScore(simulatedData.validationScore)
          setIntegrityStatus(simulatedData.integrityStatus)
          setLoading(false)
        }, 1500)
        
      } catch (error: any) {
        console.error("Erro ao analisar integridade dos dados:", error)
        toast({
          title: "Erro na análise",
          description: "Não foi possível analisar a integridade dos dados.",
          variant: "destructive"
        })
        setLoading(false)
      }
    }
    
    analyzeDataIntegrity()
  }, [fileId, currentOrganization])

  const getStatusIcon = (status: 'high' | 'medium' | 'low') => {
    switch (status) {
      case 'high':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'low':
        return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusColor = (value: number) => {
    if (value >= 0.85) return "bg-green-500"
    if (value >= 0.7) return "bg-amber-500"
    return "bg-red-500"
  }

  const getStatusLabel = (status: 'high' | 'medium' | 'low') => {
    switch (status) {
      case 'high':
        return "Alta Integridade"
      case 'medium':
        return "Integridade Média"
      case 'low':
        return "Baixa Integridade"
    }
  }

  const getStatusBadge = (value: number) => {
    if (value >= 0.85) return "success"
    if (value >= 0.7) return "warning" 
    return "destructive"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-medium">Integridade dos Dados</h3>
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-md" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-medium">Integridade dos Dados</h3>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(integrityStatus)}
          <Badge variant={getStatusBadge(integrityScore) as "default" | "secondary" | "destructive" | "outline"}>
            {getStatusLabel(integrityStatus)}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-medium">Integridade Geral</h4>
                </div>
                <Badge variant={getStatusBadge(integrityScore) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {Math.round(integrityScore * 100)}%
                </Badge>
              </div>
              <Progress value={integrityScore * 100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground mt-auto">
                Score geral de qualidade
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-medium">Completude</h4>
                </div>
                <Badge variant={getStatusBadge(completeness) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {Math.round(completeness * 100)}%
                </Badge>
              </div>
              <Progress value={completeness * 100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground mt-auto">
                Ausência de valores nulos
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart4 className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-medium">Consistência</h4>
                </div>
                <Badge variant={getStatusBadge(consistencyScore) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {Math.round(consistencyScore * 100)}%
                </Badge>
              </div>
              <Progress value={consistencyScore * 100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground mt-auto">
                Padrões consistentes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-medium">Validação</h4>
                </div>
                <Badge variant={getStatusBadge(validationScore) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {Math.round(validationScore * 100)}%
                </Badge>
              </div>
              <Progress value={validationScore * 100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground mt-auto">
                Validação de formatos
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 mt-2 cursor-help">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">O que é integridade de dados?</p>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">
              A integridade dos dados refere-se à precisão, consistência e confiabilidade dos dados ao longo do seu ciclo de vida. 
              Inclui completude (ausência de valores em branco), consistência (padrões uniformes) e validação (conformidade com regras).
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
