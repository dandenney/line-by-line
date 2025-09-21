import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching our schema
export interface ReflectionEntry {
  id: string
  initial_reflection: string
  conversation_messages: ChatMessage[]
  prompts: WritingPrompt[]
  created_at: string
  completed_at: string
  user_id?: string | null
}

export interface WritingPrompt {
  id: string
  content: string
  type: 'blog' | 'social' | 'internal'
  saved: boolean
  archived: boolean
  created_at: string
  reflection_entry_id?: string | null
  user_id?: string | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Database operations with user authentication
export const dbOperations = {
  // Reflection entries
  async getReflectionEntries(): Promise<ReflectionEntry[]> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return []
    }

    const { data, error } = await supabase
      .from('reflection_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reflection entries:', error)
      return []
    }

    return data || []
  },

  async createReflectionEntry(entry: Omit<ReflectionEntry, 'id' | 'created_at' | 'completed_at' | 'user_id'>): Promise<ReflectionEntry | null> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await supabase
      .from('reflection_entries')
      .insert({
        initial_reflection: entry.initial_reflection,
        conversation_messages: entry.conversation_messages,
        prompts: entry.prompts,
        completed_at: new Date().toISOString(),
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reflection entry:', error)
      return null
    }

    return data
  },

  // Writing prompts
  async getSavedPrompts(): Promise<WritingPrompt[]> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return []
    }

    const { data, error } = await supabase
      .from('writing_prompts')
      .select('*')
      .eq('saved', true)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved prompts:', error)
      return []
    }

    return data || []
  },

  async savePrompt(prompt: Omit<WritingPrompt, 'id' | 'created_at' | 'user_id'>): Promise<WritingPrompt | null> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await supabase
      .from('writing_prompts')
      .insert({
        content: prompt.content,
        type: prompt.type,
        saved: true,
        archived: prompt.archived,
        reflection_entry_id: prompt.reflection_entry_id,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving prompt:', error)
      return null
    }

    return data
  },

  async updatePrompt(id: string, updates: Partial<WritingPrompt>): Promise<WritingPrompt | null> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user')
      return null
    }

    const { data, error } = await supabase
      .from('writing_prompts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own prompts
      .select()
      .single()

    if (error) {
      console.error('Error updating prompt:', error)
      return null
    }

    return data
  }
}