import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUserMatch() {
  console.log('🔍 Verifying user ID match...');
  
  try {
    const userId = '31468134-9f21-428d-9a14-4dea20c95317';
    
    // Check entries with service role (bypasses RLS)
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);
    
    if (entriesError) {
      console.error('❌ Service role query error:', entriesError);
      return;
    }
    
    console.log(`📊 Service role found ${entries?.length || 0} entries`);
    
    if (entries && entries.length > 0) {
      console.log('📝 Entry details:');
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ID: ${entry.id}`);
        console.log(`   User ID: ${entry.user_id}`);
        console.log(`   Date: ${entry.entry_date}`);
        console.log(`   Content: ${entry.content.substring(0, 50)}...`);
      });
    }
    
    // Check user_settings with service role
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);
    
    if (settingsError) {
      console.error('❌ User settings query error:', settingsError);
    } else {
      console.log(`👤 User settings found: ${userSettings?.length || 0}`);
      if (userSettings && userSettings.length > 0) {
        console.log('📋 User settings details:', userSettings[0]);
      }
    }
    
    // Check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError) {
      console.error('❌ Auth user query error:', authError);
    } else {
      console.log('✅ Auth user found:', authUser.user?.email);
      console.log('🆔 Auth user ID:', authUser.user?.id);
    }
    
    // Test RLS policy directly
    console.log('\n🔍 Testing RLS policy with service role...');
    const { data: rlsTest, error: rlsError } = await supabase
      .rpc('get_user_questions', { user_uuid: userId });
    
    if (rlsError) {
      console.error('❌ RLS function error:', rlsError);
    } else {
      console.log('✅ RLS function works:', rlsTest);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

verifyUserMatch(); 