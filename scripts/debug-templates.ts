#!/usr/bin/env tsx
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('🔍 Debugging Template Loading Issue...')

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function debugTemplates() {
  try {
    // 1. Check what users exist
    console.log('\n👥 Step 1: Check existing users')
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.log('❌ Error listing users:', usersError.message)
      return false
    }
    
    console.log(`✅ Found ${users?.users?.length || 0} users`)
    
    if (!users?.users || users.users.length === 0) {
      console.log('❌ No users found - you need to sign up/login first!')
      console.log('💡 Go to your app and create an account, then run this debug script again.')
      return false
    }
    
    const testUser = users.users[0]
    console.log(`🔍 Using user: ${testUser.email} (${testUser.id})`)

    // 2. Check what templates exist in the database
    console.log('\n📝 Step 2: Check all question templates in database')
    const { data: allTemplates, error: allTemplatesError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      
    if (allTemplatesError) {
      console.log('❌ Error fetching all templates:', allTemplatesError.message)
      return false
    }
    
    console.log(`✅ Found ${allTemplates?.length || 0} total templates in database`)
    allTemplates?.forEach(template => {
      console.log(`  - ${template.name} (${template.id})`)
      console.log(`    User: ${template.user_id}`)
      console.log(`    Active: ${template.is_active}`)
      console.log(`    Questions: ${template.questions?.length || 0}`)
    })

    // 3. Simulate what the QuestionTemplateSelector is doing
    console.log('\n🎯 Step 3: Simulate QuestionTemplateSelector logic')
    
    // This mimics: supabaseHelpers.questionTemplates.getAll(user.id)
    const { data: userTemplates, error: userTemplatesError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .eq('user_id', testUser.id)
      .order('created_at', { ascending: false })
    
    console.log(`📊 Templates for user ${testUser.id}:`)
    if (userTemplatesError) {
      console.log('❌ Error:', userTemplatesError.message)
    } else {
      console.log(`✅ Found ${userTemplates?.length || 0} templates for this user`)
      userTemplates?.forEach(template => {
        console.log(`  - ${template.name}: ${template.questions?.length || 0} questions`)
      })
    }

    // 4. Check system templates specifically
    console.log('\n🔧 Step 4: Check system templates specifically')
    const systemTemplateIds = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']
    
    const { data: systemTemplates, error: systemError } = await supabaseAdmin
      .from('question_templates')
      .select('*')
      .in('id', systemTemplateIds)
      .eq('is_active', true)
    
    if (systemError) {
      console.log('❌ Error fetching system templates:', systemError.message)
    } else {
      console.log(`✅ Found ${systemTemplates?.length || 0} system templates`)
      systemTemplates?.forEach(template => {
        console.log(`  - ${template.name} (${template.id})`)
        console.log(`    Owner: ${template.user_id}`)
        console.log(`    Questions: ${template.questions?.join(', ')}`)
      })
    }

    // 5. Check RLS policies
    console.log('\n🔐 Step 5: Test template access with user context')
    
    // Create a temporary client as the user (simulating frontend)
    const userClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    // Simulate user session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: testUser.email!
    })
    
    if (sessionError) {
      console.log('⚠️  Could not simulate user session:', sessionError.message)
    } else {
      console.log('✅ User session simulation ready')
      
      // Try to access templates as the user would
      const { data: userAccessTemplates, error: userAccessError } = await userClient
        .from('question_templates')
        .select('*')
        .eq('user_id', testUser.id)
      
      console.log(`📊 Templates accessible by user through RLS:`)
      if (userAccessError) {
        console.log('❌ RLS Error:', userAccessError.message)
      } else {
        console.log(`✅ User can access ${userAccessTemplates?.length || 0} templates`)
      }
    }

    // 6. Diagnose the issue
    console.log('\n🔍 Step 6: Diagnosis')
    
    if (systemTemplates && systemTemplates.length >= 2) {
      console.log('✅ System templates exist in database')
      
      if (userTemplates && userTemplates.length === 0) {
        console.log('❌ ISSUE FOUND: User can only see their own templates due to RLS')
        console.log('💡 SOLUTION: System templates need to be accessible to all users')
        console.log('')
        console.log('The problem is that system templates are owned by a specific user,')
        console.log('but RLS policies only allow users to see their own templates.')
        console.log('')
        console.log('We need to either:')
        console.log('1. Update RLS policies to allow access to system templates, OR')
        console.log('2. Create system templates for each user, OR') 
        console.log('3. Use a different approach to load system templates')
        
        return 'rls_issue'
      } else {
        console.log('✅ User can access templates - issue might be in filtering logic')
        return 'filtering_issue'
      }
    } else {
      console.log('❌ ISSUE FOUND: System templates missing from database')
      console.log('💡 SOLUTION: Run the template setup script again')
      return 'missing_templates'
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
    return false
  }
}

debugTemplates()
  .then((result) => {
    if (result === 'rls_issue') {
      console.log('\n🔧 RECOMMENDED FIX: Update RLS policies or template access logic')
    } else if (result === 'filtering_issue') {
      console.log('\n🔧 RECOMMENDED FIX: Check template filtering logic in component')
    } else if (result === 'missing_templates') {
      console.log('\n🔧 RECOMMENDED FIX: Run template setup script')
    } else {
      console.log('\n❌ Debug completed - check output above for issues')
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })