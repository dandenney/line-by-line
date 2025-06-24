import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Service role client for operations that need to bypass RLS (server-side only)
const createServiceRoleClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Service role client cannot be used in browser');
  }
  return createClient<Database>(
    supabaseUrl, 
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

// Helper functions for common operations
export const supabaseHelpers = {
  // Entry operations
  entries: {
    // Get all entries for a user
    async getAll(userId: string) {
      try {
        console.log('Fetching entries for user:', userId);
        
        // Use direct Supabase query
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', userId)
          .order('entry_date', { ascending: false });
        
        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }
        
        console.log('Successfully fetched entries:', data);
        return data || [];
        
      } catch (error) {
        console.error('Error fetching entries:', error);
        throw error;
      }
    },

    // Get entry by date
    async getByDate(userId: string, date: string) {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', date)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data
    },

    // Get entry by ID
    async getById(entryId: string) {
      try {
        // Use API endpoint with auth header
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch(`/api/entries/${entryId}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching entry by ID:', error);
        throw error;
      }
    },

    // Create new entry
    async create(entry: Database['public']['Tables']['entries']['Insert']) {
      const { data, error } = await supabase
        .from('entries')
        .insert(entry)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Update entry
    async update(id: string, updates: Database['public']['Tables']['entries']['Update']) {
      const { data, error } = await supabase
        .from('entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Delete entry
    async delete(id: string) {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // User settings operations
  userSettings: {
    // Get user settings
    async get(userId: string) {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // Create or update user settings
    async upsert(settings: Database['public']['Tables']['user_settings']['Insert']) {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert(settings)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Ensure user settings exist (using service role to bypass RLS)
    async ensureExists(userId: string) {
      try {
        // Try to get existing settings
        const existing = await this.get(userId);
        if (existing) return existing;
      } catch {
        // Settings don't exist, create them using service role
        const serviceClient = createServiceRoleClient();
        const { data, error: createError } = await serviceClient
          .from('user_settings')
          .insert({
            user_id: userId,
            streak_days: [1, 2, 3, 4, 5],
            default_questions: [
              "What did you learn today?",
              "What was most confusing or challenging today?", 
              "What did you learn about how you learn?"
            ]
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return data;
      }
    }
  },

  // Question templates operations
  questionTemplates: {
    // Get all templates for a user
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    // Get active template
    async getActive(userId: string) {
      const { data, error } = await supabase
        .from('question_templates')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // Create template
    async create(template: Database['public']['Tables']['question_templates']['Insert']) {
      const { data, error } = await supabase
        .from('question_templates')
        .insert(template)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Update template
    async update(id: string, updates: Database['public']['Tables']['question_templates']['Update']) {
      const { data, error } = await supabase
        .from('question_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Delete template
    async delete(id: string) {
      const { error } = await supabase
        .from('question_templates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Streak analytics operations
  streakAnalytics: {
    // Get analytics for a user
    async get(userId: string) {
      const { data, error } = await supabase
        .from('streak_analytics')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    // Calculate and update streak
    async updateStreak(userId: string) {
      const { error } = await supabase
        .rpc('update_streak_analytics', { user_uuid: userId })
      
      if (error) throw error
    }
  },

  // Database functions
  functions: {
    // Get user's current streak
    async getCurrentStreak(userId: string) {
      const { data, error } = await supabase
        .rpc('calculate_user_streak', { user_uuid: userId })
      
      if (error) throw error
      return data
    },

    // Get weekly entries
    async getWeeklyEntries(userId: string, weekStart: string) {
      const { data, error } = await supabase
        .rpc('get_weekly_entries', { 
          user_uuid: userId, 
          week_start: weekStart 
        })
      
      if (error) throw error
      return data
    },

    // Get user's active questions
    async getUserQuestions(userId: string) {
      const { data, error } = await supabase
        .rpc('get_user_questions', { user_uuid: userId })
      
      if (error) throw error
      return data
    }
  }
}

export default supabase 