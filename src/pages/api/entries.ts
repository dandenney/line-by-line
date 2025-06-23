import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // GET endpoint to load entries (bypasses RLS)
    try {
      const { user_id } = req.query;

      if (!user_id || typeof user_id !== 'string') {
        return res.status(400).json({ error: 'Missing user_id parameter' });
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user_id)
        .order('entry_date', { ascending: false });

      if (error) {
        console.error('Error loading entries:', error);
        return res.status(500).json({ error: error.message });
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
      console.log('Warning: Could not ensure user settings exist:', error);
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
        return res.status(500).json({ error: error.message });
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
        return res.status(500).json({ error: error.message });
      }
      
      result = data;
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 