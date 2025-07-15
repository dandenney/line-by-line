import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^"|"$/g, ''); // Remove quotes
    envVars[key] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function testRateLimiting() {
  console.log('🧪 Testing Rate Limiting Functionality...\n');

  try {
    // Test 1: Check rate limit status for a non-existent user
    console.log('1. Testing rate limit status for non-existent user...');
    const { data: status1, error: error1 } = await supabase
      .rpc('get_rate_limit_status', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        endpoint_name: 'generate-prompts',
        max_requests: 3
      });

    if (error1) {
      console.error('❌ Error getting rate limit status:', error1);
    } else {
      console.log('✅ Rate limit status:', status1);
    }

    // Test 2: Check rate limit for a non-existent user
    console.log('\n2. Testing rate limit check for non-existent user...');
    const { data: allowed1, error: error2 } = await supabase
      .rpc('check_rate_limit', {
        user_uuid: '00000000-0000-0000-0000-000000000000',
        endpoint_name: 'generate-prompts',
        max_requests: 3
      });

    if (error2) {
      console.error('❌ Error checking rate limit:', error2);
    } else {
      console.log('✅ Rate limit allowed:', allowed1);
    }

    // Test 3: Check if the table exists and has the right structure
    console.log('\n3. Testing table structure...');
    const { data: tableInfo, error: error3 } = await supabase
      .from('api_rate_limits')
      .select('*')
      .limit(1);

    if (error3) {
      console.error('❌ Error accessing api_rate_limits table:', error3);
    } else {
      console.log('✅ Table exists and is accessible');
    }

    console.log('\n🎉 Rate limiting tests completed!');
    console.log('\nTo test the full functionality:');
    console.log('1. Sign in to your app');
    console.log('2. Go to an entry with content');
    console.log('3. Click "Get Writing Ideas" 3 times');
    console.log('4. On the 4th attempt, you should see the rate limit message');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRateLimiting(); 