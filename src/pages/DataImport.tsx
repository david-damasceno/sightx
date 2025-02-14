
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data/ColumnMapper"
import { cn } from "@/lib/utils"
import { DataImportProvider, useDataImport } from "@/contexts/DataImportContext"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { ColumnMetadata } from "@/types/data-imports"

function DataImportContent() {
  const { currentImport, analyzeFile } = useDataImport()
  const [columns, setColumns] = useState<ColumnMetadata[]>([])

  useEffect(() => {
    if (currentImport?.id) {
      // Carregar colunas
      supabase
        .from('data_file_columns')
        .select('*')
        .eq('file_id', currentImport.id)
        .order('original_name')
        .then(({ data, error }) => {
          if (!error && data) {
            setColumns(data)
          }
        })
    }
  }, [currentImport?.id])

  const currentStep = currentImport ? (
    currentImport.status === 'pending' || currentImport.status === 'uploading' || currentImport.status === 'uploaded' ? 1 :
    currentImport.status === 'analyzing' || currentImport.status === 'editing' || currentImport.status === 'processing' ? 2 :
    currentImport.status === 'completed' ? 3 :
    1
  ) : 1

  const handleUploadComplete = async (fileId: string) => {
    await analyzeFile(fileId)
  }

  const handlePreviewNext = async () => {
    if (currentImport) {
      await supabase
        .from('data_imports')
        .update({ status: 'processing' })
        .eq('id', currentImport.id)
    }
  }

  const handleMappingComplete = async () => {
    if (currentImport) {
      await supabase
        .from('data_imports')
        .update({ status: 'completed' })
        .eq('id', currentImport.id)
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
              columns={columns}
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
              columns={columns}
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
