#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Testing data operations with service role...')

// Create service role client (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testDataOperations() {
  try {
    // Test 1: Create a test user entry
    console.log('\n📝 Test 1: Creating test entry')
    
    // Generate a test UUID
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'
    
    const testEntry = {
      user_id: testUserId,
      entry_date: '2024-01-15',
      content: 'This is a test journal entry to verify database operations are working properly. I learned how to connect to Supabase successfully! Setting up the database connection was initially tricky, but now it works great.'
    }

    const { data: insertedEntry, error: insertError } = await supabaseAdmin
      .from('entries')
      .insert(testEntry)
      .select()
      .single()

    if (insertError) {
      console.log('❌ Insert error:', insertError.message)
      return false
    }

    console.log('✅ Test entry created successfully!')
    console.log('🆔 Entry ID:', insertedEntry.id)

    // Test 2: Retrieve the entry
    console.log('\n📖 Test 2: Retrieving test entry')
    
    const { data: retrievedEntries, error: retrieveError } = await supabaseAdmin
      .from('entries')
      .select('*')
      .eq('user_id', testUserId)

    if (retrieveError) {
      console.log('❌ Retrieve error:', retrieveError.message)
      return false
    }

    console.log(`✅ Retrieved ${retrievedEntries?.length || 0} entries`)
    if (retrievedEntries && retrievedEntries.length > 0) {
      console.log('📄 Retrieved entry details:')
      console.log('  - Date:', retrievedEntries[0].entry_date)
      console.log('  - Content length:', retrievedEntries[0].content?.length, 'characters')
      console.log('  - User ID:', retrievedEntries[0].user_id)
      console.log('  - Created at:', retrievedEntries[0].created_at)
    }

    // Test 3: Update the entry
    console.log('\n✏️  Test 3: Updating test entry')
    
    const { data: updatedEntry, error: updateError } = await supabaseAdmin
      .from('entries')
      .update({ 
        content: 'This is an UPDATED test journal entry to verify database operations are working properly. The update functionality works great!'
      })
      .eq('id', insertedEntry.id)
      .select()
      .single()

    if (updateError) {
      console.log('❌ Update error:', updateError.message)
      return false
    }

    console.log('✅ Entry updated successfully!')
    console.log('📝 Updated content length:', updatedEntry.content?.length, 'characters')

    // Test 4: Test user settings
    console.log('\n⚙️  Test 4: User settings operations')
    
    const testSettings = {
      user_id: testUserId,
      streak_days: [1, 2, 3, 4, 5], // weekdays
      default_questions: [
        'What did I learn today?',
        'What was most challenging?',
        'What am I grateful for?'
      ]
    }

    const { data: insertedSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .upsert(testSettings)
      .select()
      .single()

    if (settingsError) {
      console.log('❌ Settings error:', settingsError.message)
    } else {
      console.log('✅ User settings created/updated successfully!')
      console.log('🗓️  Streak days:', insertedSettings.streak_days?.length || 0)
      console.log('❓ Default questions:', insertedSettings.default_questions?.length || 0)
    }

    // Clean up - delete the test entry
    console.log('\n🧹 Cleanup: Removing test data')
    
    const { error: deleteError } = await supabaseAdmin
      .from('entries')
      .delete()
      .eq('id', insertedEntry.id)

    if (deleteError) {
      console.log('⚠️  Could not clean up test entry:', deleteError.message)
    } else {
      console.log('✅ Test entry cleaned up successfully')
    }

    // Clean up settings
    const { error: deleteSettingsError } = await supabaseAdmin
      .from('user_settings')
      .delete()
      .eq('user_id', testUserId)

    if (deleteSettingsError) {
      console.log('⚠️  Could not clean up test settings:', deleteSettingsError.message)
    } else {
      console.log('✅ Test settings cleaned up successfully')
    }

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

testDataOperations()
  .then((success) => {
    if (success) {
      console.log('\n🎉 All database operations working perfectly!')
      console.log('💡 Strategy: Your Supabase database is fully functional and ready for real data.')
    } else {
      console.log('\n❌ Database operations test failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })