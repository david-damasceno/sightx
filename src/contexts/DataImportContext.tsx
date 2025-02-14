
import { createContext, useContext, useState, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { DataImport, ImportStatus, ColumnMetadata, ProcessingResult } from "@/types/data-imports"

interface DataImportContextType {
  currentImport: DataImport | null
  setCurrentImport: (importData: DataImport | null) => void
  uploadFile: (file: File) => Promise<string>
  analyzeFile: (fileId: string) => Promise<void>
  loading: boolean
}

const DataImportContext = createContext<DataImportContextType | undefined>(undefined)

export function DataImportProvider({ children }: { children: React.ReactNode }) {
  const [currentImport, setCurrentImport] = useState<DataImport | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { currentOrganization, user } = useAuth()

  const uploadFile = useCallback(async (file: File) => {
    if (!currentOrganization || !user) {
      throw new Error("Usuário não autenticado ou organização não selecionada")
    }

    setLoading(true)
    try {
      console.log('Iniciando upload para organização:', currentOrganization.id)
      
      // Criar registro do import
      const { data: importData, error: importError } = await supabase
        .from('data_imports')
        .insert({
          organization_id: currentOrganization.id,
          created_by: user.id,
          name: file.name,
          original_filename: file.name,
          file_type: file.type,
          status: 'pending' as ImportStatus,
          columns_metadata: {},
          column_analysis: {},
          data_quality: {},
          data_validation: {},
          table_name: file.name.replace(/\.[^/.]+$/, "").toLowerCase().replace(/\s+/g, "_")
        })
        .select()
        .single()

      if (importError) {
        console.error('Erro ao criar import:', importError)
        throw importError
      }

      console.log('Import criado:', importData)

      // Upload do arquivo
      const filePath = `${currentOrganization.id}/${importData.id}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Erro no upload do arquivo:', uploadError)
        throw uploadError
      }

      console.log('Arquivo enviado com sucesso:', filePath)

      // Atualizar storage_path e status
      const { data: updatedImport, error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'uploaded' as ImportStatus
        })
        .eq('id', importData.id)
        .eq('organization_id', currentOrganization.id) // Garantir que estamos atualizando o registro correto
        .select()
        .single()

      if (updateError) {
        console.error('Erro ao atualizar import:', updateError)
        throw updateError
      }

      console.log('Import atualizado:', updatedImport)
      setCurrentImport(updatedImport)
      return importData.id
    } catch (error: any) {
      console.error('Erro no upload:', error)
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload do arquivo",
        variant: "destructive"
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [currentOrganization, user, toast])

  const analyzeFile = useCallback(async (fileId: string) => {
    if (!currentOrganization) {
      throw new Error("Organização não selecionada")
    }

    setLoading(true)
    try {
      console.log('Iniciando análise do arquivo:', fileId)
      
      // Atualizar status para analyzing
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({ status: 'analyzing' })
        .eq('id', fileId)
        .eq('organization_id', currentOrganization.id)

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError)
        throw updateError
      }

      // Chamar função de análise
      const { error } = await supabase.functions
        .invoke('analyze-file', {
          body: { 
            fileId,
            organizationId: currentOrganization.id 
          }
        })

      if (error) {
        console.error('Erro na função de análise:', error)
        throw error
      }

      // Buscar dados atualizados
      const { data: importData, error: fetchError } = await supabase
        .from('data_imports')
        .select('*')
        .eq('id', fileId)
        .eq('organization_id', currentOrganization.id)
        .single()

      if (fetchError) {
        console.error('Erro ao buscar dados atualizados:', fetchError)
        throw fetchError
      }

      console.log('Análise concluída:', importData)
      setCurrentImport(importData)
    } catch (error: any) {
      console.error('Erro na análise:', error)
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar o arquivo",
        variant: "destructive"
      })

      // Atualizar status para error
      await supabase
        .from('data_imports')
        .update({
          status: 'error',
          error_message: error.message || "Erro desconhecido na análise"
        })
        .eq('id', fileId)
        .eq('organization_id', currentOrganization.id)
    } finally {
      setLoading(false)
    }
  }, [currentOrganization, toast])

  return (
    <DataImportContext.Provider
      value={{
        currentImport,
        setCurrentImport,
        uploadFile,
        analyzeFile,
        loading
      }}
    >
      {children}
    </DataImportContext.Provider>
  )
}

export function useDataImport() {
  const context = useContext(DataImportContext)
  if (context === undefined) {
    throw new Error('useDataImport must be used within a DataImportProvider')
  }
  return context
}
