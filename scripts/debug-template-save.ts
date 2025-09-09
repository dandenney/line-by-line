#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔍 Debug Template Save Issue...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// This is what the frontend uses
const supabaseClient = createClient(supabaseUrl, anonKey)

async function debugTemplateSave() {
  try {
    // Get a real user to test with
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    if (!users?.users || users.users.length === 0) {
      console.log('❌ No users found - please sign up/login first')
      return false
    }
    
    const testUser = users.users[0]
    console.log(`🔍 Testing with user: ${testUser.email} (${testUser.id})`)

    // Step 1: Check current user settings
    console.log('\n📊 Step 1: Check current user settings')
    const { data: currentSettings, error: getCurrentError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    if (getCurrentError && getCurrentError.code !== 'PGRST116') {
      console.log('❌ Error getting current settings:', getCurrentError.message)
    } else if (getCurrentError?.code === 'PGRST116') {
      console.log('✅ No existing settings (will need to create)')
    } else {
      console.log('✅ Current settings found:')
      console.log('  - Active template:', currentSettings.active_template_id)
      console.log('  - Streak days:', currentSettings.streak_days)
    }

    // Step 2: Simulate what the frontend does when selecting a template
    console.log('\n⚙️  Step 2: Simulating template selection (Learning Reflection)')
    
    const templateId = '00000000-0000-0000-0000-000000000001'
    
    try {
      // This mimics the exact supabaseHelpers.userSettings.upsert call
      const { data: upsertResult, error: upsertError } = await supabaseClient
        .from('user_settings')
        .upsert({
          user_id: testUser.id,
          active_template_id: templateId,
          streak_days: [1, 2, 3, 4, 5],
          default_questions: [
            "What did you learn today?",
            "What was most confusing or challenging today?",
            "What did you learn about how you learn?"
          ]
        })
        .select()
        .single()

      if (upsertError) {
        console.log('❌ Frontend upsert error:', upsertError.message)
        console.log('🔍 Error details:', JSON.stringify(upsertError, null, 2))
        
        // Try with admin client to see if it's an RLS issue
        console.log('\n🔧 Trying with admin client...')
        const { data: adminResult, error: adminError } = await supabaseAdmin
          .from('user_settings')
          .upsert({
            user_id: testUser.id,
            active_template_id: templateId,
            streak_days: [1, 2, 3, 4, 5],
            default_questions: [
              "What did you learn today?",
              "What was most confusing or challenging today?",
              "What did you learn about how you learn?"
            ]
          })
          .select()
          .single()
        
        if (adminError) {
          console.log('❌ Admin upsert also failed:', adminError.message)
        } else {
          console.log('✅ Admin upsert succeeded - this is an RLS permissions issue!')
          console.log('📄 Saved data:', adminResult)
        }
      } else {
        console.log('✅ Frontend upsert succeeded!')
        console.log('📄 Saved data:', upsertResult)
      }
    } catch (err) {
      console.log('💥 Unexpected error during upsert:', err)
    }

    // Step 3: Verify the save worked
    console.log('\n📖 Step 3: Verify the template was saved')
    const { data: verifySettings, error: verifyError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    if (verifyError) {
      console.log('❌ Error verifying settings:', verifyError.message)
    } else {
      console.log('✅ Settings verification:')
      console.log('  - Active template:', verifySettings.active_template_id)
      console.log('  - Expected:', templateId)
      console.log('  - Match:', verifySettings.active_template_id === templateId ? '✅' : '❌')
    }

    // Step 4: Test what happens when DailyEntry tries to load questions
    console.log('\n📝 Step 4: Test question loading (simulating DailyEntry)')
    
    // This mimics what DailyEntry does
    const { data: settingsForQuestions, error: questionsError } = await supabaseClient
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    if (questionsError) {
      console.log('❌ Error loading settings for questions:', questionsError.message)
    } else {
      console.log('✅ Settings loaded for questions:')
      console.log('  - Active template:', settingsForQuestions.active_template_id)
      
      const systemTemplateQuestions = {
        '00000000-0000-0000-0000-000000000001': [
          "What did you learn today?",
          "What was most confusing or challenging today?",
          "What did you learn about how you learn?"
        ],
        '00000000-0000-0000-0000-000000000002': [
          "What slowed you down today, and how might someone else avoid it?",
          "Did something about your tools, stack, or workflow spark a rant or love letter?",
          "If today's lesson were a tweet-sized note to your past self, what would it say?"
        ]
      }
      
      const activeTemplateId = (settingsForQuestions.active_template_id || '00000000-0000-0000-0000-000000000001') as keyof typeof systemTemplateQuestions
      const questions = systemTemplateQuestions[activeTemplateId] || systemTemplateQuestions['00000000-0000-0000-0000-000000000001']
      
      console.log('📝 Questions that would be loaded:')
      questions.forEach((question, index) => {
        console.log(`    ${index + 1}. ${question}`)
      })
    }

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

debugTemplateSave()
  .then((success) => {
    if (success) {
      console.log('\n🎯 Debug complete - check output above for issues')
    } else {
      console.log('\n❌ Debug failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })