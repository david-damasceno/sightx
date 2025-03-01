
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle2, AlertTriangle, XCircle, Info, FileCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface DataIntegrityAnalysisProps {
  fileId: string;
}

interface IntegrityMetrics {
  overall: number;
  completeness: number;
  consistency: number;
  validation: number;
  issues: {
    severity: "high" | "medium" | "low";
    count: number;
    description: string;
    affectedColumns?: string[];
  }[];
  recommendations: {
    id: string;
    description: string;
    impact: "high" | "medium" | "low";
    action: string;
  }[];
}

export function DataIntegrityAnalysis({ fileId }: DataIntegrityAnalysisProps) {
  const [metrics, setMetrics] = useState<IntegrityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [runningFix, setRunningFix] = useState(false);

  useEffect(() => {
    const analyzeIntegrity = async () => {
      try {
        setLoading(true);
        
        // Aqui seria uma chamada para uma função do Supabase
        // const { data, error } = await supabase.functions.invoke('analyze-data-integrity', {
        //   body: { fileId }
        // });
        
        // Se não houver função implementada, usamos dados simulados
        setTimeout(() => {
          const simulatedData: IntegrityMetrics = {
            overall: 0.76,
            completeness: 0.89,
            consistency: 0.72,
            validation: 0.65,
            issues: [
              {
                severity: "high",
                count: 8,
                description: "Valores nulos em colunas críticas",
                affectedColumns: ["Email", "Telefone"]
              },
              {
                severity: "medium",
                count: 12,
                description: "Inconsistência no formato de datas",
                affectedColumns: ["Data de Nascimento", "Data de Cadastro"]
              },
              {
                severity: "low",
                count: 5,
                description: "Possíveis duplicatas baseadas em nome e telefone"
              }
            ],
            recommendations: [
              {
                id: "fill_nulls",
                description: "Preencher valores ausentes em colunas críticas",
                impact: "high",
                action: "Aplicar preenchimento automático ou remover registros incompletos"
              },
              {
                id: "standardize_dates",
                description: "Padronizar formato de datas",
                impact: "medium",
                action: "Converter todas as datas para o formato ISO (YYYY-MM-DD)"
              },
              {
                id: "deduplicate",
                description: "Identificar e remover registros duplicados",
                impact: "medium",
                action: "Usar algorítmo de deduplicação com similaridade de 85%"
              }
            ]
          };
          
          setMetrics(simulatedData);
          setLoading(false);
        }, 1500);

      } catch (error) {
        console.error("Erro ao analisar integridade:", error);
        setLoading(false);
      }
    };

    analyzeIntegrity();
  }, [fileId]);

  const handleFixIssue = async (recommendation: string) => {
    try {
      setRunningFix(true);
      // Simulando uma chamada para correção automática
      // await supabase.functions.invoke('fix-data-issue', {
      //   body: { fileId, recommendation }
      // });
      
      // Simula o tempo de processamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Atualiza as métricas localmente para simular a melhoria
      if (metrics) {
        const updatedMetrics = {...metrics};
        
        // Simular melhorias nas métricas
        if (recommendation === "fill_nulls") {
          updatedMetrics.completeness += 0.08;
          updatedMetrics.overall += 0.05;
          // Remover essa recomendação
          updatedMetrics.recommendations = updatedMetrics.recommendations.filter(r => r.id !== "fill_nulls");
          // Atualizar os problemas
          updatedMetrics.issues = updatedMetrics.issues.filter(i => 
            i.description !== "Valores nulos em colunas críticas"
          );
        }
        
        if (recommendation === "standardize_dates") {
          updatedMetrics.consistency += 0.12;
          updatedMetrics.validation += 0.08;
          updatedMetrics.overall += 0.06;
          updatedMetrics.recommendations = updatedMetrics.recommendations.filter(r => r.id !== "standardize_dates");
          updatedMetrics.issues = updatedMetrics.issues.filter(i => 
            i.description !== "Inconsistência no formato de datas"
          );
        }
        
        if (recommendation === "deduplicate") {
          updatedMetrics.consistency += 0.05;
          updatedMetrics.overall += 0.03;
          updatedMetrics.recommendations = updatedMetrics.recommendations.filter(r => r.id !== "deduplicate");
          updatedMetrics.issues = updatedMetrics.issues.filter(i => 
            i.description !== "Possíveis duplicatas baseadas em nome e telefone"
          );
        }
        
        // Garantir que as métricas não ultrapassem 1.0
        Object.keys(updatedMetrics).forEach(key => {
          if (typeof updatedMetrics[key] === 'number' && updatedMetrics[key] > 1) {
            updatedMetrics[key] = 1;
          }
        });
        
        setMetrics(updatedMetrics);
      }
      
      setRunningFix(false);
    } catch (error) {
      console.error("Erro ao corrigir problema:", error);
      setRunningFix(false);
    }
  };

  const getScoreClass = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressClass = (score: number) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityBadge = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Crítico</Badge>;
      case "medium":
        return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 dark:text-yellow-400"><AlertTriangle className="h-3 w-3" /> Médio</Badge>;
      case "low":
        return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-700 dark:text-blue-400"><Info className="h-3 w-3" /> Baixo</Badge>;
      default:
        return null;
    }
  };

  const getImpactBadge = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return <Badge className="bg-green-600 hover:bg-green-700">Alto Impacto</Badge>;
      case "medium":
        return <Badge variant="secondary">Impacto Médio</Badge>;
      case "low":
        return <Badge variant="outline">Baixo Impacto</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Analisando integridade dos dados...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro na análise</AlertTitle>
        <AlertDescription>
          Não foi possível analisar a integridade dos dados. Tente novamente mais tarde.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Integridade dos Dados</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full cursor-help">
                  <span className={cn("font-medium", getScoreClass(metrics.overall))}>
                    {Math.round(metrics.overall * 100)}%
                  </span>
                  <span className="text-xs text-muted-foreground">Score Geral</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-medium">Como é calculado o score de integridade:</p>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    <li>Completude (40%): Ausência de valores nulos em campos importantes</li>
                    <li>Consistência (35%): Dados seguem o mesmo padrão e formato</li>
                    <li>Validação (25%): Dados estão dentro dos parâmetros esperados</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Análise de qualidade e integridade dos dados importados
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Visão Geral</TabsTrigger>
            <TabsTrigger value="issues" className="text-xs sm:text-sm">Problemas</TabsTrigger>
            <TabsTrigger value="recommendations" className="text-xs sm:text-sm">Recomendações</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-md bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Completude</h4>
                  <span className={cn("text-sm font-medium", getScoreClass(metrics.completeness))}>
                    {Math.round(metrics.completeness * 100)}%
                  </span>
                </div>
                <Progress 
                  value={metrics.completeness * 100} 
                  className="h-2" 
                  indicatorClassName={getProgressClass(metrics.completeness)} 
                />
                <p className="text-xs text-muted-foreground">
                  Análise de campos obrigatórios e valores ausentes
                </p>
              </div>

              <div className="p-4 rounded-md bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Consistência</h4>
                  <span className={cn("text-sm font-medium", getScoreClass(metrics.consistency))}>
                    {Math.round(metrics.consistency * 100)}%
                  </span>
                </div>
                <Progress 
                  value={metrics.consistency * 100} 
                  className="h-2"
                  indicatorClassName={getProgressClass(metrics.consistency)}
                />
                <p className="text-xs text-muted-foreground">
                  Uniformidade de formatos e padrões nos dados
                </p>
              </div>

              <div className="p-4 rounded-md bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Validação</h4>
                  <span className={cn("text-sm font-medium", getScoreClass(metrics.validation))}>
                    {Math.round(metrics.validation * 100)}%
                  </span>
                </div>
                <Progress 
                  value={metrics.validation * 100} 
                  className="h-2"
                  indicatorClassName={getProgressClass(metrics.validation)} 
                />
                <p className="text-xs text-muted-foreground">
                  Conformidade com regras de negócio e domínio
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-md border p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Resumo da Análise</h3>
              </div>

              <div className="space-y-3 text-sm">
                <p>
                  A análise de integridade identificou <span className="font-medium">{metrics.issues.length} problemas</span> que 
                  podem afetar a qualidade dos seus dados. Há {metrics.recommendations.length} recomendações
                  para melhorar a qualidade geral.
                </p>

                <div className="flex flex-wrap gap-2">
                  {metrics.issues.filter(i => i.severity === "high").length > 0 && (
                    <Badge variant="destructive">
                      {metrics.issues.filter(i => i.severity === "high").length} críticos
                    </Badge>
                  )}
                  {metrics.issues.filter(i => i.severity === "medium").length > 0 && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400">
                      {metrics.issues.filter(i => i.severity === "medium").length} médios
                    </Badge>
                  )}
                  {metrics.issues.filter(i => i.severity === "low").length > 0 && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
                      {metrics.issues.filter(i => i.severity === "low").length} baixos
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {metrics.issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Nenhum problema encontrado!</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  Parabéns! Seus dados parecem estar em excelente estado de integridade.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.issues.map((issue, index) => (
                  <div key={index} className={cn(
                    "p-4 rounded-md border",
                    issue.severity === "high" && "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800",
                    issue.severity === "medium" && "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800",
                    issue.severity === "low" && "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {issue.severity === "high" && <XCircle className="h-5 w-5 text-red-500" />}
                        {issue.severity === "medium" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {issue.severity === "low" && <Info className="h-5 w-5 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{issue.description}</h4>
                          {getSeverityBadge(issue.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Afeta {issue.count} {issue.count === 1 ? 'registro' : 'registros'}
                        </p>
                        {issue.affectedColumns && issue.affectedColumns.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {issue.affectedColumns.map((col, i) => (
                              <Badge key={i} variant="outline" className="bg-background">
                                {col}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {metrics.recommendations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Sem recomendações pendentes!</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1">
                  Todos os problemas identificados foram resolvidos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-md border bg-muted/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{rec.description}</h4>
                          {getImpactBadge(rec.impact)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rec.action}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleFixIssue(rec.id)}
                        disabled={runningFix}
                        className="whitespace-nowrap"
                      >
                        {runningFix && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Corrigir Automaticamente
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
