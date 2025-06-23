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

  if (req.method === 'GET') {
    // GET endpoint to load entries (bypasses RLS)
    try {
      const { user_id } = req.query;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ error: 'Missing user_id parameter' });
      }

      // Verify user can only access their own data
      if (user_id !== user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user_id)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, entry_date, content } = req.body;

    if (!user_id || !entry_date || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify user can only create entries for themselves
    if (user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Validate content length
    if (typeof content !== 'string' || content.length > 10000) {
      return res.status(400).json({ error: 'Content too long' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(entry_date)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // First, ensure user settings exist
    try {
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (!existingSettings) {
        // Create user settings
        await supabase
          .from('user_settings')
          .insert({
            user_id,
            streak_days: [1, 2, 3, 4, 5],
            default_questions: [
              "What did you learn today?",
              "What was most confusing or challenging today?", 
              "What did you learn about how you learn?"
            ]
          });
      }
    } catch (error) {
      console.error('Warning: Could not ensure user settings exist:', error);
    }

    // Check if entry already exists for this date
    const { data: existingEntry } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user_id)
      .eq('entry_date', entry_date)
      .single();

    let result;
    
    if (existingEntry) {
      // Update existing entry
      const { data, error } = await supabase
        .from('entries')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', existingEntry.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      result = data;
    } else {
      // Create new entry
      const { data, error } = await supabase
        .from('entries')
        .insert({
          user_id,
          entry_date,
          content
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      result = data;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withRateLimit(handler); 