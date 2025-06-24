import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use the anon key (like the client-side does)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testClientQuery() {
  console.log('🔍 Testing client-side query...');
  
  try {
    // First, let's see if we can authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user');
      return;
    }
    
    console.log('✅ Authenticated user:', user.id);
    
    // Now try to query entries (like the client does)
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log(`📊 Client query result: ${entries?.length || 0} entries`);
    
    if (entries && entries.length > 0) {
      console.log('\n📝 Entries found:');
      entries.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.entry_date} - Content: ${entry.content.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testClientQuery(); 