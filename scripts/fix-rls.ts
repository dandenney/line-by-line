import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...');
  
  const fixSQL = readFileSync('scripts/fix-rls.sql', 'utf-8');
  
  try {
    // Execute the fix SQL using the service role
    const { error } = await supabase.rpc('exec_sql', { sql: fixSQL });
    
    if (error) {
      console.log('⚠️  Could not use exec_sql, trying direct execution...');
      
      // Split and execute statements manually
      const statements = fixSQL.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (!statement.trim()) continue;
        
        try {
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.log(`⚠️  Statement failed: ${stmtError.message}`);
          }
        } catch (e) {
          console.log(`⚠️  Statement error: ${e}`);
        }
      }
    } else {
      console.log('✅ RLS policies fixed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Failed to fix RLS policies:', error);
  }
}

fixRLS().catch(console.error); 