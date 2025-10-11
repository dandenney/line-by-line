import { Langfuse } from 'langfuse'

if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
  throw new Error('Missing Langfuse environment variables')
}

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASEURL || 'https://us.cloud.langfuse.com',
})

// Helper to flush pending events (useful for serverless)
export async function flushLangfuse() {
  await langfuse.flushAsync()
}
