import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, FileText, Database, FileJson, FileCsv, Download } from "lucide-react"
import { toast } from "sonner"

export default function Data() {
  const handleExport = (format: string) => {
    // Simulando exportação
    toast.success(`Exportação em ${format} iniciada`)
    // Aqui seria implementada a lógica real de exportação
  }

  const exportOptions = [
    {
      name: "Microsoft Excel",
      format: "XLSX",
      icon: <FileSpreadsheet className="h-8 w-8 text-green-600" />,
      description: "Exportar dados para planilha Excel (.xlsx)"
    },
    {
      name: "Microsoft Access",
      format: "MDB",
      icon: <Database className="h-8 w-8 text-red-600" />,
      description: "Exportar dados para banco Access (.mdb)"
    },
    {
      name: "Arquivo Texto",
      format: "TXT",
      icon: <FileText className="h-8 w-8 text-gray-600" />,
      description: "Exportar dados em formato texto (.txt)"
    },
    {
      name: "CSV",
      format: "CSV",
      icon: <FileCsv className="h-8 w-8 text-orange-600" />,
      description: "Exportar dados em CSV (.csv)"
    },
    {
      name: "JSON",
      format: "JSON",
      icon: <FileJson className="h-8 w-8 text-blue-600" />,
      description: "Exportar dados em formato JSON (.json)"
    }
  ]

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados</h1>
          <p className="text-muted-foreground">
            Exporte seus dados empresariais em diferentes formatos
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exportOptions.map((option, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {option.icon}
                  <div>
                    <h3 className="font-semibold">{option.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Formato: .{option.format.toLowerCase()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
                <Button 
                  className="w-full"
                  onClick={() => handleExport(option.format)}
                >
                  <Download className="h-4 w-4" />
                  Exportar {option.format}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}