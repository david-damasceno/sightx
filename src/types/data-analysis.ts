
export type AnalysisType = 
  | 'duplicates'
  | 'quality'
  | 'statistics'
  | 'distribution'
  | 'correlations'
  | 'patterns'

export type TransformationType =
  | 'trim'
  | 'uppercase'
  | 'lowercase'
  | 'replace'
  | 'remove_special'
  | 'format_number'
  | 'format_date'

export interface DataAnalysis {
  id: string
  fileId: string
  organizationId: string
  analysisType: AnalysisType
  columnName: string
  results: any
  createdAt: string
}

export interface DataTransformation {
  id: string
  fileId: string
  organizationId: string
  columnName: string
  transformationType: TransformationType
  parameters: Record<string, any>
  createdAt: string
  appliedAt: string | null
}

export interface ColumnStatistics {
  count: number
  distinctCount: number
  nullCount: number
  min?: number | string
  max?: number | string
  mean?: number
  median?: number
  mode?: string[]
  standardDeviation?: number
  quartiles?: number[]
  distribution?: Record<string, number>
}

export interface DataQualityMetrics {
  completeness: number
  uniqueness: number
  consistency: number
  accuracy: number
  validity: number
  issues: Array<{
    type: string
    description: string
    rowCount: number
  }>
}
