import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCommentsTable() {
  try {
    console.log('Testing comments table...');
    
    // Test if the table exists by trying to select from it
    const { data, error } = await supabase
      .from('entry_comments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Error accessing comments table:', error);
      return false;
    }
    
    console.log('✅ Comments table exists and is accessible');
    return true;
  } catch (error) {
    console.error('Error testing comments table:', error);
    return false;
  }
}

async function main() {
  console.log('Testing database setup...');
  
  const commentsTableExists = await testCommentsTable();
  
  if (commentsTableExists) {
    console.log('✅ Database setup is complete');
  } else {
    console.log('❌ Database setup failed');
  }
}

main().catch(console.error); 