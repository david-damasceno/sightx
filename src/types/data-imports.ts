import { Json } from "@/integrations/supabase/types"

export interface ColumnMetadata {
  name: string
  type: string
  sample: string
}

export interface DataImport {
  id: string
  organization_id: string
  name: string
  table_name: string
  original_filename: string
  columns_metadata: {
    columns: ColumnMetadata[]
  }
  status: 'pending' | 'processing' | 'completed' | 'error'
  error_message: string | null
  row_count: number | null
  created_at: string | null
  created_by: string | null
}