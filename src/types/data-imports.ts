
import { Json } from "@/integrations/supabase/types"

export interface ColumnMetadata {
  id: string
  import_id: string
  original_name: string
  display_name: string | null
  description: string | null
  data_type: string
  sample_values: Json
  statistics: Json
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
  description: string | null
  metadata: Json
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
  context: string | null
  context_vector: any
}

export interface DataAnalysis {
  id: string
  import_id: string
  analysis_type: string
  configuration: Json
  results: Json
  created_at: string
  updated_at: string
}

export interface DataVisualization {
  id: string
  analysis_id: string
  type: string
  configuration: Json
  created_at: string
  updated_at: string
}

export interface ImportStepData {
  fileId: string | null
  tableName: string | null
  columns: ColumnMetadata[]
  analyses: DataAnalysis[]
  visualizations: DataVisualization[]
}

// Tipos para análise de qualidade
export interface ColumnQuality {
  completeness: number;
  uniqueness: number;
  validFormat: number;
  issues: string[];
}

export interface DataQuality {
  columnQuality: {
    [columnName: string]: ColumnQuality;
  };
  overallCompleteness: number;
  overallQuality: number;
  issuesCount: number;
}

// Tipos para visualizações
export interface ChartConfig {
  type: string;
  title: string;
  description?: string;
  data: any[];
  dataKey: string;
  nameKey?: string;
  color: string;
  name: string;
}
