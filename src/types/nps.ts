export type SurveyType = 'simple' | 'detailed' | 'advanced'
export type SurveyStatus = 'draft' | 'active' | 'inactive' | 'archived'

export interface NPSSurvey {
  id: string
  organization_id: string
  title: string
  description?: string
  type: SurveyType
  status: SurveyStatus
  settings: {
    customMessage?: string
    followUpQuestion?: string
    theme?: 'light' | 'dark'
    showBranding?: boolean
  }
  created_at?: string
  updated_at?: string
}

export interface NPSResponse {
  id: string
  survey_id: string
  score: number
  comment?: string
  sentiment?: string
  metadata?: Record<string, any>
  respondent_email?: string
  created_at?: string
}

export interface NPSMetrics {
  total_responses: number
  promoters: number
  passives: number
  detractors: number
  nps_score: number
  promoters_percentage: number
  passives_percentage: number
  detractors_percentage: number
}