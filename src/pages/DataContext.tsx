import { useState } from "react"
import { Upload, FileText, List, LayoutGrid, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function DataContext() {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')

  const mockData = [
    {
      column: "revenue",
      type: "Monetário",
      description: "Faturamento mensal em reais",
      lastUpdate: "2024-03-15",
    },
    {
      column: "customer_id",
      type: "ID",
      description: "Identificador único do cliente",
      lastUpdate: "2024-03-15",
    },
    {
      column: "purchase_date",
      type: "Data",
      description: "Data da compra",
      lastUpdate: "2024-03-15",
    },
  ]

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contextualização de Dados</h1>
          <p className="text-muted-foreground">
            Gerencie e contextualize seus dados de forma inteligente
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Dados
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Lista de Arquivos */}
        <Card className="col-span-3 h-[calc(100vh-12rem)]">
          <CardHeader>
            <CardTitle className="text-lg">Arquivos</CardTitle>
            <CardDescription>Seus arquivos de dados</CardDescription>
            <div className="flex gap-2 mt-2">
              <Input placeholder="Buscar arquivo..." className="flex-1" />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <div className="space-y-2">
              {["Faturamento.csv", "Vendas.xlsx", "Clientes.json"].map((file) => (
                <Button
                  key={file}
                  variant={activeFile === file ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setActiveFile(file)}
                >
                  <FileText className="h-4 w-4" />
                  {file}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Área Principal */}
        <div className="col-span-9 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Visualização de Dados</CardTitle>
                  <CardDescription>
                    Clique nas células para adicionar contexto
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="flex border rounded-md p-1">
                    <Button
                      variant={viewMode === 'list' ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="rounded-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode('table')}
                      className="rounded-none"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </Button>
                  <Button variant="outline">Exportar</Button>
                  <Button>Adicionar Dados</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  {mockData.map((item) => (
                    <div
                      key={item.column}
                      className="p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{item.column}</h3>
                        <span className="text-sm text-muted-foreground">
                          {item.lastUpdate}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Tipo: {item.type}
                      </p>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coluna</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Última Atualização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockData.map((row) => (
                        <TableRow key={row.column}>
                          <TableCell className="font-medium">
                            {row.column}
                          </TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          <TableCell>{row.lastUpdate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}