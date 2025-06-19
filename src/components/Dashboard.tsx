import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';
import MultiWeekStreakDisplay from './MultiWeekStreakDisplay';

const sourceSerif = Source_Serif_4({ subsets: ['latin'] });

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

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('entries');
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: Entry) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      setEntries(parsedEntries);
      calculateStreak(parsedEntries);
    }
  }, []);

  const calculateStreak = (entries: Entry[]) => {
    if (entries.length === 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    // eslint-disable-next-line prefer-const
    let checkDate = new Date(today);
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      if (entryDate.getTime() === checkDate.getTime()) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (entryDate.getTime() === checkDate.getTime() - 86400000) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
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
      className="min-h-screen bg-[#F5F3EE] p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header with streak and prompt */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🔥</span>
            <span className={`text-2xl font-semibold ${sourceSerif.className}`}>
              {streak} day streak
            </span>
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

        {/* Sticky Legend */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="sticky bottom-4 bg-white p-4 rounded-lg shadow-md border border-gray-100"
        >
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#1A2630] rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#1A2630] rounded border-2 border-[#2A3640]"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Missed</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
              <span>Future</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#F5F3EE] border border-gray-100 rounded"></div>
              <span>Off Day</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 