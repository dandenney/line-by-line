import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Source_Serif_4 } from 'next/font/google';

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
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
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
    let currentDate = today;
    
    // Sort entries by date descending
    const sortedEntries = [...entries].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === currentDate.getTime()) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (entryDate.getTime() === currentDate.getTime() - 86400000) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
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
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">🔥</span>
            <span className={`text-2xl font-semibold ${sourceSerif.className}`}>
              {streak} day streak
            </span>
          </div>
          <h2 className={`text-xl text-gray-600 ${sourceSerif.className}`}>
            What challenged you today?
          </h2>
        </motion.div>

        {/* Start Entry Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartEntry}
          className="w-full py-4 bg-[#1A2630] text-white rounded-lg mb-12 hover:bg-opacity-90 transition-colors duration-300"
        >
          Start Today's Entry
        </motion.button>

        {/* Entries List */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.3 + index * 0.05,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <p className={`text-gray-600 mb-2 ${sourceSerif.className}`}>
                {entry.date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="line-clamp-2">{entry.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 