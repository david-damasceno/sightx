
export type ImportStep = 'upload' | 'context' | 'quality' | 'visualization';

export interface ColumnMetadata {
  id: string;
  import_id: string;
  original_name: string;
  display_name: string | null;
  description: string | null;
  data_type: string;
  sample_values: any[];
  statistics: ColumnStatistics | null;
  created_at: string;
}

export interface ColumnStatistics {
  completeness: number;
  uniqueness: number;
  null_count: number;
  duplicate_count: number;
  min?: number;
  max?: number;
  avg?: number;
  median?: number;
  std_dev?: number;
}

export interface ImportAnalysis {
  id: string;
  import_id: string;
  analysis_type: string;
  configuration: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DataVisualization {
  id: string;
  analysis_id: string | null;
  type: string;
  configuration: {
    title: string;
    description: string;
    query: string;
    params: Record<string, any>;
    data: any[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface ImportState {
  currentStep: ImportStep;
  fileId: string | null;
  tableName: string | null;
  columns: ColumnMetadata[];
  analyses: ImportAnalysis[];
  visualizations: DataVisualization[];
  isLoading: boolean;
  error: string | null;
}
