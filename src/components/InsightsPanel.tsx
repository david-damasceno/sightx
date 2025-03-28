
import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Brain, TrendingUp, Package, AlertCircle, ShoppingCart, Users, Clock, Repeat, Star, RefreshCw, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface Insight {
  id: string
  text: string
  type: 'ai' | 'warning' | 'success' | 'info'
  priority: 'high' | 'medium' | 'low'
  category: string
  impact: string
  timeToImplement?: string
  created_at: string
  source?: string
  is_favorite: boolean
}

// Mapeamento de ícones por categoria
const categoryIcons = {
  'Estoque': <Package className="h-4 w-4" />,
  'Vendas': <TrendingUp className="h-4 w-4" />,
  'Operacional': <Clock className="h-4 w-4" />,
  'Clientes': <Users className="h-4 w-4" />,
  'RH': <Users className="h-4 w-4" />,
  'Fidelização': <Repeat className="h-4 w-4" />,
  'Financeiro': <TrendingUp className="h-4 w-4" />,
  'Marketing': <ShoppingCart className="h-4 w-4" />,
  'Análise de Dados': <Brain className="h-4 w-4" />
}

// Mapeamento de cores por tipo de insight
const typeColors = {
  'ai': 'text-purple-500',
  'warning': 'text-orange-500',
  'success': 'text-green-500',
  'info': 'text-blue-500'
}

export function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { currentOrganization } = useAuth()

  const fetchInsights = async () => {
    if (!currentOrganization?.id) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('organization_insights')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      // Transformar os dados para garantir que o tipo seja compatível
      const formattedInsights: Insight[] = (data || []).map(item => ({
        id: item.id,
        text: item.text,
        type: (item.type as 'ai' | 'warning' | 'success' | 'info') || 'ai',
        priority: (item.priority as 'high' | 'medium' | 'low') || 'medium',
        category: item.category,
        impact: item.impact,
        timeToImplement: item.time_to_implement,
        created_at: item.created_at,
        source: item.source,
        is_favorite: !!item.is_favorite
      }))
      
      setInsights(formattedInsights)
    } catch (error) {
      console.error('Erro ao buscar insights:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
    
    // Setup um intervalo para atualizar os insights a cada 5 minutos
    const interval = setInterval(() => {
      fetchInsights()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [currentOrganization?.id])

  const refreshInsights = async () => {
    if (!currentOrganization?.id) return
    
    try {
      setRefreshing(true)
      
      // Chamar a edge function para gerar novos insights
      const { data, error } = await supabase.functions.invoke('manage-insights', {
        body: { 
          action: 'generate',
          organizationId: currentOrganization.id
        }
      })
      
      if (error) throw error
      
      toast.success('Insights atualizados com sucesso')
      fetchInsights()
    } catch (error) {
      console.error('Erro ao atualizar insights:', error)
      toast.error('Erro ao atualizar insights')
    } finally {
      setRefreshing(false)
    }
  }

  const toggleFavorite = async (insightId: string, currentStatus: boolean) => {
    if (!currentOrganization?.id) return
    
    try {
      // Atualizar UI otimisticamente
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === insightId 
            ? {...insight, is_favorite: !currentStatus} 
            : insight
        )
      )
      
      // Chamar a edge function para favoritar/desfavoritar o insight
      const { data, error } = await supabase.functions.invoke('manage-insights', {
        body: { 
          action: 'favorite',
          organizationId: currentOrganization.id,
          insightId: insightId
        }
      })
      
      if (error) throw error
      
      const message = !currentStatus ? 'Insight adicionado aos favoritos' : 'Insight removido dos favoritos'
      toast.success(message)
    } catch (error) {
      console.error('Erro ao atualizar status do favorito:', error)
      toast.error('Erro ao atualizar status do favorito')
      
      // Reverter mudança em caso de erro
      setInsights(prevInsights => 
        prevInsights.map(insight => 
          insight.id === insightId 
            ? {...insight, is_favorite: currentStatus} 
            : insight
        )
      )
    }
  }

  const deleteInsight = async (insightId: string) => {
    if (!currentOrganization?.id) return
    
    try {
      // Remover da UI otimisticamente
      setInsights(prevInsights => prevInsights.filter(insight => insight.id !== insightId))
      
      // Chamar a edge function para excluir o insight
      const { data, error } = await supabase.functions.invoke('manage-insights', {
        body: { 
          action: 'delete',
          organizationId: currentOrganization.id,
          insightId: insightId
        }
      })
      
      if (error) throw error
      
      toast.success('Insight excluído com sucesso')
    } catch (error) {
      console.error('Erro ao excluir insight:', error)
      toast.error('Erro ao excluir insight')
      
      // Recarregar dados em caso de erro
      fetchInsights()
    }
  }

  const getIconForInsight = (insight: Insight) => {
    const icon = categoryIcons[insight.category as keyof typeof categoryIcons]
    if (icon) {
      return icon && React.cloneElement(icon, { className: `h-4 w-4 ${typeColors[insight.type]}` })
    }
    return <Brain className={`h-4 w-4 ${typeColors[insight.type]}`} />
  }

  return (
    <Card className="glass-card p-6 animate-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <div>
            <h3 className="font-semibold">Insights da DONA</h3>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Carregando insights...' : `${insights.length} insights ativos`}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshInsights}
          disabled={refreshing}
          className="gap-1"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {loading ? (
          // Skeleton loaders
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : insights.length > 0 ? (
          insights.map((insight) => (
            <div 
              key={insight.id} 
              className={cn(
                "group relative flex flex-col gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer animate-fade-in",
                {
                  'bg-purple-50 dark:bg-purple-950/30': insight.type === 'ai',
                  'bg-yellow-50 dark:bg-yellow-950/30': insight.type === 'warning',
                  'bg-green-50 dark:bg-green-950/30': insight.type === 'success',
                  'bg-blue-50 dark:bg-blue-950/30': insight.type === 'info',
                  'border-l-4': true,
                  'border-l-red-500': insight.priority === 'high',
                  'border-l-yellow-500': insight.priority === 'medium',
                  'border-l-blue-500': insight.priority === 'low',
                }
              )}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleFavorite(insight.id, insight.is_favorite)}
                      >
                        <Star className={cn(
                          "h-4 w-4", 
                          insight.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        )} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {insight.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => deleteInsight(insight.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Excluir insight
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">{getIconForInsight(insight)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{insight.text}</p>
                  
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                    </Badge>
                    <Badge variant="outline">{insight.category}</Badge>
                    <Badge variant="outline">Impacto: {insight.impact}</Badge>
                    {insight.timeToImplement && (
                      <Badge variant="outline">Tempo: {insight.timeToImplement}</Badge>
                    )}
                    {insight.source && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                        {insight.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Nenhum insight disponível no momento.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tente conversar com a DONA para gerar novos insights.
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
