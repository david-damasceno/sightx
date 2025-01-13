import { useState } from "react"
import { ChatInterface } from "@/components/chat/ChatInterface"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import { InsightsPanel } from "@/components/InsightsPanel"
import { MetricCard } from "@/components/MetricCard"
import { Brain, TrendingUp, Users, ShoppingCart } from "lucide-react"

export default function AIInsights() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container py-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Insights da DONA</h1>
          <p className="text-muted-foreground">
            Análise inteligente dos dados da sua empresa para tomada de decisões estratégicas
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Vendas Previstas"
            value="R$ 125.000"
            change="+12.5%"
            icon={<TrendingUp className="h-6 w-6 text-green-500" />}
          />
          <MetricCard
            title="Clientes Ativos"
            value="1,234"
            change="+5.2%"
            icon={<Users className="h-6 w-6 text-blue-500" />}
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 350"
            change="+8.7%"
            icon={<ShoppingCart className="h-6 w-6 text-purple-500" />}
          />
          <MetricCard
            title="Insights Gerados"
            value="28"
            change="+15"
            icon={<Brain className="h-6 w-6 text-indigo-500" />}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-4">
          {/* Chat Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <ChatSidebar 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
          </div>

          {/* Chat Interface */}
          <div className="col-span-12 lg:col-span-6">
            <ChatInterface 
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
          </div>

          {/* Insights Panel */}
          <div className="col-span-12 lg:col-span-3">
            <InsightsPanel />
          </div>
        </div>
      </div>
    </div>
  )
}