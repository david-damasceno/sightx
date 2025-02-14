
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data/ColumnMapper"
import { cn } from "@/lib/utils"
import { DataImportProvider, useDataImport } from "@/contexts/DataImportContext"

function DataImportContent() {
  const { currentImport } = useDataImport()

  const currentStep = currentImport ? (
    currentImport.status === 'uploading' || currentImport.status === 'uploaded' ? 1 :
    currentImport.status === 'analyzing' || currentImport.status === 'editing' ? 2 :
    3
  ) : 1

  return (
    <div className="container max-w-7xl mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Importação de Dados</h1>
        <p className="text-muted-foreground">
          Importe seus dados para começar a análise
        </p>
      </div>

      <ProcessSteps currentStep={currentStep} />

      <div className={cn(
        "transition-all duration-300",
        currentStep === 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
      )}>
        <FileUploader />
      </div>

      {currentImport && (
        <>
          <div className={cn(
            "transition-all duration-300",
            currentStep === 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <DataPreview />
          </div>

          <div className={cn(
            "transition-all duration-300",
            currentStep === 3 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <ColumnMapper />
          </div>
        </>
      )}
    </div>
  )
}

export default function DataImport() {
  return (
    <DataImportProvider>
      <DataImportContent />
    </DataImportProvider>
  )
}
