# Supabase Implementation Guide for Line-by-Line

## Prerequisites

1. **Supabase Project**: You should already have a Supabase project set up (as per `SUPABASE_SETUP.md`)
2. **Environment Variables**: Make sure your `.env.local` file has the correct Supabase credentials

## Step 1: Run the Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the migration

3. **Verify the Migration**
   - Go to **Table Editor** in the left sidebar
   - You should see the following tables:
     - `entries`
     - `user_settings`
     - `question_templates`
     - `streak_analytics`

## Step 2: Test the Database Functions

Run these test queries in the SQL Editor to verify everything is working:

### Test 1: Check if tables exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('entries', 'user_settings', 'question_templates', 'streak_analytics');
```

### Test 2: Check if functions exist
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('calculate_user_streak', 'update_streak_analytics', 'get_weekly_entries', 'get_user_questions');
```

### Test 3: Check RLS policies
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Step 3: Update Your Frontend Code

### 1. Install Required Dependencies

Make sure you have the Supabase client installed:
```bash
npm install @supabase/supabase-js
```

### 2. Update Your Supabase Client

Replace your existing `src/lib/supabase.ts` with the new typed client:
```typescript
// Use the new typed client from src/lib/supabase-client.ts
import { supabase, supabaseHelpers } from '@/lib/supabase-client'
```

### 3. Update Components to Use Supabase

Here's how to update your existing components:

#### Example: DailyEntry Component
```typescript
import { supabaseHelpers } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'

// In your handleSave function:
const handleSave = useCallback(async () => {
  const combinedText = answers
    .map((answer, index) => `${questions[index]}\n${answer}`)
    .join('\n\n');
  
  if (!combinedText.trim()) return;
  
  try {
    const entry = await supabaseHelpers.entries.create({
      user_id: user!.id,
      entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      content: combinedText
    });
    
    onSave(entry);
  } catch (error) {
    console.error('Error saving entry:', error);
    // Handle error (show toast, etc.)
  }
}, [answers, questions, onSave, user]);
```

#### Example: Dashboard Component
```typescript
import { supabaseHelpers } from '@/lib/supabase-client'
import { useAuth } from '@/lib/auth-context'

// In your useEffect:
useEffect(() => {
  const loadEntries = async () => {
    if (!user) return;
    
    try {
      const entries = await supabaseHelpers.entries.getAll(user.id);
      setEntries(entries);
      
      // Get current streak
      const streak = await supabaseHelpers.functions.getCurrentStreak(user.id);
      setStreak(streak);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };
  
  loadEntries();
}, [user]);
```

## Step 4: Test the Integration

### 1. Create a Test Entry
1. Sign in to your app
2. Create a new entry
3. Check the Supabase **Table Editor** to see if the entry was created

### 2. Verify RLS is Working
1. Try to access entries from a different user account
2. You should only see your own entries

### 3. Test Streak Calculation
1. Create multiple entries on consecutive days
2. Check if the streak count updates correctly

## Step 5: Data Migration (Optional)

If you have existing localStorage data, you can migrate it:

### Create a Migration Script
```typescript
// migration-script.ts
import { supabaseHelpers } from '@/lib/supabase-client'

export async function migrateLocalStorageData(userId: string) {
  const savedEntries = localStorage.getItem('entries');
  if (!savedEntries) return;
  
  const entries = JSON.parse(savedEntries);
  
  for (const entry of entries) {
    try {
      await supabaseHelpers.entries.create({
        user_id: userId,
        entry_date: new Date(entry.date).toISOString().split('T')[0],
        content: entry.text
      });
    } catch (error) {
      console.error('Error migrating entry:', error);
    }
  }
  
  // Clear localStorage after successful migration
  localStorage.removeItem('entries');
}
```

## Troubleshooting

### Common Issues:

1. **RLS Policy Errors**
   - Make sure you're authenticated
   - Check that the user_id matches the authenticated user

2. **Function Not Found**
   - Verify the migration ran successfully
   - Check that all functions were created

3. **Type Errors**
   - Make sure you're using the typed Supabase client
   - Check that the database types match your schema

### Debug Queries:

```sql
-- Check user settings for a specific user
SELECT * FROM user_settings WHERE user_id = 'your-user-id';

-- Check entries for a specific user
SELECT * FROM entries WHERE user_id = 'your-user-id' ORDER BY entry_date DESC;

-- Test streak calculation
SELECT calculate_user_streak('your-user-id');

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'entries';
```

## Next Steps

Once the basic integration is working:

1. **Add Error Handling**: Implement proper error handling and user feedback
2. **Add Loading States**: Show loading indicators during database operations
3. **Optimize Queries**: Use the helper functions for better performance
4. **Add Offline Support**: Consider implementing offline-first features
5. **LLM Integration**: Start using the question templates for dynamic prompts

## Security Notes

- All tables have RLS enabled
- Users can only access their own data
- Functions are marked as `SECURITY DEFINER` for proper permissions
- The schema is designed to prevent data leakage between users

Your Line-by-Line app is now ready to use with Supabase! 🎉 