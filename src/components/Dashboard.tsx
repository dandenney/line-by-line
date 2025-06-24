import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import MultiWeekStreakDisplay from './MultiWeekStreakDisplay';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface DashboardProps {
  onStartEntry: () => void;
}

export default function Dashboard({ onStartEntry }: DashboardProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();

  useEffect(() => {
    const fetchEntries = async () => {
      if (!user) return;
      
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching entries:', error);
          return;
        }

        const parsedEntries: Entry[] = data?.map(entry => ({
          id: entry.id,
          text: entry.content,
          date: new Date(entry.created_at)
        })) || [];

        setEntries(parsedEntries);
        
        // Calculate streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let currentStreak = 0;
        let dayOffset = 0;
        
        while (true) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - dayOffset);
          
          const hasEntry = parsedEntries.some(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === checkDate.getTime();
          });
          
          if (hasEntry) {
            currentStreak++;
            dayOffset++;
          } else {
            break;
          }
        }
        
        setStreak(currentStreak);
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#cfc3b7] p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
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