
import { Json } from "@/integrations/supabase/types"

export interface ColumnMetadata {
  name: string
  type: string
  sample: string
}

export type ImportStatus = 
  | 'pending'    // estado inicial
  | 'uploading'  // arquivo sendo enviado
  | 'uploaded'   // arquivo salvo no storage
  | 'analyzing'  // azure openai analisando
  | 'editing'    // usuário editando
  | 'processing' // convertendo para tabela
  | 'completed'  // processo finalizado
  | 'error'      // erro em qualquer etapa

export interface DataImport {
  id: string
  organization_id: string
  name: string
  table_name: string
  original_filename: string
  storage_path: string | null
  file_type: string | null
  columns_metadata: {
    columns: ColumnMetadata[]
  }
  status: ImportStatus
  error_message: string | null
  row_count: number | null
  created_at: string | null
  created_by: string | null
  column_analysis: any[]
  data_quality: Json
  data_validation: Json
}
