import { motion } from 'motion/react';
import { useState, useEffect, useCallback } from 'react';
import MultiWeekStreakDisplay from './MultiWeekStreakDisplay';
import { useAuth } from '@/lib/auth-context';
import { supabaseHelpers } from '@/lib/supabase-client';
import { FrontendEntry } from '@/types/database';
import MigrationBanner from './MigrationBanner';
import { supabase } from '@/lib/supabase-client';
import Settings from './Settings';

interface DashboardProps {
  onStartEntry: () => void;
}

export default function Dashboard({ onStartEntry }: DashboardProps) {
  const [entries, setEntries] = useState<FrontendEntry[]>([]);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        
        // Test if we can access the entries table
        const { error: testError } = await supabase
          .from('entries')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('Database connection test failed:', testError);
          if (testError.code === '42P01') {
            setError('Database table not found. Please check if migrations have been applied.');
          } else {
            setError('Database connection failed. Please check your configuration.');
          }
          setEntries([]);
          setStreak(0);
          return;
        }
        
        
        // Load entries from Supabase
        const supabaseEntries = await supabaseHelpers.entries.getAll(user.id);
        // Convert to frontend format for backward compatibility
        const frontendEntries: FrontendEntry[] = supabaseEntries.map((entry: { id: string; entry_date: string; content: string }) => {
          // Fix timezone issue: create date as local date, not UTC
          const [year, month, day] = entry.entry_date.split('-').map(Number);
          // Create date in local timezone by using local date constructor
          const localDate = new Date(year, month - 1, day);
          
          return {
            id: entry.id,
            text: entry.content,
            date: localDate
          };
        });
        
        setEntries(frontendEntries);
        
        // Calculate streak using database function
        try {
          const currentStreak = await supabaseHelpers.functions.getCurrentStreak(user.id);
          setStreak(currentStreak);
        } catch (streakError) {
          console.error('Database streak calculation failed, using client-side fallback:', streakError);
          
          // Fallback: Calculate streak client-side
          const calculateClientSideStreak = (entries: FrontendEntry[]): number => {
            if (entries.length === 0) return 0;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let streak = 0;
            let checkDate = new Date(today);
            
            // Default to weekdays (Monday = 1, Tuesday = 2, etc.)
            const streakDays = [1, 2, 3, 4, 5]; // Monday to Friday
            
            while (true) {
              const dayOfWeek = checkDate.getDay();
              const isStreakDay = streakDays.includes(dayOfWeek);
              
              
              if (isStreakDay) {
                // Check if there's an entry for this date
                const hasEntry = entries.some(entry => {
                  const entryDate = new Date(entry.date);
                  entryDate.setHours(0, 0, 0, 0);
                  const dateMatch = entryDate.getTime() === checkDate.getTime();
                  return dateMatch;
                });
                
                if (hasEntry) {
                  streak++;
                  checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
                } else {
                  break;
                }
              } else {
                // Not a streak day, move to previous day
                checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
              }
            }
            
            return streak;
          };
          
          const clientSideStreak = calculateClientSideStreak(frontendEntries);
          setStreak(clientSideStreak);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error: error
        });
        
        setError('Failed to load your entries. Please refresh the page.');
        
        // Don't show dummy data - just show empty state
        setEntries([]);
        setStreak(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut]);

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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                  title="Settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
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
                You&apos;re seeing demo data. Please check your connection and refresh the page.
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

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </motion.div>
  );
} 