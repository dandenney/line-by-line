#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Setting up database schema...')

  try {
    // Create reflection_entries table
    console.log('Creating reflection_entries table...')
    const { error: reflectionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS reflection_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          initial_reflection TEXT NOT NULL,
          conversation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
          prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          completed_at TIMESTAMPTZ DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Enable RLS
        ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

        -- Create policy for users to only see their own entries
        CREATE POLICY "Users can view own reflections" ON reflection_entries
          FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can insert own reflections" ON reflection_entries
          FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can update own reflections" ON reflection_entries
          FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can delete own reflections" ON reflection_entries
          FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
      `
    })

    if (reflectionError) {
      console.error('Error creating reflection_entries table:', reflectionError)
      return
    }
    console.log('✅ reflection_entries table created')

    // Create writing_prompts table
    console.log('Creating writing_prompts table...')
    const { error: promptsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS writing_prompts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          content TEXT NOT NULL,
          type VARCHAR(20) CHECK (type IN ('blog', 'social', 'internal')) DEFAULT 'internal',
          saved BOOLEAN DEFAULT false,
          archived BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          reflection_entry_id UUID REFERENCES reflection_entries(id) ON DELETE CASCADE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Enable RLS
        ALTER TABLE writing_prompts ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own prompts" ON writing_prompts
          FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can insert own prompts" ON writing_prompts
          FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can update own prompts" ON writing_prompts
          FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

        CREATE POLICY "Users can delete own prompts" ON writing_prompts
          FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);
      `
    })

    if (promptsError) {
      console.error('Error creating writing_prompts table:', promptsError)
      return
    }
    console.log('✅ writing_prompts table created')

    // Create indexes for better performance
    console.log('Creating indexes...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_reflection_entries_user_id ON reflection_entries(user_id);
        CREATE INDEX IF NOT EXISTS idx_reflection_entries_created_at ON reflection_entries(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_writing_prompts_user_id ON writing_prompts(user_id);
        CREATE INDEX IF NOT EXISTS idx_writing_prompts_saved ON writing_prompts(saved) WHERE saved = true;
        CREATE INDEX IF NOT EXISTS idx_writing_prompts_reflection_id ON writing_prompts(reflection_entry_id);
      `
    })

    if (indexError) {
      console.error('Error creating indexes:', indexError)
      return
    }
    console.log('✅ Indexes created')

    console.log('🎉 Database setup completed successfully!')
    console.log('')
    console.log('Tables created:')
    console.log('- reflection_entries: Stores reflections and conversation history')
    console.log('- writing_prompts: Stores individual writing prompts')
    console.log('')
    console.log('Features enabled:')
    console.log('- Row Level Security (RLS) for data privacy')
    console.log('- User-based access control')
    console.log('- Optimized indexes for performance')

  } catch (error) {
    console.error('Error setting up database:', error)
  }
}

// Run the script
setupDatabase()