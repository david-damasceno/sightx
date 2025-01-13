import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { DemographicMetrics } from "@/components/demographics/DemographicMetrics"
import { CustomerMap } from "@/components/demographics/CustomerMap"
import { DemographicCharts } from "@/components/demographics/DemographicCharts"

interface CustomerLocation {
  latitude: number
  longitude: number
  customerCount: number
}

interface ChartData {
  name: string
  value: number
}

interface DemographicData {
  totalPopulation: number
  ageDistribution: ChartData[]
  incomeDistribution: ChartData[]
  educationLevels: ChartData[]
}

export default function Demographics() {
  const { currentOrganization } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [customerLocations, setCustomerLocations] = useState<CustomerLocation[]>([])
  const [demographicData, setDemographicData] = useState<DemographicData>({
    totalPopulation: 0,
    ageDistribution: [],
    incomeDistribution: [],
    educationLevels: []
  })

  useEffect(() => {
    async function loadData() {
      if (!currentOrganization) return

      try {
        // Carregar dados de concentração de clientes
        const { data: concentrationData, error: concentrationError } = await supabase
          .from('customer_concentration')
          .select('*')
          .eq('organization_id', currentOrganization.id)

        if (concentrationError) throw concentrationError

        // Carregar dados demográficos
        const { data: demographicData, error: demographicError } = await supabase
          .from('demographic_data')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .maybeSingle()

        if (demographicError) throw demographicError

        // Processar dados de concentração
        const locations = concentrationData?.map(item => ({
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          customerCount: item.customer_count
        })) || []

        setCustomerLocations(locations)

        // Processar dados demográficos com verificação de tipo
        if (demographicData) {
          const ageDistribution = Array.isArray(demographicData.age_distribution) 
            ? demographicData.age_distribution as ChartData[]
            : []
          
          const incomeDistribution = Array.isArray(demographicData.income_distribution)
            ? demographicData.income_distribution as ChartData[]
            : []
          
          const educationLevels = Array.isArray(demographicData.education_levels)
            ? demographicData.education_levels as ChartData[]
            : []

          setDemographicData({
            totalPopulation: demographicData.total_population,
            ageDistribution,
            incomeDistribution,
            educationLevels
          })
        }
      } catch (error) {
        console.error('Error loading demographic data:', error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados demográficos.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [currentOrganization, toast])

  // Calcular métricas com verificação de tipo
  const totalCustomers = customerLocations.reduce((sum, loc) => sum + loc.customerCount, 0)
  
  const averageIncome = demographicData.incomeDistribution.reduce((sum, item) => {
    const income = parseFloat(item.name)
    return isNaN(income) ? sum : sum + (income * item.value)
  }, 0) / 100

  const educationLevel = demographicData.educationLevels.find(
    item => item.name === "Superior"
  )?.value || 0

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Demografia</h1>
        </div>

        <DemographicMetrics
          totalPopulation={demographicData.totalPopulation}
          averageIncome={averageIncome}
          educationLevel={educationLevel}
          customerCount={totalCustomers}
          isLoading={isLoading}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Concentração de Clientes</h2>
            <CustomerMap locations={customerLocations} />
          </Card>

          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Insights</h2>
            <div className="space-y-4">
              <p>
                Sua base de {totalCustomers} clientes está concentrada principalmente em áreas com:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>População total de {demographicData.totalPopulation.toLocaleString()} habitantes</li>
                <li>Renda média de R$ {averageIncome.toLocaleString()}</li>
                <li>{educationLevel}% dos residentes com ensino superior</li>
              </ul>
            </div>
          </Card>
        </div>

        <DemographicCharts
          ageData={demographicData.ageDistribution}
          incomeData={demographicData.incomeDistribution}
          educationData={demographicData.educationLevels}
        />
      </main>
    </div>
  )
}