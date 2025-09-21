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

async function clearDatabase() {
  console.log('🗑️  Clearing database...')

  try {
    // List of tables to drop (known tables from the error message)
    const tablesToDrop = [
      'question_templates',
      'reflection_entries',
      'writing_prompts',
      // Add any other tables you know exist
    ]

    console.log('Attempting to drop known tables...')

    // Try to drop each table
    for (const tableName of tablesToDrop) {
      console.log(`Dropping table: ${tableName}`)

      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP TABLE IF EXISTS "${tableName}" CASCADE;`
      })

      if (error && !error.message.includes('does not exist')) {
        console.error(`Error dropping table ${tableName}:`, error)
      } else {
        console.log(`✅ Dropped table: ${tableName}`)
      }
    }

    // Alternative: Drop all tables using raw SQL
    console.log('Dropping all tables in public schema...')
    const { error: dropAllError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
          LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
        END $$;
      `
    })

    if (dropAllError) {
      console.error('Error with bulk drop:', dropAllError)
    } else {
      console.log('✅ All tables dropped successfully')
    }

    console.log('🎉 Database cleared successfully!')

  } catch (error) {
    console.error('Error clearing database:', error)
  }
}

// Run the script
clearDatabase()