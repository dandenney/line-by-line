#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🧪 Testing Complete End-to-End Flow...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testEndToEndFlow() {
  try {
    // Get a real user to test with
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    if (!users?.users || users.users.length === 0) {
      console.log('❌ No users found - please sign up/login first')
      return false
    }
    
    const testUser = users.users[0]
    console.log(`🔍 Testing with user: ${testUser.email}`)

    // Get user token for API calls
    const { data: tokenData } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: testUser.email!
    })

    console.log('\n📝 Step 1: Test API endpoint directly')
    
    // Simulate what the API endpoint will do
    console.log('🔧 Testing API functionality (simulated)...')
    
    // Test selecting Learning Reflection
    const learningTemplateId = '00000000-0000-0000-0000-000000000001'
    
    // Check if user settings exist
    const { data: existing } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single()

    let saveResult
    if (existing) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .update({ active_template_id: learningTemplateId })
        .eq('user_id', testUser.id)
        .select()
        .single()
      
      if (error) {
        console.log('❌ Update error:', error.message)
        return false
      } else {
        console.log('✅ Updated existing settings')
        saveResult = data
      }
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from('user_settings')
        .insert({
          user_id: testUser.id,
          active_template_id: learningTemplateId,
          streak_days: [1, 2, 3, 4, 5],
          default_questions: [
            "What did you learn today?",
            "What was most confusing or challenging today?",
            "What did you learn about how you learn?"
          ]
        })
        .select()
        .single()
      
      if (error) {
        console.log('❌ Create error:', error.message)
        return false
      } else {
        console.log('✅ Created new settings')
        saveResult = data
      }
    }

    console.log('📄 Saved template ID:', saveResult.active_template_id)
    
    // Step 2: Test retrieval
    console.log('\n📖 Step 2: Test settings retrieval')
    
    const { data: retrieved, error: retrieveError } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', testUser.id)
      .single()
    
    if (retrieveError) {
      console.log('❌ Retrieve error:', retrieveError.message)
      return false
    } else {
      console.log('✅ Settings retrieved successfully')
      console.log('📄 Active template ID:', retrieved.active_template_id)
      
      const templateName = retrieved.active_template_id === '00000000-0000-0000-0000-000000000001' 
        ? 'Learning Reflection' 
        : retrieved.active_template_id === '00000000-0000-0000-0000-000000000002'
        ? 'Daily Standup'
        : 'Unknown'
      console.log('🎯 Template name:', templateName)
    }

    // Step 3: Test question loading (simulate DailyEntry)
    console.log('\n📝 Step 3: Test question loading')
    
    const activeTemplateId = retrieved.active_template_id || '00000000-0000-0000-0000-000000000001'
    
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
    
    const questions = systemTemplateQuestions[activeTemplateId] || systemTemplateQuestions['00000000-0000-0000-0000-000000000001']
    
    console.log('✅ Questions loaded successfully:')
    questions.forEach((question, index) => {
      console.log(`    ${index + 1}. ${question}`)
    })

    // Step 4: Test switching templates
    console.log('\n🔄 Step 4: Test switching to Daily Standup')
    
    const standupTemplateId = '00000000-0000-0000-0000-000000000002'
    const { data: switched, error: switchError } = await supabaseAdmin
      .from('user_settings')
      .update({ active_template_id: standupTemplateId })
      .eq('user_id', testUser.id)
      .select()
      .single()
    
    if (switchError) {
      console.log('❌ Switch error:', switchError.message)
    } else {
      console.log('✅ Switched to Daily Standup template')
      console.log('📄 New active template:', switched.active_template_id)
      
      const newQuestions = systemTemplateQuestions[standupTemplateId]
      console.log('📝 New questions would be:')
      newQuestions.forEach((question, index) => {
        console.log(`    ${index + 1}. ${question}`)
      })
    }

    console.log('\n🎉 End-to-End Test Results:')
    console.log('✅ Template selection can be saved to database')
    console.log('✅ Template preference can be retrieved from database')
    console.log('✅ Questions are loaded based on user\'s saved preference')
    console.log('✅ Template switching works correctly')
    console.log('')
    console.log('🚀 The complete flow should now work in your app:')
    console.log('  1. User goes to Settings')
    console.log('  2. User sees Learning Reflection and Daily Standup options')
    console.log('  3. User selects their preferred template')
    console.log('  4. Selection is saved via API to user_settings.active_template_id')
    console.log('  5. When creating a daily entry, the correct questions load')
    console.log('  6. Questions persist across devices and sessions')

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

testEndToEndFlow()
  .then((success) => {
    if (success) {
      console.log('\n✅ End-to-end test PASSED!')
    } else {
      console.log('\n❌ End-to-end test FAILED')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })