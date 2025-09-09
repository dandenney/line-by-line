import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { withRateLimit } from '@/lib/rate-limit';

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

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get authenticated user
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing entry ID' });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid entry ID format' });
    }

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Entry not found' });
      }
      console.error('Error fetching entry:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Verify user can only access their own entries
    if ((data as any).user_id !== user.id) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withRateLimit(handler); 