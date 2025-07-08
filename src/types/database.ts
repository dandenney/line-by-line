// Database types for Line-by-Line journaling app
// These types match the Supabase database schema

export interface Database {
  public: {
    Tables: {
      entries: {
        Row: Entry
        Insert: EntryInsert
        Update: EntryUpdate
      }
      entry_comments: {
        Row: EntryComment
        Insert: EntryCommentInsert
        Update: EntryCommentUpdate
      }
      user_settings: {
        Row: UserSettings
        Insert: UserSettingsInsert
        Update: UserSettingsUpdate
      }
      question_templates: {
        Row: QuestionTemplate
        Insert: QuestionTemplateInsert
        Update: QuestionTemplateUpdate
      }
      streak_analytics: {
        Row: StreakAnalytics
        Insert: StreakAnalyticsInsert
        Update: StreakAnalyticsUpdate
      }
      writing_prompts: {
        Row: WritingPrompt
        Insert: WritingPromptInsert
        Update: WritingPromptUpdate
      }
    }
    Functions: {
      calculate_user_streak: {
        Args: { user_uuid: string }
        Returns: number
      }
      update_streak_analytics: {
        Args: { user_uuid: string }
        Returns: void
      }
      get_weekly_entries: {
        Args: { user_uuid: string; week_start: string }
        Returns: Array<{
          entry_date: string
          content: string
        }>
      }
      get_user_questions: {
        Args: { user_uuid: string }
        Returns: string[]
      }
    }
  }
}

// Entry types
export interface Entry {
  id: string
  user_id: string
  entry_date: string // ISO date string
  content: string
  created_at: string
  updated_at: string
}

export interface EntryInsert {
  id?: string
  user_id: string
  entry_date: string
  content: string
  created_at?: string
  updated_at?: string
}

export interface EntryUpdate {
  id?: string
  user_id?: string
  entry_date?: string
  content?: string
  created_at?: string
  updated_at?: string
}

// Entry Comment types
export interface EntryComment {
  id: string
  entry_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface EntryCommentInsert {
  id?: string
  entry_id: string
  user_id: string
  content: string
  created_at?: string
  updated_at?: string
}

export interface EntryCommentUpdate {
  id?: string
  entry_id?: string
  user_id?: string
  content?: string
  created_at?: string
  updated_at?: string
}

// User Settings types
export interface UserSettings {
  id: string
  user_id: string
  streak_days: number[] // 1=Monday, 2=Tuesday, etc.
  default_questions: string[]
  created_at: string
  updated_at: string
}

export interface UserSettingsInsert {
  id?: string
  user_id: string
  streak_days?: number[]
  default_questions?: string[]
  created_at?: string
  updated_at?: string
}

export interface UserSettingsUpdate {
  id?: string
  user_id?: string
  streak_days?: number[]
  default_questions?: string[]
  created_at?: string
  updated_at?: string
}

// Question Template types
export interface QuestionTemplate {
  id: string
  user_id: string
  name: string
  questions: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface QuestionTemplateInsert {
  id?: string
  user_id: string
  name: string
  questions: string[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface QuestionTemplateUpdate {
  id?: string
  user_id?: string
  name?: string
  questions?: string[]
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// Streak Analytics types
export interface StreakAnalytics {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  total_entries: number
  last_entry_date: string | null
  calculated_at: string
}

export interface StreakAnalyticsInsert {
  id?: string
  user_id: string
  current_streak?: number
  longest_streak?: number
  total_entries?: number
  last_entry_date?: string | null
  calculated_at?: string
}

export interface StreakAnalyticsUpdate {
  id?: string
  user_id?: string
  current_streak?: number
  longest_streak?: number
  total_entries?: number
  last_entry_date?: string | null
  calculated_at?: string
}

// Writing Prompt types
export interface WritingPrompt {
  id: string
  user_id: string
  entry_id: string
  prompt_text: string
  source_entry_date: string
  is_used: boolean
  status: 'active' | 'written' | 'archived'
  created_at: string
  updated_at: string
}

export interface WritingPromptInsert {
  id?: string
  user_id: string
  entry_id: string
  prompt_text: string
  source_entry_date: string
  is_used?: boolean
  status?: 'active' | 'written' | 'archived'
  created_at?: string
  updated_at?: string
}

export interface WritingPromptUpdate {
  id?: string
  user_id?: string
  entry_id?: string
  prompt_text?: string
  source_entry_date?: string
  is_used?: boolean
  status?: 'active' | 'written' | 'archived'
  created_at?: string
  updated_at?: string
}

// Helper types for frontend use
export interface WeeklyEntry {
  entry_date: string
  content: string
}

export interface UserQuestions {
  questions: string[]
}

// Frontend Entry interface (for backward compatibility with existing code)
export interface FrontendEntry {
  id: number | string
  text: string
  date: Date | string
}

// Utility types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 