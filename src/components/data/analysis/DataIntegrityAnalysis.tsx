
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react"
import { FixesCard } from "./FixesCard"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface IntegrityMetrics {
  overall: number
  completeness: number
  uniqueness: number
  consistency: number
  recommendations?: {
    type: string
    description: string
    impact: string
    column?: string
  }[]
}

interface DataIntegrityAnalysisProps {
  fileId: string
  tableName?: string
}

export function DataIntegrityAnalysis({ fileId, tableName }: DataIntegrityAnalysisProps) {
  const [metrics, setMetrics] = useState<IntegrityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isApplyingFix, setIsApplyingFix] = useState(false)
  const [appliedFixes, setAppliedFixes] = useState<string[]>([])
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const fetchMetrics = async () => {
    if (!fileId || !currentOrganization) return
    
    setIsLoading(true)
    try {
      // Verificar se já existe uma análise na tabela data_analysis_results
      const { data: existingAnalysis, error: fetchError } = await supabase
        .from('data_analysis_results')
        .select('results')
        .eq('file_id', fileId)
        .eq('analysis_type', 'integrity')
        .eq('column_name', 'all')
        .order('created_at', { ascending: false })
        .limit(1)
      
      // Se existir, usar os dados existentes
      if (!fetchError && existingAnalysis && existingAnalysis.length > 0) {
        console.log('Usando análise existente:', existingAnalysis[0].results)
        setMetrics(existingAnalysis[0].results as IntegrityMetrics)
      } else {
        // Senão, chamar a função Edge para analisar
        console.log('Executando nova análise...')
        const { data, error } = await supabase.functions.invoke('analyze-data-integrity', {
          body: { 
            fileId,
            tableName,
            organizationId: currentOrganization.id 
          }
        })

        if (error) throw error
        
        if (data && data.metrics) {
          setMetrics(data.metrics)
        }
      }
    } catch (error: any) {
      console.error('Erro ao analisar integridade:', error)
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a integridade dos dados.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const applyFix = async (fixType: string, column?: string) => {
    if (!fileId || !currentOrganization) return
    
    setIsApplyingFix(true)
    try {
      const { data, error } = await supabase.functions.invoke('apply-data-fix', {
        body: { 
          fileId,
          fixType,
          column,
          organizationId: currentOrganization.id 
        }
      })

      if (error) throw error
      
      // Adicionar à lista de correções aplicadas
      setAppliedFixes(prev => [...prev, `${fixType}${column ? '-' + column : ''}`])
      
      // Atualizar métricas depois da correção
      await fetchMetrics()
      
      toast({
        title: "Correção aplicada",
        description: data.message || "A correção foi aplicada com sucesso.",
        variant: "default"
      })
      
    } catch (error: any) {
      console.error('Erro ao aplicar correção:', error)
      toast({
        title: "Erro na correção",
        description: error.message || "Não foi possível aplicar a correção.",
        variant: "destructive"
      })
    } finally {
      setIsApplyingFix(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [fileId, currentOrganization])

  const formatPercentage = (value: number) => {
    return `${Math.round(value * 100)}%`
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return "bg-green-500"
    if (score >= 0.6) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Analisando integridade dos dados...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {metrics ? (
        <>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Qualidade dos Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Pontuação Geral</span>
                  <span className={`font-semibold ${getScoreColor(metrics.overall)}`}>
                    {formatPercentage(metrics.overall)}
                  </span>
                </div>
                <Progress 
                  value={metrics.overall * 100} 
                  indicatorClassName={getProgressColor(metrics.overall)} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Completude</span>
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.completeness)}`}>
                    {formatPercentage(metrics.completeness)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Unicidade</span>
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.uniqueness)}`}>
                    {formatPercentage(metrics.uniqueness)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="text-sm">Consistência</span>
                  </div>
                  <span className={`text-sm font-medium ${getScoreColor(metrics.consistency)}`}>
                    {formatPercentage(metrics.consistency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {metrics.recommendations && metrics.recommendations.length > 0 && (
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recomendações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.recommendations.map((rec, index) => (
                    <FixesCard
                      key={`${rec.type}-${rec.column || 'all'}-${index}`}
                      title={rec.description}
                      description={rec.impact}
                      isApplied={appliedFixes.includes(`${rec.type}${rec.column ? '-' + rec.column : ''}`)}
                      isLoading={isApplyingFix}
                      onApply={() => applyFix(rec.type, rec.column)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card className="border-dashed border-muted-foreground/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <Info className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">Sem dados disponíveis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não foi possível analisar a integridade dos dados.
              </p>
              <Button onClick={fetchMetrics} disabled={isLoading}>
                Analisar Dados
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
