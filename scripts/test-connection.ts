#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🔌 Testing Supabase connection...')
console.log(`📍 URL: ${supabaseUrl}`)
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('\n✅ Test 1: Basic connection')
    const { data, error } = await supabase
      .from('entries')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Basic connection successful')
    
    // Test 2: List all tables in the public schema
    console.log('\n📊 Test 2: Available tables')
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')
      .select()
    
    if (tablesError) {
      console.log('⚠️  Could not fetch table list (this is expected if function doesnt exist)')
      console.log('Let\'s try a different approach...')
      
      // Try to query some known tables
      const knownTables = ['entries', 'users', 'user_settings', 'question_templates', 'entry_comments', 'streak_analytics']
      
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .limit(1)
          
          if (!error) {
            console.log(`✅ Table "${table}" exists and is accessible`)
          }
        } catch (e) {
          console.log(`❌ Table "${table}" not accessible or doesn't exist`)
        }
      }
    } else {
      console.log('📋 Available tables:', tables)
    }
    
    // Test 3: Try to get entries
    console.log('\n📝 Test 3: Sample data retrieval')
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .limit(5)
    
    if (entriesError) {
      console.log('❌ Could not fetch entries:', entriesError.message)
    } else {
      console.log(`✅ Found ${entries?.length || 0} entries`)
      if (entries && entries.length > 0) {
        console.log('📄 Sample entry:', JSON.stringify(entries[0], null, 2))
      }
    }
    
    // Test 4: Check authentication state
    console.log('\n🔐 Test 4: Authentication state')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('❌ Auth error:', authError.message)
    } else if (user) {
      console.log('✅ User authenticated:', user.email)
    } else {
      console.log('ℹ️  No user currently authenticated (this is expected)')
    }
    
    return true
  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

testConnection()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Connection test completed successfully!')
    } else {
      console.log('\n❌ Connection test failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })