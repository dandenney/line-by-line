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

async function setupTemplatesSimple() {
  console.log('🔧 Setting up question templates (simple approach)...\n')

  try {
    // 1. Create a system user for templates if it doesn't exist
    console.log('1. Setting up system user for templates...')
    
    const { data: systemUser, error: systemUserError } = await supabaseAdmin.auth.admin.createUser({
      email: 'system@lineby.line',
      password: 'system-user-' + Math.random(),
      email_confirm: true,
      user_metadata: { is_system: true }
    })

    if (systemUserError && !systemUserError.message.includes('already been registered')) {
      console.log('❌ Error creating system user:', systemUserError.message)
      return false
    }

    const systemUserId = systemUser?.user?.id || '00000000-0000-0000-0000-000000000000'
    
    if (systemUser?.user) {
      console.log('✅ System user created:', systemUserId)
    } else {
      console.log('✅ Using existing system user approach')
    }

    // 2. Create system templates with real user ID
    console.log('\n2. Creating system templates...')
    
    // Delete existing templates first
    const { error: deleteError } = await supabaseAdmin
      .from('question_templates')
      .delete()
      .in('id', ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'])

    if (deleteError) {
      console.log('ℹ️  No existing templates to delete (this is fine)')
    }

    // Create learning template with actual user ID
    const { error: learningError } = await supabaseAdmin
      .from('question_templates')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        user_id: systemUserId,
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
      
      // Try alternative approach - create with a real user
      console.log('🔄 Trying alternative approach with real user...')
      
      // Get any existing user from the system
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
      if (existingUsers?.users && existingUsers.users.length > 0) {
        const realUserId = existingUsers.users[0].id
        console.log('🔍 Using real user ID for templates:', realUserId)
        
        const { error: altLearningError } = await supabaseAdmin
          .from('question_templates')
          .insert({
            id: '00000000-0000-0000-0000-000000000001',
            user_id: realUserId,
            name: 'Learning Reflection',
            questions: [
              'What did you learn today?',
              'What was most confusing or challenging today?',
              'What did you learn about how you learn?'
            ],
            is_active: true
          })
        
        if (altLearningError) {
          console.log('❌ Alternative learning template creation failed:', altLearningError.message)
        } else {
          console.log('✅ Learning template created with real user ID')
        }
        
        // Create standup template
        const { error: altStandupError } = await supabaseAdmin
          .from('question_templates')
          .insert({
            id: '00000000-0000-0000-0000-000000000002',
            user_id: realUserId,
            name: 'Daily Standup',
            questions: [
              'What slowed you down today, and how might someone else avoid it?',
              'Did something about your tools, stack, or workflow spark a rant or love letter?',
              'If today\'s lesson were a tweet-sized note to your past self, what would it say?'
            ],
            is_active: true
          })
        
        if (altStandupError) {
          console.log('❌ Alternative standup template creation failed:', altStandupError.message)
        } else {
          console.log('✅ Daily Standup template created with real user ID')
        }
      }
    } else {
      console.log('✅ Learning template created')
      
      // Create standup template
      const { error: standupError } = await supabaseAdmin
        .from('question_templates')
        .insert({
          id: '00000000-0000-0000-0000-000000000002',
          user_id: systemUserId,
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
        console.log('✅ Daily Standup template created')
      }
    }

    // 3. Verify templates were created
    console.log('\n3. Verifying templates...')
    const { data: finalTemplates, error: verifyError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .in('id', ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'])

    if (verifyError) {
      console.log('❌ Error verifying templates:', verifyError.message)
    } else {
      console.log(`✅ Verification complete - found ${finalTemplates?.length || 0} templates`)
      finalTemplates?.forEach(template => {
        console.log(`  - ${template.name}: ${template.questions?.length || 0} questions`)
      })
    }

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

setupTemplatesSimple()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Templates setup complete!')
      console.log('💡 Your question template migration is now ready to test!')
    } else {
      console.log('\n❌ Template setup failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })