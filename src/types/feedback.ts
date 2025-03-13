
import { Json } from "@/integrations/supabase/types"

export type SurveyStatus = 'draft' | 'active' | 'inactive' | 'archived'
export type SurveyType = 'simple' | 'detailed' | 'advanced'

export interface NPSSurvey {
  id: string
  organization_id: string
  title: string
  description: string | null
  status: SurveyStatus
  type: SurveyType
  settings: Json | null
  created_at: string
  updated_at: string
}

export interface NPSResponse {
  id: string
  survey_id: string
  respondent_email: string | null
  score: number
  feedback: string | null
  answers: Json | null
  created_at: string
  updated_at: string
}

export type QuestionType = 'nps' | 'text' | 'opcoes' | 'rating'

export interface Question {
  tipo: QuestionType
  texto: string
  opcoes?: string[]
  obrigatoria?: boolean
}

export interface SurveySettings {
  ai_suggestion?: string
  questions?: Question[]
  [key: string]: any
}
