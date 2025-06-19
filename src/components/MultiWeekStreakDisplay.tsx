import { motion } from 'motion/react';
import { Source_Serif_4 } from 'next/font/google';
import StreakDisplay from './StreakDisplay';

const sourceSerif = Source_Serif_4({ subsets: ['latin'] });

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface MultiWeekStreakDisplayProps {
  entries: Entry[];
  streakDays?: number[];
  onStartEntry?: () => void;
}

export default function MultiWeekStreakDisplay({ 
  entries, 
  streakDays = [1, 2, 3, 4, 5],
  onStartEntry
}: MultiWeekStreakDisplayProps) {
  
  // Generate stub data for demonstration
  const generateStubEntries = (): Entry[] => {
    const stubEntries: Entry[] = [];
    const today = new Date();
    
    // Add some entries from the past few weeks
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Only add entries for streak days (Mon-Fri)
      const dayOfWeek = date.getDay();
      if (streakDays.includes(dayOfWeek)) {
        stubEntries.push({
          id: Date.now() - (i * 86400000), // Use timestamp-based IDs like real entries
          text: `Demo entry for ${date.toLocaleDateString()} - This is sample content to show how the linking works. In a real app, clicking this would take you to the full entry.`,
          date: date
        });
      }
    }
    
    return stubEntries;
  };

  const allEntries = [...generateStubEntries(), ...entries];
  
  // Calculate how many weeks to show based on actual data
  const calculateWeeksToShow = () => {
    if (allEntries.length === 0) return 1; // Show at least current week
    
    const oldestEntry = allEntries.reduce((oldest, entry) => 
      entry.date < oldest.date ? entry : oldest
    );
    
    const today = new Date();
    const weeksDiff = Math.ceil((today.getTime() - oldestEntry.date.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    // Show at least 4 weeks (current + 3 past) or all available weeks
    return Math.max(4, weeksDiff + 1);
  };

  const weeksToShow = calculateWeeksToShow();

  const generateWeekData = (weekOffset: number) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + (weekOffset * 7)));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const weekEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });
    
    return {
      weekStart,
      weekEnd,
      entries: weekEntries
    };
  };

  const getWeekLabel = (weekStart: Date, weekEnd: Date) => {
    const today = new Date();
    const weekStartTime = weekStart.getTime();
    const weekEndTime = weekEnd.getTime();
    const todayTime = today.getTime();
    
    if (weekStartTime <= todayTime && weekEndTime >= todayTime) {
      return "This Week";
    } else {
      return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  return (
    <div className="space-y-12">
      {Array.from({ length: weeksToShow }, (_, i) => {
        const weekData = generateWeekData(i);
        const isCurrentWeek = i === 0;
        
        return (
          <div key={i}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.4, 0.0, 0.2, 1],
              }}
            >
              <h4 className={`text-lg font-semibold mb-4 ${sourceSerif.className}`}>
                {getWeekLabel(weekData.weekStart, weekData.weekEnd)}
              </h4>
              <StreakDisplay 
                entries={weekData.entries} 
                streakDays={streakDays}
                showLegend={false}
              />
            </motion.div>
            
            {/* Start Entry Button after current week */}
            {isCurrentWeek && onStartEntry && (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartEntry}
                className="w-full py-4 bg-[#1A2630] text-white rounded-lg mt-8 hover:bg-opacity-90 transition-colors duration-300"
              >
                Start Today's Entry
              </motion.button>
            )}
          </div>
        );
      })}
    </div>
  );
} 