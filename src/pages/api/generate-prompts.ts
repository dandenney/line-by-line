import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Helper function to get authenticated user from request
async function getAuthenticatedUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

const generateSharingPrompts = (entryText: string) => `
You're a developer and writing coach helping someone share what they've learned in a thoughtful way.

Based on the journal entry below, suggest up to **three specific, authentic post ideas** that could be used for a blog, LinkedIn post, or social media thread.

The prompts should:
- Be clearly based on the journal content
- Help the user write about real experiences or insights from their day
- Be appropriate for a developer audience (e.g., bootcamp students, engineers learning AI)
- Encourage reflection, storytelling, or teaching

Keep each idea short and direct—these are writing *prompts*, not finished titles or clickbait headlines. Use natural developer tone.

Avoid vague or inspirational phrasing. Do not include summaries or explanations—only return the prompt list.

### Journal Entry:
${entryText}
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

    // Get authenticated user
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { entryId } = req.body;

    if (!entryId) {
      return res.status(400).json({ error: 'Entry ID is required' });
    }

    // Get the entry content
    const { data: entry, error: entryError } = await supabase
      .from('entries')
      .select('content, user_id')
      .eq('id', entryId)
      .single();

    if (entryError || !entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    // Verify the user owns this entry
    if (entry.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    console.log('OpenAI API Key exists:', !!openaiApiKey);
    console.log('OpenAI API Key length:', openaiApiKey?.length);
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Generate the prompt
    const prompt = generateSharingPrompts(entry.content);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'Failed to generate prompts' });
    }

    const data = await response.json();
    const generatedPrompts = data.choices[0]?.message?.content || '';

    return res.status(200).json({ prompts: generatedPrompts });
  } catch (error) {
    console.error('Error generating prompts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 