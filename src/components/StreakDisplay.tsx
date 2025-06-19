import { motion } from 'motion/react';
import Link from 'next/link';

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface StreakDisplayProps {
  entries: Entry[];
  streakDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  showLegend?: boolean;
}

interface DaySlot {
  date: Date;
  entry?: Entry;
  status: 'completed' | 'missed' | 'future' | 'today' | 'opted-out';
  isStreakDay: boolean;
}

export default function StreakDisplay({ entries, streakDays = [1, 2, 3, 4, 5], showLegend = true }: StreakDisplayProps) {
  const generateWeekSlots = (): DaySlot[] => {
    const slots: DaySlot[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get the start of the current week (Sunday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    
    // Create entries map for quick lookup
    const entriesMap = new Map();
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      entriesMap.set(entryDate.getTime(), entry);
    });
    
    // Generate 7 slots for the week
    for (let i = 0; i < 7; i++) {
      const slotDate = new Date(startOfWeek);
      slotDate.setDate(startOfWeek.getDate() + i);
      
      const dayOfWeek = slotDate.getDay();
      const isStreakDay = streakDays.includes(dayOfWeek);
      
      const entry = entriesMap.get(slotDate.getTime());
      let status: DaySlot['status'];
      
      if (entry) {
        status = 'completed';
      } else if (slotDate.getTime() === today.getTime()) {
        status = 'today';
      } else if (slotDate < today) {
        status = isStreakDay ? 'missed' : 'opted-out';
      } else {
        status = isStreakDay ? 'future' : 'opted-out';
      }
      
      slots.push({
        date: slotDate,
        entry,
        status,
        isStreakDay
      });
    }
    
    return slots;
  };

  const getStatusStyles = (status: DaySlot['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-[#1A2630] text-white shadow-md';
      case 'missed':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'today':
        return 'bg-[#1A2630] text-white shadow-md border-2 border-[#2A3640]';
      case 'future':
        return 'bg-gray-50 text-gray-500 border border-gray-200';
      case 'opted-out':
        return 'bg-[#F5F3EE] text-gray-400 border border-gray-100';
    }
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  const weekSlots = generateWeekSlots();

  return (
    <div className="mb-8">
      <div className="grid grid-cols-7 gap-2">
        {weekSlots.map((slot, index) => {
          const content = (
            <>
              <div className="text-xs font-medium mb-1">
                {getDayName(slot.date)}
              </div>
              <div className="text-lg font-bold">
                {getDateNumber(slot.date)}
              </div>
              {slot.entry && (
                <div className="text-xs mt-1 opacity-80">
                  ✓
                </div>
              )}
              {!slot.isStreakDay && (
                <div className="text-xs mt-1 opacity-60">
                  —
                </div>
              )}
            </>
          );

          // If completed, wrap in Link
          return slot.entry ? (
            <Link
              key={slot.date.getTime()}
              href={`/entry/${slot.entry.id}`}
              className="focus:outline-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.4, 0.0, 0.2, 1],
                }}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center p-2
                  ${getStatusStyles(slot.status)}
                  transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-[#1A2630] cursor-pointer
                  ${!slot.isStreakDay ? 'opacity-60' : ''}
                `}
                tabIndex={0}
                aria-label={`View entry for ${slot.date.toLocaleDateString()}`}
              >
                {content}
              </motion.div>
            </Link>
          ) : (
            <motion.div
              key={slot.date.getTime()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center p-2
                ${getStatusStyles(slot.status)}
                transition-all duration-200 hover:scale-105
                ${!slot.isStreakDay ? 'opacity-60' : ''}
              `}
            >
              {content}
            </motion.div>
          );
        })}
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600">
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
      )}
    </div>
  );
} 