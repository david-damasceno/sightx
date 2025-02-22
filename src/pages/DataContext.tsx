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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUp, Upload, Database, BarChart3, FileSpreadsheet, Activity, Settings } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-b from-background via-accent/5 to-background">
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-block p-2 rounded-full bg-primary/10 mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-primary bg-300% animate-gradient">
            Central de Dados
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Importe, gerencie e analise seus dados de forma simples e eficiente
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Arquivos Importados</p>
                    <p className="text-2xl font-semibold">128</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <Activity className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Processamentos</p>
                    <p className="text-2xl font-semibold">1.2K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border-none">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">Análises</p>
                    <p className="text-2xl font-semibold">3.4K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-white/50 backdrop-blur-sm">
              <TabsTrigger value="upload" className="space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="w-4 h-4" />
                <span>Importar Dados</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Database className="w-4 h-4" />
                <span>Arquivos Salvos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="space-y-8 animate-fade-in">
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Importação de Dados</CardTitle>
                    <CardDescription>
                      Siga os passos abaixo para importar seus dados
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
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-primary/30 rounded-full"></div>
                      <div className="absolute top-0 w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                    </div>
                  </div>
                )}

                <div className={cn(
                  "transition-all duration-500 transform",
                  currentStep === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 h-0 overflow-hidden"
                )}>
                  <Card className="border border-dashed bg-white/50 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6">
                      <FileUploader onUploadComplete={handleUploadComplete} />
                    </CardContent>
                  </Card>
                </div>

                {fileData && (
                  <>
                    <div className={cn(
                      "transition-all duration-500 transform",
                      currentStep === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 h-0 overflow-hidden"
                    )}>
                      <DataPreview 
                        columns={fileData.columns}
                        previewData={fileData.previewData}
                        fileId={fileData.id}
                        onNext={handlePreviewComplete}
                      />
                    </div>

                    <div className={cn(
                      "transition-all duration-500 transform",
                      currentStep === 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 h-0 overflow-hidden"
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
          </TabsContent>

          <TabsContent value="files" className="animate-fade-in">
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Database className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Arquivos Importados</CardTitle>
                    <CardDescription>
                      Histórico de arquivos enviados para análise
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UploadedFilesList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
