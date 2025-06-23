import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Use the anon key (like the client-side does)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardQuery() {
  console.log('🔍 Testing dashboard query...');
  
  try {
    // Test the exact query from supabaseHelpers.entries.getAll
    const userId = '31468134-9f21-428d-9a14-4dea20c95317'; // Your user ID
    
    console.log('🔍 Supabase Debug - Getting all entries for user:', userId);
    
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false });
    
    console.log('📊 Supabase query result:', { data, error });
    console.log('📊 Number of entries returned:', data?.length || 0);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }
    
    console.log('✅ Supabase entries retrieved successfully');
    
    if (data && data.length > 0) {
      console.log('\n📝 Entries found:');
      data.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.entry_date} - Content: ${entry.content.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testDashboardQuery(); 