
export interface DataQualityMetrics {
  completeness: number
  uniqueness: number
  consistency: number
  issues: DataQualityIssue[]
}

export interface DataQualityIssue {
  type: string
  description: string
  rowCount: number
  severity: 'low' | 'medium' | 'high'
  suggestedFix?: string
}

export interface ColumnStatistics {
  count: number
  distinctCount: number
  nullCount: number
  distribution: Record<string, number>
  mean?: number
  median?: number
  quartiles?: number[]
  min?: number
  max?: number
  stdDev?: number
  skewness?: number
  outlierCount?: number
  dataType?: string
  validationScore?: number
}

export interface AnalysisSuggestion {
  title: string
  description: string
  metrics: string[]
  visualization: string
  sql_example?: string
  type: 'time_series' | 'correlation' | 'distribution' | 'clustering' | 'segmentation' | 'forecasting' | 'anomaly_detection' | 'text_analysis'
  complexity?: {
    score: number
    label: string
  }
  business_value?: {
    score: number
    label: string
  }
  tags?: string[]
}

export interface DataStructure {
  columns: string[]
  dataTypes: Record<string, string>
  metrics: string[]
  dimensions: string[]
  temporalColumns: string[]
}

export interface DataImportMetadata {
  id: string
  name: string
  rowCount: number
  columnCount: number
  createdAt: Date
  fileType?: string
  fileSize?: number
  importedBy?: string
}

export interface DataRelationship {
  sourceColumn: string
  targetTable: string
  targetColumn: string
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  confidence: number
}

export interface AutoInsight {
  id: string
  title: string
  description: string
  type: string
  importance: 'low' | 'medium' | 'high' | 'critical'
  generatedAt: Date
  relatedColumns: string[]
  suggestedAction?: string
}
