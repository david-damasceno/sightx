import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import { DemographicsMetrics } from "@/components/demographics/DemographicsMetrics"
import { AgeDistributionChart } from "@/components/demographics/AgeDistributionChart"
import { IncomeDistributionChart } from "@/components/demographics/IncomeDistributionChart"
import { EducationLevelChart } from "@/components/demographics/EducationLevelChart"

export default function Demographics() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <h1 className="text-2xl font-bold">Demografia</h1>
          </div>
        </div>

        <DemographicsMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgeDistributionChart />
          <IncomeDistributionChart />
        </div>

        <EducationLevelChart />
      </main>
    </div>
  )
}