#!/usr/bin/env tsx

import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

async function executeSQL(sql: string, description: string) {
  console.log(`Executing: ${description}`)

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })

    if (response.ok) {
      console.log(`✅ ${description} - Success`)
      return true
    } else {
      const errorText = await response.text()
      console.log(`❌ ${description} - Failed:`, errorText)
      return false
    }
  } catch (error) {
    console.log(`❌ ${description} - Error:`, error)
    return false
  }
}

async function createTables() {
  console.log('🚀 Creating database tables...')

  // Create reflection_entries table
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

  await executeSQL(createReflectionTable, 'Creating reflection_entries table')

  // Create writing_prompts table
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

  await executeSQL(createPromptsTable, 'Creating writing_prompts table')

  // Create indexes
  const createIndexes = [
    `CREATE INDEX IF NOT EXISTS idx_reflection_entries_created_at ON reflection_entries(created_at DESC);`,
    `CREATE INDEX IF NOT EXISTS idx_writing_prompts_saved ON writing_prompts(saved) WHERE saved = true;`,
    `CREATE INDEX IF NOT EXISTS idx_writing_prompts_reflection_id ON writing_prompts(reflection_entry_id);`
  ]

  for (const index of createIndexes) {
    await executeSQL(index, 'Creating index')
  }

  console.log('🎉 Database setup complete!')
}

// Alternative approach using direct table creation via REST API
async function createTablesDirectly() {
  console.log('🚀 Attempting direct table creation...')

  try {
    // Try to insert a test record to see if tables exist
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/reflection_entries?select=count`, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    })

    if (testResponse.status === 200) {
      console.log('✅ Tables already exist!')
      return
    }

    console.log('Tables don\'t exist, they need to be created manually in Supabase dashboard')
    console.log('')
    console.log('Please go to Supabase Dashboard → SQL Editor and run:')
    console.log('')
    console.log(`-- Create reflection_entries table
CREATE TABLE reflection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_reflection TEXT NOT NULL,
  conversation_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID DEFAULT NULL
);

-- Create writing_prompts table
CREATE TABLE writing_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('blog', 'social', 'internal')) DEFAULT 'internal',
  saved BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reflection_entry_id UUID DEFAULT NULL,
  user_id UUID DEFAULT NULL
);

-- Create indexes
CREATE INDEX idx_reflection_entries_created_at ON reflection_entries(created_at DESC);
CREATE INDEX idx_writing_prompts_saved ON writing_prompts(saved) WHERE saved = true;
CREATE INDEX idx_writing_prompts_reflection_id ON writing_prompts(reflection_entry_id);`)

  } catch (error) {
    console.error('Error checking tables:', error)
  }
}

// Run both approaches
Promise.all([createTables(), createTablesDirectly()])