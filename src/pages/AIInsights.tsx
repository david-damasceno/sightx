import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { InsightsPanel } from "@/components/InsightsPanel"
import { MetricCard } from "@/components/MetricCard"
import { Brain, TrendingUp, Users, ShoppingCart, Target, ArrowUpRight, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container py-6 space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-lg bg-white/30 backdrop-blur-md border p-6 dark:bg-gray-800/30">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Insights da DONA
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Análise inteligente dos dados da sua empresa para tomada de decisões estratégicas. 
              Acompanhe métricas em tempo real e receba recomendações personalizadas.
            </p>
          </div>
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <Brain className="w-full h-full text-purple-500" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gerar Novo Insight
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Definir Metas
          </Button>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Vendas Previstas"
            value="R$ 125.000"
            change="+12.5%"
            icon={<TrendingUp className="h-6 w-6 text-green-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Clientes Ativos"
            value="1,234"
            change="+5.2%"
            icon={<Users className="h-6 w-6 text-blue-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 350"
            change="+8.7%"
            icon={<ShoppingCart className="h-6 w-6 text-purple-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
          <MetricCard
            title="Insights Gerados"
            value="28"
            change="+15"
            icon={<Brain className="h-6 w-6 text-indigo-500" />}
            className="hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Chat com DONA
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4" />
              Tendências
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 lg:col-span-3">
                <ChatSidebar 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <ChatInterface 
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              </div>
              <div className="col-span-12 lg:col-span-3">
                <InsightsPanel />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InsightsPanel />
                <InsightsPanel />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="trends">
            <div className="text-center p-12 text-muted-foreground">
              Análise de tendências em desenvolvimento...
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}