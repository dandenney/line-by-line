#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🧪 Testing Settings Page Fix...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testSettingsFix() {
  try {
    console.log('\n📝 Step 1: Verify system templates exist')
    
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .in('id', ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'])
      .eq('is_active', true)

    if (templatesError) {
      console.log('❌ Templates check error:', templatesError.message)
      return false
    }

    console.log(`✅ Found ${templates?.length || 0} system templates`)
    templates?.forEach(template => {
      console.log(`  - ${template.name}: ${template.id}`)
      console.log(`    Questions: ${template.questions?.join(', ')}`)
    })

    if (!templates || templates.length < 2) {
      console.log('❌ Missing system templates')
      return false
    }

    console.log('\n🎉 Settings page should now work!')
    console.log('✨ The QuestionTemplateSelector will:')
    console.log('  1. Load system templates from database')
    console.log('  2. Show Learning Reflection and Daily Standup options')
    console.log('  3. Allow users to select their preferred question set')
    console.log('  4. Save the selection to user_settings.active_template_id')
    console.log('')
    console.log('🚀 Try accessing the settings page now!')

    return true

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

testSettingsFix()
  .then((success) => {
    if (success) {
      console.log('\n✅ Settings fix verification passed!')
    } else {
      console.log('\n❌ Settings fix verification failed')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })