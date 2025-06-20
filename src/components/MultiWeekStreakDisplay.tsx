import { motion } from 'motion/react';
import StreakDisplay from './StreakDisplay';

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface MultiWeekStreakDisplayProps {
  entries: Entry[];
  streakDays: number[];
  onStartEntry: () => void;
}

export default function MultiWeekStreakDisplay({ entries, streakDays, onStartEntry }: MultiWeekStreakDisplayProps) {
  // Generate 4 weeks of data
  const weeks = [];
  const today = new Date();
  
  for (let week = 0; week < 4; week++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (today.getDay() + (3 - week) * 7));
    
    // Filter entries for this specific week
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    weeks.push({
      weekStart,
      weekEntries,
      weekNumber: 4 - week
    });
  }

  return (
    <div className="space-y-6">
      {weeks.map((week, weekIndex) => (
        <motion.div
          key={weekIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: weekIndex * 0.1,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 font-serif">
              Week {week.weekNumber}
            </h3>
            {weekIndex === 0 && (
              <button
                onClick={onStartEntry}
                className="px-4 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
              >
                + New Entry
              </button>
            )}
          </div>
          <StreakDisplay 
            entries={week.weekEntries} 
            streakDays={streakDays}
            showLegend={false}
          />
        </motion.div>
      ))}
    </div>
  );
} 