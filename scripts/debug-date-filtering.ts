import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugDateFiltering() {
  console.log('🔍 Debugging date filtering...');
  
  try {
    // Get the entry from database
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .order('entry_date', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching entries:', error);
      return;
    }
    
    if (!entries || entries.length === 0) {
      console.log('❌ No entries found');
      return;
    }
    
    const entry = entries[0];
    console.log('📝 Entry from database:', entry);
    console.log('📅 Entry date:', entry.entry_date);
    console.log('📅 Entry date type:', typeof entry.entry_date);
    
    // Convert to frontend format (like the dashboard does)
    const frontendEntry = {
      id: entry.id,
      text: entry.content,
      date: new Date(entry.entry_date)
    };
    
    console.log('🔄 Frontend entry:', frontendEntry);
    console.log('📅 Frontend date:', frontendEntry.date);
    console.log('📅 Frontend date type:', typeof frontendEntry.date);
    
    // Test the week filtering logic
    const today = new Date();
    console.log('📅 Today:', today);
    console.log('📅 Today type:', typeof today);
    
    // Calculate current week start (Sunday)
    const weekStart = new Date(today);
    const daysToSubtract = today.getDay();
    weekStart.setDate(today.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    
    console.log('📅 Week start:', weekStart);
    
    // Calculate week end
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    console.log('📅 Week end:', weekEnd);
    
    // Test if entry is in current week
    const entryDate = new Date(entry.entry_date);
    entryDate.setHours(0, 0, 0, 0);
    
    console.log('📅 Entry date (normalized):', entryDate);
    
    const isInCurrentWeek = entryDate >= weekStart && entryDate <= weekEnd;
    console.log('✅ Is entry in current week?', isInCurrentWeek);
    
    // Test the exact filter logic from MultiWeekStreakDisplay
    const weekEntries = [frontendEntry].filter(entry => {
      const entryDate = new Date(entry.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    console.log('🔄 Filtered week entries:', weekEntries);
    console.log('📊 Number of filtered entries:', weekEntries.length);
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

debugDateFiltering(); 