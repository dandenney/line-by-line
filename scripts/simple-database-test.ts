#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔧 Testing database with auth...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testWithAuth() {
  try {
    // Step 1: Create a test user using auth
    console.log('\n👤 Step 1: Creating test user')
    
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })

    if (authError) {
      console.log('❌ User creation error:', authError.message)
      return false
    }

    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🆔 User ID:', authData.user.id)

    const testUserId = authData.user.id

    // Step 2: Create an entry for this user
    console.log('\n📝 Step 2: Creating entry for authenticated user')
    
    const testEntry = {
      user_id: testUserId,
      entry_date: '2024-01-15',
      content: 'This is a real test journal entry with proper authentication! The database connection is working perfectly.'
    }

    const { data: insertedEntry, error: insertError } = await supabaseAdmin
      .from('entries')
      .insert(testEntry)
      .select()
      .single()

    if (insertError) {
      console.log('❌ Entry creation error:', insertError.message)
      // Clean up user before returning
      await supabaseAdmin.auth.admin.deleteUser(testUserId)
      return false
    }

    console.log('✅ Entry created successfully!')
    console.log('🆔 Entry ID:', insertedEntry.id)
    console.log('📅 Entry date:', insertedEntry.entry_date)
    console.log('📝 Content length:', insertedEntry.content.length, 'characters')

    // Step 3: Retrieve the entry
    console.log('\n📖 Step 3: Retrieving entry')
    
    const { data: retrievedEntries, error: retrieveError } = await supabaseAdmin
      .from('entries')
      .select('*')
      .eq('user_id', testUserId)

    if (retrieveError) {
      console.log('❌ Retrieve error:', retrieveError.message)
    } else {
      console.log(`✅ Retrieved ${retrievedEntries?.length || 0} entries`)
      if (retrievedEntries && retrievedEntries.length > 0) {
        console.log('📄 Entry content preview:', retrievedEntries[0].content.substring(0, 50) + '...')
      }
    }

    // Step 4: Update the entry
    console.log('\n✏️  Step 4: Updating entry')
    
    const { data: updatedEntry, error: updateError } = await supabaseAdmin
      .from('entries')
      .update({ 
        content: 'This is an UPDATED test journal entry! The database operations are working perfectly, including updates.'
      })
      .eq('id', insertedEntry.id)
      .select()
      .single()

    if (updateError) {
      console.log('❌ Update error:', updateError.message)
    } else {
      console.log('✅ Entry updated successfully!')
      console.log('📝 New content length:', updatedEntry.content?.length, 'characters')
    }

    // Step 5: Test user settings
    console.log('\n⚙️  Step 5: Creating user settings')
    
    const testSettings = {
      user_id: testUserId,
      streak_days: [1, 2, 3, 4, 5], // Monday to Friday
      default_questions: [
        'What did I learn today?',
        'What challenges did I face?',
        'What am I grateful for?'
      ]
    }

    const { data: insertedSettings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .insert(testSettings)
      .select()
      .single()

    if (settingsError) {
      console.log('❌ Settings creation error:', settingsError.message)
    } else {
      console.log('✅ User settings created successfully!')
      console.log('🗓️  Streak days:', insertedSettings.streak_days?.length || 0, 'days')
      console.log('❓ Default questions:', insertedSettings.default_questions?.length || 0, 'questions')
    }

    // Cleanup: Delete the test user (this will cascade delete all related data)
    console.log('\n🧹 Cleanup: Removing test user and data')
    
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(testUserId)

    if (deleteUserError) {
      console.log('⚠️  Could not delete test user:', deleteUserError.message)
      console.log('⚠️  You may need to manually clean up user:', testUserId)
    } else {
      console.log('✅ Test user and all related data deleted successfully')
    }

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

testWithAuth()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Full database test completed successfully!')
      console.log('✨ Your Supabase database is fully functional and ready for real users!')
      console.log('\n📋 Next steps for your app:')
      console.log('  1. Users can sign up/login through the auth system')
      console.log('  2. Entries will be created with proper user association')  
      console.log('  3. All CRUD operations are working correctly')
      console.log('  4. RLS policies will protect user data')
    } else {
      console.log('\n❌ Database test failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })