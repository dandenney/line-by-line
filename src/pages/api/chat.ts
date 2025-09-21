import type { NextApiRequest, NextApiResponse } from 'next'
import { openai } from '@/lib/openai'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, type } = req.body

    if (type === 'followup') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a thoughtful journaling companion. The user has just shared a reflection about their day. Your job is to ask one insightful follow-up question that helps them explore their thoughts deeper. Keep it warm, curious, and conversational. Don't be overly formal or therapeutic. Ask about how something made them feel, what they learned, or what it means to them. Keep responses under 50 words.`
          },
          ...messages
        ],
        max_tokens: 150,
        temperature: 0.7,
      })

      return res.status(200).json({
        message: completion.choices[0].message?.content
      })
    }

    if (type === 'prompts') {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Based on the user's reflection and conversation, generate 1-3 writing prompts that could become a blog post, social media thought, or internal sharing piece. Make them specific, actionable, and inspired by their actual reflection.

IMPORTANT: Respond with ONLY a valid JSON array. Each object must have "content" and "type" fields. Type must be one of: "blog", "social", or "internal". Keep prompts under 100 words each.

Example format:
[
  {"content": "Write about how small daily observations can lead to breakthrough insights", "type": "blog"},
  {"content": "Share a quick thought about the power of paying attention to details", "type": "social"}
]`
          },
          ...messages
        ],
        max_tokens: 400,
        temperature: 0.7,
      })

      return res.status(200).json({
        prompts: completion.choices[0].message?.content
      })
    }

    return res.status(400).json({ error: 'Invalid request type' })

  } catch (error) {
    console.error('OpenAI API Error:', error)
    return res.status(500).json({ error: 'Failed to process request' })
  }
}