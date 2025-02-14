
import { useState, useEffect } from "react"
import { ProcessSteps } from "@/components/data/ProcessSteps"
import { FileUploader } from "@/components/data/FileUploader"
import { DataPreview } from "@/components/data/DataPreview"
import { ColumnMapper } from "@/components/data/ColumnMapper"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { ColumnMetadata, ProcessingResult } from "@/types/data-imports"
import { adaptColumnMetadata } from "@/utils/columnAdapter"

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
      console.log('Buscando dados do arquivo:', fileId)
      setLoading(true)
      
      // Buscar colunas do arquivo
      const { data: columnsData, error: columnsError } = await supabase
        .from('data_file_columns')
        .select('*')
        .eq('file_id', fileId)
        .order('original_name')

      if (columnsError) throw columnsError

      // Buscar resultado do processamento
      const { data: processingResult, error: processingError } = await supabase
        .from('data_processing_results')
        .select('*')
        .eq('file_id', fileId)
        .maybeSingle()

      if (processingError && processingError.code !== 'PGRST116') {
        throw processingError
      }

      console.log('Dados recebidos do banco:', { columnsData, processingResult })

      setFileData({
        id: fileId,
        columns: columnsData.map(adaptColumnMetadata),
        previewData: [],
        processingResult: processingResult && isProcessingResult(processingResult) ? processingResult : undefined
      })

      if (columnsData.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhuma coluna foi encontrada no arquivo. Verifique se o formato está correto.",
          variant: "destructive"
        })
      }

      // Se o processamento já estiver completo, avançar para o próximo passo
      if (processingResult?.status === 'completed') {
        setCurrentStep(3)
      }
    } catch (error: any) {
      console.error('Erro ao buscar dados do arquivo:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do arquivo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (fileId: string) => {
    console.log('Upload completo, ID:', fileId)
    fetchFileData(fileId)
    setCurrentStep(2)
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

      // Criar um registro de processamento
      const { data: processingResult, error: processingError } = await supabase
        .from('data_processing_results')
        .insert({
          file_id: fileData.id,
          organization_id: currentOrganization.id,
          status: 'processing' as const,
          processing_started_at: new Date().toISOString(),
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
              onMappingComplete={handleMappingComplete}
              processingStatus={fileData.processingResult?.status}
              tableName={fileData.processingResult?.table_name}
              errorMessage={fileData.processingResult?.error_message}
            />
          </div>
        </>
      )}
    </div>
  )
}
