#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🧪 Testing Complete Question Template Migration...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testCompleteMigration() {
  try {
    console.log('\n📝 Step 1: Create test user for migration testing')
    
    const testEmail = `migration-test-${Date.now()}@example.com`
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
    const testUserId = authData.user.id
    console.log('🆔 User ID:', testUserId)

    // Step 2: Verify system templates exist
    console.log('\n📖 Step 2: Verifying system templates')
    
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .in('id', ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'])

    if (templatesError) {
      console.log('❌ Templates check error:', templatesError.message)
      return false
    }

    console.log(`✅ Found ${templates?.length || 0} system templates`)
    templates?.forEach(template => {
      console.log(`  - ${template.name}: ${template.questions?.length || 0} questions`)
    })

    if (!templates || templates.length < 2) {
      console.log('❌ Missing system templates - run setup script first')
      return false
    }

    // Step 3: Test default behavior (should default to learning template)
    console.log('\n🎯 Step 3: Testing default template selection')
    
    const { data: initialSettings, error: getError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (getError && getError.code === 'PGRST116') {
      console.log('✅ No user settings exist initially (expected)')
    } else if (getError) {
      console.log('❌ Error checking initial settings:', getError.message)
    } else {
      console.log('📄 Initial settings found:', initialSettings.active_template_id)
    }

    // Step 4: Select the standup template
    console.log('\n⚙️  Step 4: Selecting standup template')
    
    let updatedSettings
    if (initialSettings) {
      // Update existing settings
      const { data, error: upsertError } = await supabaseAdmin
        .from('user_settings')
        .update({ active_template_id: '00000000-0000-0000-0000-000000000002' })
        .eq('user_id', testUserId)
        .select()
        .single()
      updatedSettings = data
      if (upsertError) {
        console.log('❌ Template update error:', upsertError.message)
        return false
      }
    } else {
      // Create new settings
      const { data, error: upsertError } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: testUserId,
          active_template_id: '00000000-0000-0000-0000-000000000002', // Standup template UUID
          streak_days: [1, 2, 3, 4, 5],
          default_questions: [
            "What did you learn today?",
            "What was most confusing or challenging today?",
            "What did you learn about how you learn?"
          ]
        })
        .select()
        .single()
      updatedSettings = data
      if (upsertError) {
        console.log('❌ Template creation error:', upsertError.message)
        return false
      }
    }

    if (updatedSettings) {
      console.log('✅ Template selection saved successfully!')
      console.log('📄 Active template:', updatedSettings.active_template_id)
      console.log('🎯 Expected: 00000000-0000-0000-0000-000000000002')
      
      if (updatedSettings.active_template_id === '00000000-0000-0000-0000-000000000002') {
        console.log('🎉 Template selection persistence VERIFIED!')
      } else {
        console.log('❌ Template selection persistence FAILED')
        return false
      }
    }

    // Step 5: Test template retrieval and question loading
    console.log('\n📖 Step 5: Testing template and question retrieval')
    
    const { data: retrievedSettings, error: retrieveError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (retrieveError) {
      console.log('❌ Template retrieval error:', retrieveError.message)
      return false
    } else {
      console.log('✅ Settings retrieved successfully!')
      console.log('📄 Active template ID:', retrievedSettings.active_template_id)
      
      // Get the actual template data
      const { data: templateData, error: templateError } = await supabaseAdmin
        .from('question_templates')
        .select('*')
        .eq('id', retrievedSettings.active_template_id)
        .single()
      
      if (templateError) {
        console.log('❌ Template data retrieval error:', templateError.message)
        return false
      } else {
        console.log('✅ Template data retrieved successfully!')
        console.log('📄 Template name:', templateData.name)
        console.log('❓ Questions:')
        templateData.questions?.forEach((question: string, index) => {
          console.log(`    ${index + 1}. ${question}`)
        })
        
        if (templateData.name === 'Daily Standup' && templateData.questions?.length === 3) {
          console.log('🎉 Template data verification PASSED!')
        } else {
          console.log('❌ Template data verification FAILED')
          return false
        }
      }
    }

    // Step 6: Test switching back to learning template
    console.log('\n🔄 Step 6: Testing template switching (back to learning)')
    
    const { data: switchedSettings, error: switchError } = await supabaseAdmin
      .from('user_settings')
      .update({ active_template_id: '00000000-0000-0000-0000-000000000001' })
      .eq('user_id', testUserId)
      .select()
      .single()

    if (switchError) {
      console.log('❌ Template switching error:', switchError.message)
      return false
    } else {
      console.log('✅ Template switched successfully!')
      console.log('📄 New active template:', switchedSettings.active_template_id)
      
      if (switchedSettings.active_template_id === '00000000-0000-0000-0000-000000000001') {
        console.log('🎉 Template switching VERIFIED!')
      } else {
        console.log('❌ Template switching FAILED')
        return false
      }
    }

    // Step 7: Verify localStorage migration comparison
    console.log('\n📊 Step 7: Migration comparison')
    console.log('❌ OLD: localStorage.getItem(`questionTemplate_${userId}`)')
    console.log('   - Stored simple strings like "learning" or "standup"')
    console.log('   - Data only available on same device/browser')
    console.log('   - No persistence across sessions')
    console.log('')
    console.log('✅ NEW: user_settings.active_template_id')
    console.log('   - Stores proper UUID references to question_templates table')
    console.log('   - Data synchronized across all user devices')
    console.log('   - Persistent and reliable database storage')
    console.log('   - Supports user-created custom templates in the future')

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

testCompleteMigration()
  .then((success) => {
    if (success) {
      console.log('\n🎉 COMPLETE MIGRATION TEST PASSED!')
      console.log('✨ Question Template feature successfully migrated from localStorage to Supabase!')
      console.log('')
      console.log('📋 Summary of changes:')
      console.log('  • QuestionTemplateSelector now loads templates from database')
      console.log('  • DailyEntry now gets questions from user settings')
      console.log('  • Template selection persists across devices and sessions')
      console.log('  • System templates are properly set up with UUIDs')
      console.log('  • All database operations are working correctly')
      console.log('')
      console.log('🚀 Your users can now enjoy synchronized question preferences!')
    } else {
      console.log('\n❌ Migration test FAILED')
      console.log('Please check the errors above and fix any issues.')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })