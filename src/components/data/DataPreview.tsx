
import { useState } from "react"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

interface Column {
  name: string
  type: string
  sample: any
}

interface DataPreviewProps {
  columns: Column[]
  previewData: any[]
  onNext: () => void
}

export function DataPreview({ columns, previewData, onNext }: DataPreviewProps) {
  const [activeTab, setActiveTab] = useState("table")

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "bg-blue-500/10 text-blue-500"
      case "number":
        return "bg-green-500/10 text-green-500"
      case "date":
        return "bg-purple-500/10 text-purple-500"
      case "boolean":
        return "bg-yellow-500/10 text-yellow-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Preview dos Dados</h2>
        <Button onClick={onNext}>Continuar</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Tabela
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Distribuição
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.name} className="font-medium">
                        <div className="flex flex-col gap-1">
                          {col.name}
                          <Badge 
                            variant="secondary"
                            className={cn("w-fit", getTypeColor(col.type))}
                          >
                            {col.type}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.map((row, i) => (
                    <TableRow key={i}>
                      {columns.map((col) => (
                        <TableCell key={col.name}>
                          {row[col.name]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {columns.map((col) => (
                <div key={col.name} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{col.name}</h3>
                  {/* Aqui entrariam os gráficos de distribuição */}
                  <p className="text-sm text-muted-foreground">
                    Visualização de distribuição em desenvolvimento
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-4">
          <Card className="p-6">
            <div className="space-y-4">
              {/* Aqui entrariam os gráficos de tendências */}
              <p className="text-sm text-muted-foreground">
                Visualização de tendências em desenvolvimento
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
