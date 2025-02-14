
import { Json } from "@/integrations/supabase/types"

export interface ColumnMetadata {
  id: string
  file_id: string
  original_name: string
  mapped_name: string | null
  data_type: string | null
  sample_data: string | null
  status: string
  validation_rules: Json
  organization_id: string
  created_at: string
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

export interface ProcessingResult {
  id: string
  file_id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error_message: string | null
  table_name: string | null
  organization_id: string
  created_at: string
  completed_at: string | null
  processing_metadata: Json
}

export interface DataImport {
  id: string
  organization_id: string
  name: string
  table_name: string
  original_filename: string
  storage_path: string | null
  file_type: string | null
  status: ImportStatus
  error_message: string | null
  row_count: number | null
  created_at: string | null
  created_by: string | null
  data_quality: Json
  data_validation: Json
  columns_metadata: Json
  column_analysis: Json
}
