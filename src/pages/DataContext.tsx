
import { useState } from "react"
import { FileText, List, LayoutGrid, Search, Filter } from "lucide-react"
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
import { FileUploader } from "@/components/data-import/FileUploader"

export default function DataContext() {
  const [activeFile, setActiveFile] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list')
  const [showUploader, setShowUploader] = useState(false)
  const [fileData, setFileData] = useState<any>(null)

  const handleUploadSuccess = (data: any) => {
    setFileData(data)
    setShowUploader(false)
    console.log("Upload success:", data)
  }

  return (
    <div className="container py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contextualização de Dados</h1>
          <p className="text-muted-foreground">
            Gerencie e contextualize seus dados de forma inteligente
          </p>
        </div>
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
            {showUploader ? (
              <FileUploader onUploadSuccess={handleUploadSuccess} />
            ) : fileData ? (
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  {fileData.columns.length} colunas, {fileData.totalRows} linhas
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => setShowUploader(true)}
              >
                <FileText className="h-4 w-4" />
                Upload
              </Button>
            )}
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
              {fileData ? (
                viewMode === 'list' ? (
                  <div className="space-y-4">
                    {fileData.columns.map((column: any) => (
                      <div
                        key={column.name}
                        className="p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{column.name}</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date().toISOString().split('T')[0]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Tipo: {column.type}
                        </p>
                        <p className="text-sm">Exemplo: {column.sample}</p>
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
                          <TableHead>Exemplo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fileData.columns.map((column: any) => (
                          <TableRow key={column.name}>
                            <TableCell className="font-medium">
                              {column.name}
                            </TableCell>
                            <TableCell>{column.type}</TableCell>
                            <TableCell>{column.sample}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum arquivo selecionado. Faça o upload de um arquivo para visualizar seus dados.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
