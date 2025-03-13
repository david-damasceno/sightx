
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Globe, Map, Navigation } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function Location() {
  const [activeRegions, setActiveRegions] = useState<string[]>([
    "América do Sul", 
    "América do Norte",
    "Europa"
  ])
  
  const [regionData, setRegionData] = useState<Record<string, number>>({
    "América do Sul": 42,
    "América do Norte": 28,
    "Europa": 15,
    "Ásia": 8,
    "Oceania": 5,
    "África": 2
  })
  
  const [currentFilter, setCurrentFilter] = useState("all")
  
  // Cores para regiões
  const regionColors: Record<string, string> = {
    "América do Sul": "bg-green-500",
    "América do Norte": "bg-blue-500",
    "Europa": "bg-purple-500",
    "Ásia": "bg-red-500",
    "Oceania": "bg-amber-500",
    "África": "bg-indigo-500"
  }
  
  // Simulação de dados carregados quando o componente monta
  useEffect(() => {
    // Em um caso real, carregaríamos os dados de uma API aqui
    // Mas para este exemplo, usamos dados simulados
    const timer = setTimeout(() => {
      // Dados já estão preenchidos no estado inicial
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Filtragem de regiões com base no filtro atual
  const filteredRegions = currentFilter === "all" 
    ? Object.keys(regionData) 
    : Object.keys(regionData).filter(region => activeRegions.includes(region))
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Dados de Localização</h1>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select 
              defaultValue="all" 
              onValueChange={setCurrentFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas regiões</SelectItem>
                <SelectItem value="active">Regiões ativas</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Map className="mr-2 h-4 w-4" />
              Ver Mapa
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="regions">Regiões</TabsTrigger>
            <TabsTrigger value="analysis">Análise</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Regiões Cobertas</CardTitle>
                  <CardDescription>Total de regiões ativas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{activeRegions.length}</div>
                    <Badge variant="outline" className="text-green-500">
                      <span className="mr-1">+1</span> neste mês
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    De {Object.keys(regionData).length} regiões disponíveis
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dados Coletados</CardTitle>
                  <CardDescription>Quantidade de pontos de dados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">458k</div>
                    <Badge variant="outline" className="text-blue-500">
                      <span className="mr-1">+12.5%</span> neste mês
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Dados de localização de clientes
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Precisão</CardTitle>
                  <CardDescription>Qualidade dos dados de localização</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">92%</div>
                    <Badge variant="outline" className="text-amber-500">
                      <span className="mr-1">-2%</span> desde o mês passado
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Baseado em validação de endereços
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="regions">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Região</CardTitle>
                <CardDescription>
                  Porcentagem dos dados por região geográfica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRegions.map((region) => (
                    <div key={region} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${regionColors[region]}`} />
                          <span className="font-medium">{region}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {regionData[region]}%
                        </span>
                      </div>
                      <Progress 
                        value={regionData[region]} 
                        className={`h-2 ${activeRegions.includes(region) ? regionColors[region] : "bg-gray-200"}`}
                      />
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Mostrando {filteredRegions.length} regiões
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Ver todas as regiões
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Localização</CardTitle>
                <CardDescription>
                  Insights baseados em dados geográficos
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="flex items-center justify-center h-[300px] border rounded-md">
                  <div className="text-center space-y-3">
                    <Navigation className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-muted-foreground">
                        Análise detalhada de localização disponível em breve
                      </p>
                      <Button variant="link" className="mt-2">
                        Configurar análise avançada
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
