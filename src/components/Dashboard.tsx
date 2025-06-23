import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import MultiWeekStreakDisplay from './MultiWeekStreakDisplay';
import { useAuth } from '@/lib/auth-context';

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
  const { signOut, user } = useAuth();

  useEffect(() => {
    const savedEntries = localStorage.getItem('entries');
    let parsedEntries: Entry[] = [];
    
    if (savedEntries) {
      parsedEntries = JSON.parse(savedEntries);
    } else {
      // Generate demo data if no entries exist
      parsedEntries = generateDemoEntries();
      localStorage.setItem('entries', JSON.stringify(parsedEntries));
    }
    
    setEntries(parsedEntries);
    
    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    // eslint-disable-next-line prefer-const
    let checkDate = new Date(today);
    
    while (true) {
      const hasEntry = parsedEntries.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime();
      });
      
      if (hasEntry) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, []);

  const generateDemoEntries = (): Entry[] => {
    const demoEntries: Entry[] = [];
    const today = new Date();
    const streakDays = [1, 2, 3, 4, 5]; // Monday to Friday
    
    // Generate entries for the past 3 weeks
    for (let dayOffset = 0; dayOffset < 21; dayOffset++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      
      // Only create entries for streak days (Mon-Fri)
      const dayOfWeek = date.getDay();
      if (streakDays.includes(dayOfWeek)) {
        // Skip some days to make it more realistic (not every day)
        if (Math.random() > 0.3) { // 70% chance of having an entry
          const entry: Entry = {
            id: date.getTime(),
            text: `Demo entry for ${date.toLocaleDateString()} - This is sample content to show how the streak tracking works. In a real app, this would be your actual daily reflection.`,
            date: date
          };
          demoEntries.push(entry);
        }
      }
    }
    
    return demoEntries;
  };

  const handleSignOut = async () => {
    await signOut();
  };

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