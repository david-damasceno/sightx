
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowRight, Check, AlertTriangle, XCircle, BadgeCheck, AlarmClock, ListFilter } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ColumnQuality, DataQuality } from '@/types/data-imports';

interface QualityAnalysisProps {
  fileId: string;
  tableName: string;
  onComplete: () => void;
}

export function QualityAnalysis({ fileId, tableName, onComplete }: QualityAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [qualityData, setQualityData] = useState<DataQuality | null>(null);
  const [columnsList, setColumnsList] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchQualityData = async () => {
      try {
        setLoading(true);
        const { data: fileData, error } = await supabase
          .from('data_imports')
          .select('data_quality')
          .eq('id', fileId)
          .single();

        if (error) throw error;

        if (fileData && fileData.data_quality && 
            typeof fileData.data_quality === 'object' && 
            'columnQuality' in fileData.data_quality) {
          setQualityData(fileData.data_quality as unknown as DataQuality);
          
          // Extrair lista de colunas do objeto columnQuality
          if (fileData.data_quality.columnQuality) {
            setColumnsList(Object.keys(fileData.data_quality.columnQuality));
          }
        }
      } catch (error: any) {
        console.error("Erro ao buscar dados de qualidade:", error);
        toast({
          title: "Erro",
          description: error.message || "Não foi possível carregar os dados de qualidade",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      fetchQualityData();
    }
  }, [fileId, toast]);

  const analyzeDataQuality = async () => {
    try {
      setAnalyzing(true);
      toast({
        title: "Analisando qualidade dos dados",
        description: "Isso pode levar alguns segundos...",
      });

      const { data, error } = await supabase.functions.invoke('analyze-data-quality', {
        body: { 
          fileId,
          tableName
        }
      });

      if (error) throw error;

      if (data && data.dataQuality) {
        // Atualizar o objeto no banco de dados
        const { error: updateError } = await supabase
          .from('data_imports')
          .update({ data_quality: data.dataQuality })
          .eq('id', fileId);

        if (updateError) throw updateError;

        setQualityData(data.dataQuality as DataQuality);
        
        if (data.dataQuality.columnQuality) {
          setColumnsList(Object.keys(data.dataQuality.columnQuality));
        }

        toast({
          title: "Análise concluída",
          description: "A qualidade dos dados foi analisada com sucesso!",
        });
      }
    } catch (error: any) {
      console.error("Erro ao analisar qualidade:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível analisar a qualidade dos dados",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"; // verde
    if (score >= 60) return "#f59e0b"; // amarelo
    return "#ef4444"; // vermelho
  };

  const getQualityStatus = (quality: ColumnQuality) => {
    const avg = (quality.completeness + quality.uniqueness + quality.validFormat) / 3;
    if (avg >= 80) return { icon: <BadgeCheck className="h-5 w-5 text-emerald-500" />, text: "Boa" };
    if (avg >= 60) return { icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, text: "Média" };
    return { icon: <XCircle className="h-5 w-5 text-red-500" />, text: "Baixa" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Análise de Qualidade dos Dados</CardTitle>
          <CardDescription>
            Avalie a qualidade dos dados importados para identificar possíveis problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!qualityData ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma análise de qualidade foi realizada ainda. Clique no botão abaixo para analisar a qualidade dos seus dados.
              </p>
              <Button 
                onClick={analyzeDataQuality} 
                disabled={analyzing}
                className="space-x-2"
              >
                {analyzing ? (
                  <>
                    <AlarmClock className="h-4 w-4 animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <ListFilter className="h-4 w-4" />
                    <span>Analisar Qualidade dos Dados</span>
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Métricas Gerais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Completude</p>
                      <div className="mt-2 relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ 
                              width: `${qualityData.overallCompleteness}%`,
                              backgroundColor: getScoreColor(qualityData.overallCompleteness)
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                          ></div>
                        </div>
                        <p className="text-xl font-bold mt-1">{qualityData.overallCompleteness}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Qualidade Geral</p>
                      <div className="mt-2 relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ 
                              width: `${qualityData.overallQuality}%`,
                              backgroundColor: getScoreColor(qualityData.overallQuality)
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center"
                          ></div>
                        </div>
                        <p className="text-xl font-bold mt-1">{qualityData.overallQuality}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">Problemas Encontrados</p>
                      <p className="text-xl font-bold mt-3">{qualityData.issuesCount}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Qualidade por Coluna */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Qualidade por Coluna</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={columnsList.map(column => {
                          const quality = qualityData.columnQuality[column];
                          return {
                            name: column,
                            completude: quality.completeness,
                            unicidade: quality.uniqueness
                          };
                        })}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                        <Bar dataKey="completude" name="Completude" fill="#3b82f6">
                          {columnsList.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(qualityData.columnQuality[columnsList[index]].completeness)} />
                          ))}
                        </Bar>
                        <Bar dataKey="unicidade" name="Unicidade" fill="#8b5cf6">
                          {columnsList.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={getScoreColor(qualityData.columnQuality[columnsList[index]].uniqueness)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Detalhes */}
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-lg">Detalhes da Qualidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Coluna</TableHead>
                          <TableHead>Completude</TableHead>
                          <TableHead>Unicidade</TableHead>
                          <TableHead>Validade</TableHead>
                          <TableHead>Qualidade</TableHead>
                          <TableHead>Problemas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {columnsList.map(column => {
                          const quality = qualityData.columnQuality[column];
                          const status = getQualityStatus(quality);
                          
                          return (
                            <TableRow key={column}>
                              <TableCell className="font-medium">{column}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{ width: `${quality.completeness}%`, backgroundColor: getScoreColor(quality.completeness) }}></div>
                                  </div>
                                  <span>{quality.completeness}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{ width: `${quality.uniqueness}%`, backgroundColor: getScoreColor(quality.uniqueness) }}></div>
                                  </div>
                                  <span>{quality.uniqueness}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                    <div className="h-2.5 rounded-full" style={{ width: `${quality.validFormat}%`, backgroundColor: getScoreColor(quality.validFormat) }}></div>
                                  </div>
                                  <span>{quality.validFormat}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  {status.icon}
                                  <span className="ml-2">{status.text}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {quality.issues.length > 0 ? (
                                  <div className="text-amber-600 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    <span>{quality.issues.length}</span>
                                  </div>
                                ) : (
                                  <div className="text-emerald-600 flex items-center">
                                    <Check className="h-4 w-4 mr-1" />
                                    <span>Nenhum</span>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={analyzeDataQuality} disabled={analyzing}>
            {analyzing ? "Analisando..." : "Atualizar Análise"}
          </Button>
          <Button onClick={onComplete} disabled={!qualityData || analyzing} className="space-x-1">
            <span>Prosseguir</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
