import type { NextApiRequest, NextApiResponse } from 'next'
import { openai } from '@/lib/openai'
import { langfuse, flushLangfuse } from '@/lib/langfuse'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, type, previousResponseId, sessionId } = req.body

  // Create a trace for this conversation with sessionId
  const trace = langfuse.trace({
    name: 'journaling-conversation',
    sessionId: sessionId, // Group all traces from the same journaling session
    metadata: {
      endpoint: '/api/chat',
      timestamp: new Date().toISOString(),
      type,
    },
  })

  try {

    if (type === 'followup') {
      const systemMessage = `You are a thoughtful journaling companion. The user has just shared a reflection about their day. Your job is to ask one insightful follow-up question that helps them explore their thoughts deeper. Keep it warm, curious, and conversational. Don't be overly formal or therapeutic. Ask about how something made them feel, what they learned, or what it means to them. Keep responses under 50 words.`

      const conversationInput = messages.map((msg: any) => msg.content).join('\n\n')

      // Create a generation span for this OpenAI call
      const generation = trace.generation({
        name: 'followup-question',
        model: 'gpt-4o-mini',
        input: messages,
        metadata: {
          type: 'followup',
          previousResponseId,
        },
      })

      const response = await openai.responses.create({
        input: `${systemMessage}\n\nConversation so far:\n${conversationInput}`,
        model: 'gpt-4o-mini',
        previous_response_id: previousResponseId,
        store: true,
      })

      // Update the generation with output and usage
      generation.end({
        output: response.output_text,
        metadata: {
          responseId: response.id,
        },
      })

      // Flush before returning (important for serverless)
      await flushLangfuse()

      return res.status(200).json({
        message: response.output_text,
        responseId: response.id
      })
    }

    if (type === 'prompts') {
      const systemMessage = `Based on the user's reflection and conversation, generate 1-3 writing prompts that could become a blog post, social media thought, or internal sharing piece. Make them specific, actionable, and inspired by their actual reflection.

IMPORTANT: Respond with ONLY a valid JSON array. Each object must have "content" and "type" fields. Type must be one of: "blog", "social", or "internal". Keep prompts under 100 words each.

Example format:
[
  {"content": "Write about how small daily observations can lead to breakthrough insights", "type": "blog"},
  {"content": "Share a quick thought about the power of paying attention to details", "type": "social"}
]`

      const conversationInput = messages.map((msg: any) => msg.content).join('\n\n')

      // Create a generation span for prompt generation
      const generation = trace.generation({
        name: 'writing-prompts-generation',
        model: 'gpt-4o-mini',
        input: messages,
        metadata: {
          type: 'prompts',
          previousResponseId,
        },
      })

      const response = await openai.responses.create({
        input: `${systemMessage}\n\nConversation:\n${conversationInput}`,
        model: 'gpt-4o-mini',
        previous_response_id: previousResponseId,
        store: true,
      })

      // Update the generation with output
      generation.end({
        output: response.output_text,
        metadata: {
          responseId: response.id,
        },
      })

      // Flush before returning
      await flushLangfuse()

      return res.status(200).json({
        prompts: response.output_text,
        responseId: response.id
      })
    }

    return res.status(400).json({ error: 'Invalid request type' })

  } catch (error) {
    console.error('OpenAI API Error:', error)

    // Track the error in Langfuse
    trace.update({
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    await flushLangfuse()

    return res.status(500).json({ error: 'Failed to process request' })
  }
}