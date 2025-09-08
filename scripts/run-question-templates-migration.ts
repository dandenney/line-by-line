#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Running Question Templates Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250104180000_add_question_set_selection.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`${i + 1}. Executing: ${statement.substring(0, 60)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
        
        if (error) {
          // Try direct query if exec_sql is not available
          const { error: directError } = await supabase.from('_').select('*').limit(0);
          if (directError) {
            console.log('⚠️  Using direct SQL execution...');
            // For statements that create functions, we'll need to handle them specially
            if (statement.includes('CREATE OR REPLACE FUNCTION')) {
              console.log('⚠️  Function creation may need manual execution in Supabase dashboard');
              console.log('SQL:', statement + ';');
              console.log('');
              continue;
            }
          }
          console.error('❌ Error:', error.message);
        } else {
          console.log('✅ Success');
        }
      } catch (e) {
        console.log('⚠️  Statement may need manual execution:', e);
        console.log('SQL:', statement + ';');
        console.log('');
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log('\nTo verify the migration worked:');
    console.log('1. Check your Supabase dashboard > Database > Tables');
    console.log('2. Verify that user_settings table has active_template_id column');
    console.log('3. Verify that question_templates table has the system templates');
    console.log('4. Test the question selection feature in your app');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration().catch(console.error);
}

export { runMigration };