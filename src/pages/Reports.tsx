
import { Card } from "@/components/ui/card"
import { FileText, BarChart2, FileUp, Download, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export default function Reports() {
  const isMobile = useMobile()

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold">Relatórios</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Análise de Desempenho</h2>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Relatórios completos de métricas de desempenho do seu negócio.
              </p>
              <Button variant="outline" className="w-full" disabled>
                {isMobile ? "Gerar" : "Gerar Relatório"}
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Importar Dados</h2>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Importe seus dados existentes para gerar análises personalizadas.
              </p>
              <Button variant="outline" className="w-full" disabled>
                {isMobile ? "Importar" : "Importar Dados"}
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Exportar Relatórios</h2>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Exporte relatórios em diversos formatos para compartilhamento.
              </p>
              <Button variant="outline" className="w-full" disabled>
                {isMobile ? "Exportar" : "Exportar Relatórios"}
              </Button>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all">
            <div className="flex flex-col h-full space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Relatórios Agendados</h2>
              </div>
              <p className="text-sm text-muted-foreground flex-grow">
                Configure relatórios automáticos para serem gerados periodicamente.
              </p>
              <Button variant="outline" className="w-full" disabled>
                {isMobile ? "Agendar" : "Agendar Relatórios"}
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-4 md:p-6 mt-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
            <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">Relatórios Avançados</h3>
            <p className="text-muted-foreground max-w-md">
              Relatórios personalizados e análises avançadas estarão disponíveis em breve.
            </p>
            <Button variant="outline" disabled className="mt-2">
              {isMobile ? "Ativar" : "Ativar Notificações"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
