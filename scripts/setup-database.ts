#!/usr/bin/env tsx

/**
 * Automated Database Setup Script
 * 
 * This script automatically sets up the database schema in Supabase
 * using the Management API. It can be run by contributors and users
 * to initialize their database without manual SQL execution.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SetupOptions {
  supabaseUrl: string;
  supabaseServiceKey: string; // Service role key for admin operations
  dryRun?: boolean;
}

class DatabaseSetup {
  private supabase: any;
  private options: SetupOptions;

  constructor(options: SetupOptions) {
    this.options = options;
    this.supabase = createClient(options.supabaseUrl, options.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async setup() {
    console.log('🚀 Starting database setup...');
    
    try {
      // Read the migration SQL
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      if (this.options.dryRun) {
        console.log('📋 DRY RUN - Would execute the following SQL:');
        console.log('='.repeat(50));
        console.log(migrationSQL);
        console.log('='.repeat(50));
        return;
      }

      // Execute the migration
      console.log('📝 Executing database migration...');
      const { error } = await this.supabase.rpc('exec_sql', { sql: migrationSQL });
      
      if (error) {
        throw new Error(`Migration failed: ${error.message}`);
      }

      console.log('✅ Database setup completed successfully!');
      console.log('');
      console.log('📊 Created tables:');
      console.log('  - entries');
      console.log('  - user_settings');
      console.log('  - question_templates');
      console.log('  - streak_analytics');
      console.log('');
      console.log('🔐 Row Level Security enabled on all tables');
      console.log('⚡ Database functions and triggers created');
      console.log('');
      console.log('🎉 Your Line-by-Line app is ready to use!');

    } catch (error) {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    }
  }

  async verify() {
    console.log('🔍 Verifying database setup...');
    
    try {
      // Check if tables exist
      const tables = ['entries', 'user_settings', 'question_templates', 'streak_analytics'];
      
      for (const table of tables) {
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} not found or accessible`);
          return false;
        }
        
        console.log(`✅ Table ${table} exists`);
      }

      // Check if functions exist
      const functions = ['calculate_user_streak', 'update_streak_analytics', 'get_weekly_entries', 'get_user_questions'];
      
      for (const func of functions) {
        const { data, error } = await this.supabase.rpc(func, { user_uuid: '00000000-0000-0000-0000-000000000000' });
        
        if (error && !error.message.includes('invalid input syntax')) {
          console.error(`❌ Function ${func} not found`);
          return false;
        }
        
        console.log(`✅ Function ${func} exists`);
      }

      console.log('✅ Database verification completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Database verification failed:', error);
      return false;
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const verify = args.includes('--verify');
  
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    process.exit(1);
  }
  
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.error('');
    console.error('To get your service role key:');
    console.error('1. Go to your Supabase project dashboard');
    console.error('2. Navigate to Settings > API');
    console.error('3. Copy the "service_role" key (not the anon key)');
    console.error('4. Add it to your .env.local file:');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
    process.exit(1);
  }

  const setup = new DatabaseSetup({
    supabaseUrl,
    supabaseServiceKey,
    dryRun
  });

  if (verify) {
    await setup.verify();
  } else {
    await setup.setup();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseSetup }; 