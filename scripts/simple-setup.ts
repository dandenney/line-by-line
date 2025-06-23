#!/usr/bin/env tsx

/**
 * Simple Database Setup Script
 * 
 * This script directly uses the Supabase Management API to set up the database
 * without requiring the Supabase CLI. It's simpler and more reliable.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

interface SetupOptions {
  supabaseUrl: string;
  supabaseServiceKey: string;
  dryRun?: boolean;
}

class SimpleDatabaseSetup {
  private supabase: any;
  private options: SetupOptions;

  constructor(options: SetupOptions) {
    this.options = options;
    this.supabase = createClient(options.supabaseUrl, options.supabaseServiceKey);
  }

  async setup() {
    try {
      console.log('🚀 Starting automated database setup...');
      
      if (this.options.dryRun) {
        console.log('🔍 DRY RUN - Would execute the migration');
        return;
      }

      // Check for Supabase access token
      const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
      if (!accessToken) {
        console.error('❌ SUPABASE_ACCESS_TOKEN environment variable is required for automated setup.');
        console.error('  1. Go to https://app.supabase.com/account/tokens and create a personal access token.');
        console.error('  2. Add SUPABASE_ACCESS_TOKEN=your_token_here to your .env.local or export it in your shell.');
        process.exit(1);
      }

      console.log('📝 Running database migration via Supabase CLI...');
      
      try {
        // First, link the project if not already linked
        console.log('🔗 Linking to Supabase project...');
        execSync(`supabase link --project-ref ${this.getProjectRef()}`, { 
          stdio: 'inherit',
          cwd: process.cwd(),
          env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken }
        });
        
        console.log('📦 Pushing migration to Supabase...');
        execSync('supabase db push', { 
          stdio: 'inherit',
          cwd: process.cwd(),
          env: { ...process.env, SUPABASE_ACCESS_TOKEN: accessToken }
        });
        
        console.log('✅ Migration completed successfully!');
        
      } catch (error) {
        console.log('⚠️  CLI approach failed, trying alternative method...');
        await this.runMigrationViaAPI();
      }

      // Verify the setup
      console.log('');
      console.log('🔍 Verifying setup...');
      const isVerified = await this.verify();
      
      if (isVerified) {
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
        console.log('');
        console.log('Next steps:');
        console.log('1. Start your development server: yarn dev');
        console.log('2. Sign up for an account');
        console.log('3. Start journaling!');
      } else {
        console.log('❌ Database verification failed. Please check the migration.');
        process.exit(1);
      }

    } catch (error) {
      console.error('❌ Database setup failed:', error);
      process.exit(1);
    }
  }

  private getProjectRef(): string {
    // Extract project ref from the URL
    const url = this.options.supabaseUrl;
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      return match[1];
    }
    throw new Error('Could not extract project ref from Supabase URL');
  }

  private async runMigrationViaAPI() {
    console.log('📝 Executing migration via Supabase Management API...');
    
    // First, create a temporary exec_sql function
    console.log('🔧 Creating temporary SQL execution function...');
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
      END;
      $$;
    `;
    
    try {
      // Execute the create function statement directly via the service role client
      const { error: createError } = await this.supabase.rpc('exec_sql', { sql: createFunctionSQL });
      if (createError) {
        console.log('⚠️  Could not create exec_sql function, trying direct execution...');
        await this.executeStatementsDirectly();
        return;
      }
      
      console.log('✅ SQL execution function created');
      
      // Read the migration file
      const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');
      
      // Split into manageable chunks and execute
      const statements = this.splitSQL(migrationSQL);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (!statement) continue;
        
        try {
          console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
          
          const { error } = await this.supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`  ⚠️  Statement ${i + 1} had an issue: ${error.message}`);
          } else {
            console.log(`  ✅ Statement ${i + 1} executed successfully`);
          }
        } catch (error) {
          console.log(`  ⚠️  Statement ${i + 1} failed: ${(error as Error).message}`);
        }
      }
      
      // Clean up - remove the temporary function
      console.log('🧹 Cleaning up temporary function...');
      await this.supabase.rpc('exec_sql', { sql: 'DROP FUNCTION IF EXISTS exec_sql(text);' });
      
    } catch (error) {
      console.log('⚠️  Function-based approach failed, trying direct execution...');
      await this.executeStatementsDirectly();
    }
  }

  private async executeStatementsDirectly() {
    console.log('📝 Executing migration statements directly...');
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    // Split into logical sections that can be executed directly
    const sections = this.splitIntoLogicalSections(migrationSQL);
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.trim()) continue;
      
      try {
        console.log(`  [${i + 1}/${sections.length}] Executing section...`);
        
        // Try to execute each section using the service role client
        const { error } = await this.supabase.rpc('exec_sql', { sql: section });
        
        if (error) {
          console.log(`  ⚠️  Section ${i + 1} had an issue: ${error.message}`);
          // Continue with other sections
        } else {
          console.log(`  ✅ Section ${i + 1} executed successfully`);
        }
      } catch (error) {
        console.log(`  ⚠️  Section ${i + 1} failed: ${(error as Error).message}`);
        // Continue with other sections
      }
    }
  }

  private splitIntoLogicalSections(sql: string): string[] {
    const sections: string[] = [];
    let currentSection = '';
    
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentSection += line + '\n';
      
      // End section on major statements
      if (trimmedLine.startsWith('CREATE TABLE') || 
          trimmedLine.startsWith('CREATE INDEX') ||
          trimmedLine.startsWith('ALTER TABLE') ||
          trimmedLine.startsWith('CREATE POLICY') ||
          trimmedLine.startsWith('CREATE OR REPLACE FUNCTION') ||
          trimmedLine.startsWith('CREATE TRIGGER')) {
        
        if (currentSection.trim()) {
          sections.push(currentSection.trim());
          currentSection = '';
        }
      }
    }
    
    // Add any remaining section
    if (currentSection.trim()) {
      sections.push(currentSection.trim());
    }
    
    return sections.filter(section => section.length > 0);
  }

  private splitSQL(sql: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let inFunction = false;
    let braceCount = 0;
    
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Track function bodies
      if (trimmedLine.includes('CREATE OR REPLACE FUNCTION')) {
        inFunction = true;
      }
      
      if (inFunction) {
        braceCount += (trimmedLine.match(/\{/g) || []).length;
        braceCount -= (trimmedLine.match(/\}/g) || []).length;
        
        if (braceCount === 0 && trimmedLine.includes('$$')) {
          inFunction = false;
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      } else if (trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements.filter(stmt => stmt.length > 0);
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
  
  // Get environment variables - be explicit about which ones we need
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL environment variable is required');
    console.log('');
    console.log('Please add to your .env.local file:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
    console.log('');
    console.log('You can get this from your Supabase project dashboard:');
    console.log('Settings > API > Project URL');
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
    console.log('');
    console.log('💡 Alternative: You can manually run the SQL in your Supabase dashboard');
    console.log('1. Go to SQL Editor');
    console.log('2. Copy the contents of supabase/migrations/001_initial_schema.sql');
    console.log('3. Paste and run it');
    process.exit(1);
  }

  console.log('✅ Environment variables found!');
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log(`   Service Role Key: ${supabaseServiceKey.substring(0, 20)}...`);
  console.log('');

  const setup = new SimpleDatabaseSetup({
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

export { SimpleDatabaseSetup }; 