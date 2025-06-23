import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import MultiWeekStreakDisplay from './MultiWeekStreakDisplay';
import { useAuth } from '@/lib/auth-context';
import { supabaseHelpers } from '@/lib/supabase-client';
import { Entry, FrontendEntry } from '@/types/database';
import MigrationBanner from './MigrationBanner';

interface DashboardProps {
  onStartEntry: () => void;
}

export default function Dashboard({ onStartEntry }: DashboardProps) {
  const [entries, setEntries] = useState<FrontendEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      console.log('🔍 Dashboard Debug - Starting data load...');
      console.log('User ID:', user.id);
      
      setIsLoading(true);
      setError(null);

      try {
        console.log('📡 Loading entries from Supabase...');
        // Load entries from Supabase
        const supabaseEntries = await supabaseHelpers.entries.getAll(user.id);
        console.log('📊 Supabase entries received:', supabaseEntries);
        console.log('📊 Number of Supabase entries:', supabaseEntries.length);
        
        // Convert to frontend format for backward compatibility
        const frontendEntries: FrontendEntry[] = supabaseEntries.map((entry: any) => {
          // Fix timezone issue: create date as local date, not UTC
          const [year, month, day] = entry.entry_date.split('-').map(Number);
          const localDate = new Date(year, month - 1, day); // month is 0-indexed
          
          return {
            id: entry.id,
            text: entry.content,
            date: localDate
          };
        });
        
        console.log('🔄 Converted to frontend format:', frontendEntries);
        console.log('🔄 Number of frontend entries:', frontendEntries.length);
        
        setEntries(frontendEntries);
        
        console.log('📈 Getting current streak...');
        // Get current streak
        const currentStreak = await supabaseHelpers.functions.getCurrentStreak(user.id);
        console.log('🔥 Current streak:', currentStreak);
        setStreak(currentStreak);
        
        console.log('✅ Data loading completed successfully');
        
      } catch (error) {
        console.error('❌ Error loading data:', error);
        setError('Failed to load your entries. Please refresh the page.');
        
        // Don't show dummy data - just show empty state
        console.log('🔄 Setting empty state due to error');
        setEntries([]);
        setStreak(0);
      } finally {
        setIsLoading(false);
        console.log('🏁 Data loading finished');
      }
    };

    loadData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="min-h-screen bg-[#cfc3b7] p-4 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2630] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your journal...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      className="min-h-screen bg-[#cfc3b7] p-4"
    >
      <section className="bg-[#F5F3EE] p-4 rounded-[32px]">
        <div className="max-w-6xl mx-auto">
          {/* Header with user info and sign out */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl font-semibold font-serif">
                  {streak} day streak
                </span>
              </div>
            </div>
          </motion.div>

          {/* Migration Banner */}
          <MigrationBanner />

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700"
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <p className="text-sm mt-2 text-yellow-600">
                You're seeing demo data. Please check your connection and refresh the page.
              </p>
            </motion.div>
          )}

          {/* Multi-Week Streak Display */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
              ease: [0.4, 0.0, 0.2, 1],
            }}
            className="mb-8"
          >
            <MultiWeekStreakDisplay 
              entries={entries} 
              streakDays={[1,2,3,4,5]} 
              onStartEntry={onStartEntry}
            />
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
} 