import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEntries() {
  console.log('🔍 Checking database entries...');
  
  try {
    // Get all entries
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching entries:', error);
      return;
    }
    
    console.log(`📊 Total entries in database: ${entries?.length || 0}`);
    
    if (entries && entries.length > 0) {
      console.log('\n📝 Recent entries:');
      entries.slice(0, 10).forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.entry_date} - User: ${entry.user_id} - Content: ${entry.content.substring(0, 50)}...`);
      });
    }
    
    // Get user settings
    const { data: userSettings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*');
    
    if (settingsError) {
      console.error('❌ Error fetching user settings:', settingsError);
    } else {
      console.log(`\n👤 User settings count: ${userSettings?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

checkEntries(); 