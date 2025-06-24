import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use the anon key (like the client-side does)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugRLS() {
  console.log('🔍 Debugging RLS policies...');
  
  try {
    // First, let's see if we can get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user - this explains why RLS is blocking access');
      return;
    }
    
    console.log('✅ Authenticated user:', user.id);
    console.log('📧 User email:', user.email);
    
    // Now try to query entries
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });
    
    if (error) {
      console.error('❌ Query error:', error);
      console.log('💡 This suggests an RLS policy issue');
      return;
    }
    
    console.log(`📊 Query result: ${entries?.length || 0} entries`);
    
    if (entries && entries.length > 0) {
      console.log('\n📝 Entries found:');
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.entry_date} - Content: ${entry.content.substring(0, 50)}...`);
      });
    }
    
    // Test the RLS policy directly
    console.log('\n🔍 Testing RLS policy...');
    const { data: rlsTest, error: rlsError } = await supabase
      .rpc('get_user_questions', { user_uuid: user.id });
    
    if (rlsError) {
      console.error('❌ RLS function error:', rlsError);
    } else {
      console.log('✅ RLS function works:', rlsTest);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugRLS(); 