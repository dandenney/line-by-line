import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Re-export types from supabase for backwards compatibility
export type { ChatMessage, WritingPrompt, ReflectionEntry } from './supabase'