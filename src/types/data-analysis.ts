
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
