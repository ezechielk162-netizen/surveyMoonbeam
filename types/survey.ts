// types/survey.ts
export type QuestionType = 'radio' | 'checkbox' | 'textarea' | 'satisfaction-table' | 'ranking'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  type: QuestionType
  label: string
  required?: boolean
  options?: QuestionOption[]   // radio / checkbox
  rows?: QuestionOption[]      // satisfaction-table : lignes (ex. "Routes", "Déneigement")
  columns?: QuestionOption[]   // satisfaction-table : colonnes (ex. niveaux de satisfaction)
  allowOther?: boolean
  maxChoices?: number          // ex. 3 pour "trois principales priorités"
  placeholder?: string
}

export interface SurveySection {
  id: string
  title: string
  description?: string
  questions: Question[]
}

export type SectionAnswers = Record<string, unknown>       // questionId -> valeur
export type SurveyAnswers = Record<string, SectionAnswers> // sectionId -> SectionAnswers