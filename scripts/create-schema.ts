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

// Create admin client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createSchema() {
  console.log('🚀 Creating database schema...')

  try {
    // Step 1: Create reflection_entries table
    console.log('Creating reflection_entries table...')

    const createReflectionTable = `
      CREATE TABLE IF NOT EXISTS reflection_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        initial_reflection TEXT NOT NULL,
        conversation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
        prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ DEFAULT NOW(),
        user_id UUID DEFAULT NULL
      );
    `

    const { error: tableError1 } = await supabase.rpc('exec', { sql: createReflectionTable })
    if (tableError1) {
      console.log('Table creation via RPC failed, trying direct query...')
      // Try without RPC
      const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: createReflectionTable })
      })

      if (!response1.ok) {
        throw new Error(`HTTP ${response1.status}: ${await response1.text()}`)
      }
    }
    console.log('✅ reflection_entries table created')

    // Step 2: Create writing_prompts table
    console.log('Creating writing_prompts table...')

    const createPromptsTable = `
      CREATE TABLE IF NOT EXISTS writing_prompts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        type VARCHAR(20) CHECK (type IN ('blog', 'social', 'internal')) DEFAULT 'internal',
        saved BOOLEAN DEFAULT false,
        archived BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        reflection_entry_id UUID DEFAULT NULL,
        user_id UUID DEFAULT NULL
      );
    `

    const { error: tableError2 } = await supabase.rpc('exec', { sql: createPromptsTable })
    if (tableError2) {
      const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: createPromptsTable })
      })

      if (!response2.ok) {
        throw new Error(`HTTP ${response2.status}: ${await response2.text()}`)
      }
    }
    console.log('✅ writing_prompts table created')

    // Step 3: Create indexes
    console.log('Creating indexes...')

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_reflection_entries_created_at ON reflection_entries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_writing_prompts_saved ON writing_prompts(saved) WHERE saved = true;
      CREATE INDEX IF NOT EXISTS idx_writing_prompts_reflection_id ON writing_prompts(reflection_entry_id);
    `

    const { error: indexError } = await supabase.rpc('exec', { sql: createIndexes })
    if (indexError) {
      const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ sql: createIndexes })
      })

      if (!response3.ok) {
        console.log('Index creation failed, but that\'s okay - tables are ready')
      } else {
        console.log('✅ Indexes created')
      }
    } else {
      console.log('✅ Indexes created')
    }

    console.log('🎉 Database schema created successfully!')
    console.log('')
    console.log('Tables created:')
    console.log('- reflection_entries: Stores reflections and conversation history')
    console.log('- writing_prompts: Stores individual writing prompts')
    console.log('')
    console.log('Ready to migrate from localStorage!')

  } catch (error) {
    console.error('❌ Schema creation failed:', error)
  }
}

// Run the script
createSchema()