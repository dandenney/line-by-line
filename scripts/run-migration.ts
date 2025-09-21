#!/usr/bin/env tsx

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const connectionString = process.env.POSTGRES_URL!

if (!connectionString) {
  console.error('Missing POSTGRES_URL in .env.local')
  process.exit(1)
}

async function runMigration() {
  console.log('🚀 Running database migration...')

  // Set NODE_TLS_REJECT_UNAUTHORIZED for this process
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const client = new Client({
    connectionString
  })

  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Read the migration SQL file
    const migrationSQL = readFileSync(join(__dirname, 'migration.sql'), 'utf8')

    console.log('📄 Executing migration...')
    await client.query(migrationSQL)

    console.log('🎉 Migration completed successfully!')
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
    console.error('❌ Migration failed:', error)
  } finally {
    await client.end()
  }
}

// Run the migration
runMigration()