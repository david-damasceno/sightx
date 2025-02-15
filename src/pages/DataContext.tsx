
import { useState, useEffect } from "react"
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data-import/ColumnMapper"
import { UploadedFilesList } from "@/components/data/UploadedFilesList"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Separator } from "@/components/ui/separator"
import { ColumnMetadata, ProcessingResult, ImportStatus } from "@/types/data-imports"
import { adaptColumnMetadata } from "@/utils/columnAdapter"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileUp } from "lucide-react"

interface Column {
  name: string
  type: string
  sample: any
}

interface FileData {
  id: string
  columns: Column[]
  previewData: any[]
  processingResult?: ProcessingResult
}

function isProcessingResult(data: any): data is ProcessingResult {
  return data && typeof data.status === 'string' && ['pending', 'processing', 'completed', 'error'].includes(data.status)
}

export default function DataContext() {
  const [currentStep, setCurrentStep] = useState(1)
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization } = useAuth()

  const fetchFileData = async (fileId: string) => {
    try {
      console.log('Iniciando busca de dados do arquivo:', fileId)
      setLoading(true)
      
      // Buscar primeira página dos dados para inferir as colunas
      const { data: firstPageData, error } = await supabase.functions.invoke('read-file-data', {
        body: { 
          fileId, 
          page: 1, 
          pageSize: 50,
          organizationId: currentOrganization?.id
        }
      })

      if (error) {
        throw error
      }

      if (!firstPageData?.data || firstPageData.data.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo')
      }

      // Criar colunas baseado nos dados recebidos
      const inferredColumns = Object.keys(firstPageData.data[0]).map(key => ({
        name: key,
        type: 'text',
        sample: firstPageData.data[0][key]
      }))

      console.log('Colunas inferidas dos dados:', inferredColumns)

      setFileData({
        id: fileId,
        columns: inferredColumns,
        previewData: []
      })

      setCurrentStep(2)

    } catch (error: any) {
      console.error('Erro ao buscar dados do arquivo:', error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os dados do arquivo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (fileId: string) => {
    console.log('Upload completo, ID:', fileId)
    fetchFileData(fileId)
  }

  const handleStepChange = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  const handlePreviewComplete = async () => {
    if (!fileData || !currentOrganization) return

    try {
      setLoading(true)

      const { data: processingResult, error: processingError } = await supabase
        .from('data_processing_results')
        .insert({
          file_id: fileData.id,
          organization_id: currentOrganization.id,
          status: 'processing' as const,
          processing_started_at: new Date().toISOString(),
          total_rows: fileData.previewData.length,
          progress: 0,
          table_name: `data_${fileData.id.replace(/-/g, '_')}`
        })
        .select()
        .single()

      if (processingError) throw processingError

      setFileData(prev => prev ? {
        ...prev,
        processingResult: {
          ...processingResult,
          status: 'processing'
        }
      } : null)

      setCurrentStep(3)
    } catch (error: any) {
      console.error('Erro ao iniciar processamento:', error)
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processamento dos dados.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMappingComplete = () => {
    toast({
      title: "Processo concluído",
      description: "Seus dados foram importados com sucesso!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Importação */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl">Importação de Dados</CardTitle>
                    <CardDescription className="text-base">
                      Importe seus dados para começar a análise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <ProcessSteps
                  currentStep={currentStep}
                  onStepClick={handleStepChange}
                />

                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}

                <div className={cn(
                  "transition-all duration-300",
                  currentStep === 1 ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
                )}>
                  <Card className="border border-dashed">
                    <CardContent className="pt-6">
                      <FileUploader onUploadComplete={handleUploadComplete} />
                    </CardContent>
                  </Card>
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
                        fileId={fileData.id}
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
                        previewData={fileData.previewData}
                        onMappingComplete={handleMappingComplete}
                        processingStatus={fileData.processingResult?.status}
                        tableName={fileData.processingResult?.table_name}
                        errorMessage={fileData.processingResult?.error_message}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna lateral - Arquivos recentes */}
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Arquivos Importados</CardTitle>
                <CardDescription>
                  Histórico de arquivos enviados para análise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadedFilesList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
