import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/MetricCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Percent, Target } from "lucide-react"

interface Seller {
  id: number
  name: string
  region: string
  salesVolume: number
  avatarUrl: string
}

const mockSalesMetrics = {
  totalRevenue: 1250000,
  totalSales: 450,
  conversionRate: 68,
  targetCompletion: 85
}

const mockSellers: Seller[] = [
  {
    id: 1,
    name: "Ana Silva",
    region: "Sudeste",
    salesVolume: 450000,
    avatarUrl: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Carlos Santos",
    region: "Sul",
    salesVolume: 380000,
    avatarUrl: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Mariana Costa",
    region: "Nordeste",
    salesVolume: 420000,
    avatarUrl: "/placeholder.svg"
  }
]

export default function Sales() {
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [regionFilter, setRegionFilter] = useState("all")

  const filteredSellers = mockSellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = regionFilter === "all" || seller.region === regionFilter
    return matchesSearch && matchesRegion
  })

  const regions = Array.from(new Set(mockSellers.map(s => s.region)))

  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${mockSalesMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Total de Vendas"
          value={mockSalesMetrics.totalSales.toString()}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <MetricCard
          title="Taxa de Conversão"
          value={`${mockSalesMetrics.conversionRate}%`}
          change="+2.5%"
          icon={<Percent className="h-4 w-4" />}
        />
        <MetricCard
          title="Meta Atingida"
          value={`${mockSalesMetrics.targetCompletion}%`}
          change="+5%"
          icon={<Target className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {regions.map(region => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSellers.map(seller => (
          <Card key={seller.id} className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setSelectedSeller(seller)}>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                <AvatarFallback>{seller.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{seller.name}</h3>
                <p className="text-sm text-muted-foreground">{seller.region}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Volume de Vendas</p>
              <p className="text-lg font-semibold">
                R$ {seller.salesVolume.toLocaleString()}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedSeller} onOpenChange={() => setSelectedSeller(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Vendedor</SheetTitle>
          </SheetHeader>
          {selectedSeller && (
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedSeller.avatarUrl} alt={selectedSeller.name} />
                  <AvatarFallback>{selectedSeller.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedSeller.name}</h3>
                  <p className="text-muted-foreground">{selectedSeller.region}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Volume de Vendas</h4>
                  <p className="text-2xl font-bold">
                    R$ {selectedSeller.salesVolume.toLocaleString()}
                  </p>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}