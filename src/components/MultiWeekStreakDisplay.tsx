import { motion } from 'motion/react';
import StreakDisplay from './StreakDisplay';
import { FrontendEntry } from '@/types/database';
import SavedPrompts from './SavedPrompts';

interface MultiWeekStreakDisplayProps {
  entries: FrontendEntry[];
  streakDays: number[];
  onStartEntry: () => void;
}

export default function MultiWeekStreakDisplay({ entries, streakDays, onStartEntry }: MultiWeekStreakDisplayProps) {
  // Generate weeks of data, but only show weeks that have entries or are the current week
  const weeks = [];
  const today = new Date();
  
  // For new users, only show current week and past weeks with entries
  const hasEntries = entries.length > 0;
  const maxWeeks = hasEntries ? 4 : 1; // Show only current week for new users
  
  for (let weekOffset = 0; weekOffset < maxWeeks; weekOffset++) {
    // Calculate the start of each week (Sunday)
    const weekStart = new Date(today);
    const daysToSubtract = today.getDay() + (weekOffset * 7);
    weekStart.setDate(today.getDate() - daysToSubtract);
    
    // Filter entries for this specific week
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    // For new users, only show current week
    if (!hasEntries && weekOffset > 0) {
      break;
    }
    
    // For users with entries, only show weeks that have entries or are current week
    if (hasEntries && weekOffset > 0 && weekEntries.length === 0) {
      continue;
    }
    
    // Generate week label
    let weekLabel: string;
    if (weekOffset === 0) {
      weekLabel = "This Week";
    } else if (weekOffset === 1) {
      weekLabel = "Last Week";
    } else {
      weekLabel = `${weekOffset} Weeks Ago`;
    }
    
    weeks.push({
      weekStart,
      weekEntries,
      weekLabel,
      isCurrentWeek: weekOffset === 0
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
        >
          <div className="flex gap-4 items-center mb-4">
            {!week.isCurrentWeek && (
              <h3 className="bg-[#F5F3EE] text-lg font-medium text-gray-700 font-serif pr-4">
                {week.weekLabel}
              </h3>
            )}
            <div className="bg-[#e4ddd5] h-0.5 grow"></div>
            {week.isCurrentWeek && (
              <>
              <button
                onClick={onStartEntry}
                  className="px-4 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm"
                >
                  + New Entry
                </button>
                <div className="bg-[#e4ddd5] h-0.5 grow"></div>
              </>
            )}
          </div>
          <StreakDisplay 
            entries={week.weekEntries} 
            streakDays={streakDays}
            weekStart={week.weekStart}
          />
          
          {/* Insert SavedPrompts after the current week */}
          {week.isCurrentWeek && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="mt-8"
            >
              <SavedPrompts />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
} 