import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MetricCard } from "@/components/MetricCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Users, TrendingUp, Award, LineChart } from "lucide-react"

interface Employee {
  id: number
  name: string
  department: string
  score: number
  avatarUrl: string
}

const mockPerformanceMetrics = {
  totalEmployees: 125,
  averageScore: 8.7,
  topPerformers: 32,
  departmentScore: 8.9
}

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "João Silva",
    department: "Vendas",
    score: 9.2,
    avatarUrl: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Maria Santos",
    department: "Marketing",
    score: 8.8,
    avatarUrl: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Pedro Costa",
    department: "Desenvolvimento",
    score: 9.5,
    avatarUrl: "/placeholder.svg"
  }
]

export default function Performance() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const departments = Array.from(new Set(mockEmployees.map(e => e.department)))

  return (
    <div className="container py-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Colaboradores"
          value={mockPerformanceMetrics.totalEmployees.toString()}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Média Geral"
          value={mockPerformanceMetrics.averageScore.toFixed(1)}
          icon={<Award className="h-4 w-4" />}
        />
        <MetricCard
          title="Top Performers"
          value={mockPerformanceMetrics.topPerformers.toString()}
          change="+5"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Score Departamental"
          value={mockPerformanceMetrics.departmentScore.toFixed(1)}
          change="+0.3"
          icon={<LineChart className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(employee => (
          <Card key={employee.id} className="p-4 cursor-pointer hover:bg-accent transition-colors" onClick={() => setSelectedEmployee(employee)}>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                <AvatarFallback>{employee.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.department}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Score de Desempenho</p>
              <p className="text-lg font-semibold">{employee.score.toFixed(1)}</p>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Colaborador</SheetTitle>
          </SheetHeader>
          {selectedEmployee && (
            <div className="mt-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedEmployee.avatarUrl} alt={selectedEmployee.name} />
                  <AvatarFallback>{selectedEmployee.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.department}</p>
                </div>
              </div>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Score Atual</h4>
                  <p className="text-2xl font-bold">{selectedEmployee.score.toFixed(1)}</p>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}