#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function verifyTemplates() {
  console.log('🔍 Verifying question templates setup...\n')

  try {
    // 1. Check if system templates exist
    console.log('1. Checking system templates...')
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')

    if (templatesError) {
      console.log('❌ Error fetching templates:', templatesError.message)
    } else {
      console.log(`✅ Found ${templates?.length || 0} system templates`)
      templates?.forEach(template => {
        console.log(`  - ${template.name} (${template.id})`)
        console.log(`    Questions: ${template.questions?.length || 0}`)
      })
    }

    // 2. Check if user_settings has active_template_id column
    console.log('\n2. Checking user_settings schema...')
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('user_settings')
      .select('id, user_id, active_template_id')
      .limit(1)

    if (settingsError) {
      console.log('❌ Error checking user_settings:', settingsError.message)
    } else {
      console.log('✅ user_settings.active_template_id column exists')
    }

    // 3. Check if the functions exist
    console.log('\n3. Testing database functions...')
    
    // Test get_available_templates function
    try {
      const { data: availableTemplates, error: funcError } = await supabaseAdmin
        .rpc('get_available_templates', { user_uuid: '00000000-0000-0000-0000-000000000001' })

      if (funcError) {
        console.log('❌ get_available_templates function error:', funcError.message)
      } else {
        console.log(`✅ get_available_templates works - returned ${availableTemplates?.length || 0} templates`)
      }
    } catch (e) {
      console.log('❌ get_available_templates function not found or has errors')
    }

    // Test get_user_questions function
    try {
      const { data: userQuestions, error: questionsError } = await supabaseAdmin
        .rpc('get_user_questions', { user_uuid: '00000000-0000-0000-0000-000000000001' })

      if (questionsError) {
        console.log('❌ get_user_questions function error:', questionsError.message)
      } else {
        console.log(`✅ get_user_questions works - returned ${userQuestions?.length || 0} questions`)
      }
    } catch (e) {
      console.log('❌ get_user_questions function not found or has errors')
    }

    // 4. If templates don't exist, create them
    if (!templates || templates.length === 0) {
      console.log('\n🔧 Creating missing system templates...')
      
      // Create learning template
      const { error: learningError } = await supabaseAdmin
        .from('question_templates')
        .insert({
          id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000000',
          name: 'Learning Reflection',
          questions: [
            'What did you learn today?',
            'What was most confusing or challenging today?',
            'What did you learn about how you learn?'
          ],
          is_active: true
        })

      if (learningError) {
        console.log('❌ Error creating learning template:', learningError.message)
      } else {
        console.log('✅ Created Learning Reflection template')
      }

      // Create standup template
      const { error: standupError } = await supabaseAdmin
        .from('question_templates')
        .insert({
          id: '00000000-0000-0000-0000-000000000002',
          user_id: '00000000-0000-0000-0000-000000000000',
          name: 'Daily Standup',
          questions: [
            'What slowed you down today, and how might someone else avoid it?',
            'Did something about your tools, stack, or workflow spark a rant or love letter?',
            'If today\'s lesson were a tweet-sized note to your past self, what would it say?'
          ],
          is_active: true
        })

      if (standupError) {
        console.log('❌ Error creating standup template:', standupError.message)
      } else {
        console.log('✅ Created Daily Standup template')
      }
    }

    console.log('\n🎉 Template verification complete!')
    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

verifyTemplates()
  .then((success) => {
    if (success) {
      console.log('\n✨ Question templates are ready!')
    } else {
      console.log('\n❌ Template verification failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })