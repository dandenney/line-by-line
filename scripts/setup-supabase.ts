#!/usr/bin/env tsx

/**
 * Supabase CLI Setup Script
 * 
 * This script uses the Supabase CLI to automatically set up the database.
 * It's more reliable than the Management API approach.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SetupOptions {
  projectRef?: string;
  dryRun?: boolean;
}

class SupabaseSetup {
  private options: SetupOptions;

  constructor(options: SetupOptions = {}) {
    this.options = options;
  }

  async checkSupabaseCLI(): Promise<boolean> {
    try {
      execSync('supabase --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async installSupabaseCLI(): Promise<void> {
    console.log('📦 Installing Supabase CLI...');
    
    const platform = process.platform;
    
    try {
      if (platform === 'darwin') {
        // macOS
        execSync('brew install supabase/tap/supabase', { stdio: 'inherit' });
      } else if (platform === 'linux') {
        // Linux
        execSync('curl -fsSL https://supabase.com/install.sh | sh', { stdio: 'inherit' });
      } else if (platform === 'win32') {
        // Windows
        console.log('Please install Supabase CLI manually:');
        console.log('https://supabase.com/docs/guides/cli/getting-started');
        process.exit(1);
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      
      console.log('✅ Supabase CLI installed successfully!');
    } catch (error) {
      console.error('❌ Failed to install Supabase CLI:', error);
      console.log('');
      console.log('Please install manually:');
      console.log('https://supabase.com/docs/guides/cli/getting-started');
      process.exit(1);
    }
  }

  async setup(): Promise<void> {
    console.log('🚀 Starting Supabase setup...');
    
    // Check if Supabase CLI is installed
    if (!(await this.checkSupabaseCLI())) {
      await this.installSupabaseCLI();
    }

    // Initialize Supabase project if not already done
    if (!existsSync('supabase/config.toml')) {
      console.log('📁 Initializing Supabase project...');
      execSync('supabase init', { stdio: 'inherit' });
    }

    // Copy our migration to the Supabase migrations folder
    const sourceMigration = join(process.cwd(), 'supabase', 'migrations', '001_initial_schema.sql');
    const targetMigration = join(process.cwd(), 'supabase', 'migrations', '20240101000000_initial_schema.sql');
    
    if (existsSync(sourceMigration) && !existsSync(targetMigration)) {
      console.log('📝 Copying migration file...');
      const migrationContent = readFileSync(sourceMigration, 'utf-8');
      writeFileSync(targetMigration, migrationContent);
    }

    if (this.options.dryRun) {
      console.log('📋 DRY RUN - Would run the following commands:');
      console.log('  supabase db reset');
      console.log('  supabase db push');
      return;
    }

    // Reset and push the database
    console.log('🔄 Resetting database...');
    execSync('supabase db reset', { stdio: 'inherit' });
    
    console.log('📤 Pushing schema to database...');
    execSync('supabase db push', { stdio: 'inherit' });

    console.log('✅ Database setup completed successfully!');
    console.log('');
    console.log('🎉 Your Line-by-Line app is ready to use!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Sign up for an account');
    console.log('3. Start journaling!');
  }

  async verify(): Promise<boolean> {
    console.log('🔍 Verifying database setup...');
    
    try {
      // Check if tables exist by running a simple query
      const result = execSync('supabase db diff --schema public', { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      const expectedTables = ['entries', 'user_settings', 'question_templates', 'streak_analytics'];
      const missingTables = expectedTables.filter(table => !result.includes(table));
      
      if (missingTables.length > 0) {
        console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
        return false;
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
  const projectRef = args.find(arg => arg.startsWith('--project='))?.split('=')[1];
  
  const setup = new SupabaseSetup({
    projectRef,
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

export { SupabaseSetup }; 