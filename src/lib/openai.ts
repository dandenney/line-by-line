import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface WritingPrompt {
  id: string
  content: string
  type: 'blog' | 'social' | 'internal'
  saved: boolean
  archived: boolean
  createdAt: string
}