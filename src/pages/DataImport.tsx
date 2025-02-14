
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data/ColumnMapper"
import { cn } from "@/lib/utils"
import { DataImportProvider, useDataImport } from "@/contexts/DataImportContext"

function DataImportContent() {
  const { currentImport, analyzeFile } = useDataImport()

  const currentStep = currentImport ? (
    currentImport.status === 'uploading' || currentImport.status === 'uploaded' ? 1 :
    currentImport.status === 'analyzing' || currentImport.status === 'editing' ? 2 :
    3
  ) : 1

  const handleUploadComplete = async (fileId: string) => {
    await analyzeFile(fileId)
  }

  const handlePreviewNext = () => {
    if (currentImport) {
      // Atualizar status para editing
    }
  }

  const handleMappingComplete = () => {
    if (currentImport) {
      // Atualizar status para completed
    }
  }

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
        <FileUploader onUploadComplete={handleUploadComplete} />
      </div>

      {currentImport && (
        <>
          <div className={cn(
            "transition-all duration-300",
            currentStep === 2 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <DataPreview 
              fileId={currentImport.id}
              columns={(currentImport.columns_metadata?.columns || []).map(col => ({
                name: col.name,
                type: col.type,
                sample: col.sample
              }))}
              previewData={[]}
              onNext={handlePreviewNext}
            />
          </div>

          <div className={cn(
            "transition-all duration-300",
            currentStep === 3 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          )}>
            <ColumnMapper
              fileId={currentImport.id}
              columns={(currentImport.columns_metadata?.columns || [])}
              onMappingComplete={handleMappingComplete}
            />
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
