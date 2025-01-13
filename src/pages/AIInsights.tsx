import { Brain } from "lucide-react"
import { FileUploader } from "@/components/ai/FileUploader"
import { FileList } from "@/components/ai/FileList"

export default function AIInsights() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h1 className="text-2xl font-bold">AI Insights</h1>
        </div>

        <div className="grid gap-6">
          <section>
            <h2 className="text-lg font-semibold mb-4">Upload de Dados</h2>
            <FileUploader />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Arquivos Enviados</h2>
            <FileList />
          </section>
        </div>
      </main>
    </div>
  )
}