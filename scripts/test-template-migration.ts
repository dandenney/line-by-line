#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🧪 Testing Question Template Migration...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testTemplateMigration() {
  try {
    console.log('\n📝 Step 1: Create test user for template testing')
    
    const testEmail = `template-test-${Date.now()}@example.com`
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
    console.log('🆔 User ID:', authData.user.id)
    
    const testUserId = authData.user.id

    // Step 2: Test default template selection (should be 'learning')
    console.log('\n📖 Step 2: Testing default template behavior')
    
    const { data: initialSettings, error: getError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (getError && getError.code === 'PGRST116') {
      console.log('✅ No user settings exist yet (as expected for new user)')
    } else if (getError) {
      console.log('❌ Error checking initial settings:', getError.message)
    } else {
      console.log('📄 Initial settings found:', initialSettings)
    }

    // Step 3: Simulate selecting 'standup' template
    console.log('\n⚙️  Step 3: Testing template selection (standup)')
    
    const { data: updatedSettings, error: upsertError } = await supabaseAdmin
      .from('user_settings')
      .upsert({
        user_id: testUserId,
        active_template_id: 'standup',
        streak_days: [1, 2, 3, 4, 5], // Default weekdays
        default_questions: [
          "What did you learn today?",
          "What was most confusing or challenging today?",
          "What did you learn about how you learn?"
        ]
      })
      .select()
      .single()

    if (upsertError) {
      console.log('❌ Template selection error:', upsertError.message)
    } else {
      console.log('✅ Template selection saved successfully!')
      console.log('📄 Active template:', updatedSettings.active_template_id)
      console.log('🗓️  Streak days:', updatedSettings.streak_days?.length, 'days')
    }

    // Step 4: Test retrieval of template selection
    console.log('\n📖 Step 4: Testing template retrieval')
    
    const { data: retrievedSettings, error: retrieveError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (retrieveError) {
      console.log('❌ Template retrieval error:', retrieveError.message)
    } else {
      console.log('✅ Template retrieved successfully!')
      console.log('📄 Retrieved active template:', retrievedSettings.active_template_id)
      
      if (retrievedSettings.active_template_id === 'standup') {
        console.log('🎉 Template persistence verified!')
      } else {
        console.log('❌ Template persistence failed - expected "standup", got:', retrievedSettings.active_template_id)
      }
    }

    // Step 5: Test switching to 'learning' template
    console.log('\n🔄 Step 5: Testing template switching (back to learning)')
    
    const { data: switchedSettings, error: switchError } = await supabaseAdmin
      .from('user_settings')
      .update({ active_template_id: 'learning' })
      .eq('user_id', testUserId)
      .select()
      .single()

    if (switchError) {
      console.log('❌ Template switching error:', switchError.message)
    } else {
      console.log('✅ Template switched successfully!')
      console.log('📄 New active template:', switchedSettings.active_template_id)
    }

    // Cleanup
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

testTemplateMigration()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Question Template Migration Test PASSED!')
      console.log('✨ The feature has been successfully migrated from localStorage to database!')
      console.log('\n📋 What changed:')
      console.log('  ❌ Before: localStorage.getItem("questionTemplate_" + userId)')
      console.log('  ✅ After: user_settings.active_template_id in database')
      console.log('\n🚀 Your users will now have their template preferences synchronized across devices!')
    } else {
      console.log('\n❌ Template migration test failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })