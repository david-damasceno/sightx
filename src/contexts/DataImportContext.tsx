
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

      if (importError) throw importError

      // Upload do arquivo
      const filePath = `${currentOrganization.id}/${importData.id}/${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('data_files')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Atualizar storage_path e status
      const { data: updatedImport, error: updateError } = await supabase
        .from('data_imports')
        .update({
          storage_path: filePath,
          status: 'uploaded' as ImportStatus
        })
        .eq('id', importData.id)
        .select()
        .single()

      if (updateError) throw updateError

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
    setLoading(true)
    try {
      // Atualizar status para analyzing
      const { error: updateError } = await supabase
        .from('data_imports')
        .update({ status: 'analyzing' })
        .eq('id', fileId)

      if (updateError) throw updateError

      // Chamar função de análise
      const { error } = await supabase.functions
        .invoke('analyze-file', {
          body: { fileId }
        })

      if (error) throw error

      // Buscar dados atualizados
      const { data: importData, error: fetchError } = await supabase
        .from('data_imports')
        .select('*')
        .eq('id', fileId)
        .single()

      if (fetchError) throw fetchError

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
    } finally {
      setLoading(false)
    }
  }, [toast])

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
