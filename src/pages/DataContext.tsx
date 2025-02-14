
import { useState } from "react"
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data/ColumnMapper"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function DataContext() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fileData, setFileData] = useState<{
    id: string
    columns: any[]
    previewData: any[]
  } | null>(null)
  const { toast } = useToast()

  const handleUploadComplete = (fileId: string) => {
    // Aqui você buscaria os dados do arquivo do backend
    // Por enquanto vamos usar dados mockados
    setFileData({
      id: fileId,
      columns: [
        { name: "nome", type: "text", sample: "João Silva" },
        { name: "idade", type: "number", sample: 25 },
        { name: "data_nascimento", type: "date", sample: "1998-01-01" }
      ],
      previewData: [
        { nome: "João Silva", idade: 25, data_nascimento: "1998-01-01" },
        { nome: "Maria Santos", idade: 30, data_nascimento: "1993-05-15" }
      ]
    })
    setCurrentStep(2)
  }

  const handleStepChange = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const handlePreviewComplete = () => {
    setCurrentStep(3)
  }

  const handleMappingComplete = () => {
    toast({
      title: "Processo concluído",
      description: "Seus dados foram importados com sucesso!",
    })
    // Aqui você poderia redirecionar para a visualização dos dados
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Importação de Dados</h1>
        <p className="text-muted-foreground">
          Importe seus dados para começar a análise
        </p>
      </div>

      <ProcessSteps
        currentStep={currentStep}
        onStepClick={handleStepChange}
      />

      <div className={cn(
        "transition-all duration-300",
        currentStep === 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      )}>
        <FileUploader onUploadComplete={handleUploadComplete} />
      </div>

      {fileData && (
        <>
          <div className={cn(
            "transition-all duration-300",
            currentStep === 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <DataPreview
              columns={fileData.columns}
              previewData={fileData.previewData}
              onNext={handlePreviewComplete}
            />
          </div>

          <div className={cn(
            "transition-all duration-300",
            currentStep === 3 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <ColumnMapper
              fileId={fileData.id}
              columns={fileData.columns}
              onMappingComplete={handleMappingComplete}
            />
          </div>
        </>
      )}
    </div>
  )
}
