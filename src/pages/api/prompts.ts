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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get authenticated user
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get all prompts for the user
    try {
      const { data, error } = await supabase
        .from('writing_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading prompts:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Save a new prompt
    try {
      const { entryId, promptText, sourceEntryDate } = req.body;

      if (!entryId || !promptText || !sourceEntryDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Verify the entry belongs to the user
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .select('id')
        .eq('id', entryId)
        .eq('user_id', user.id)
        .single();

      if (entryError || !entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }

      const { data, error } = await supabase
        .from('writing_prompts')
        .insert({
          user_id: user.id,
          entry_id: entryId,
          prompt_text: promptText,
          source_entry_date: sourceEntryDate,
          is_used: false,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving prompt:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    // Update a prompt status
    try {
      const { promptId, status } = req.body;

      if (!promptId || !status || !['active', 'written', 'archived'].includes(status)) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('writing_prompts')
        .update({ 
          status: status,
          is_used: status === 'written' // Keep is_used in sync for backward compatibility
        })
        .eq('id', promptId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating prompt:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete a prompt
    try {
      const { promptId } = req.body;

      if (!promptId) {
        return res.status(400).json({ error: 'Missing prompt ID' });
      }

      const { error } = await supabase
        .from('writing_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting prompt:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 