import { Card } from "@/components/ui/card"

export default function Data() {
  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados</h1>
          <p className="text-muted-foreground">
            Visualize e analise seus dados empresariais
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">Dados em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground">
              Esta página está em desenvolvimento. Em breve você poderá visualizar seus dados aqui.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}