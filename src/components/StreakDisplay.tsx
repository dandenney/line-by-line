import { motion } from 'motion/react';
import Link from 'next/link';
import { FrontendEntry } from '@/types/database';

interface StreakDisplayProps {
  entries: FrontendEntry[];
  streakDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  weekStart?: Date; // Optional: if not provided, uses current week
}

interface DaySlot {
  date: Date;
  entry?: FrontendEntry;
  status: 'completed' | 'missed' | 'future' | 'today' | 'opted-out';
  isStreakDay: boolean;
}

export default function StreakDisplay({ 
  entries, 
  streakDays = [1, 2, 3, 4, 5], 
  weekStart
}: StreakDisplayProps) {
  const generateWeekSlots = (): DaySlot[] => {
    const slots: DaySlot[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use provided weekStart or calculate current week start
    const startOfWeek = weekStart ? new Date(weekStart) : new Date(today);
    if (!weekStart) {
      const dayOfWeek = today.getDay();
      startOfWeek.setDate(today.getDate() - dayOfWeek);
    }
    startOfWeek.setHours(0, 0, 0, 0);
    
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
        return 'bg-[#fcf8f7] border-[#cfc3b7]';
      case 'missed':
        return 'border-[#dfd6cd]';
      case 'future':
        return 'border-dotted border-[#cfc3b7]';
      case 'opted-out':
        return 'border-[#f0eee8] diagonal-stripes-light';
    }
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  const getDateNumber = (date: Date) => {
    return date.getDate();
  };

  const weekSlots = generateWeekSlots();

  return (
    <div className="py-8">
      <div className="grid gap-6 auto-rows-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))' }}>
        {weekSlots.map((slot, index) => {
          const content = (
            <>
              <div className="text-[#cfc3b7] text-xs font-bold font-sans mb-1 uppercase">
                {getDayName(slot.date)}
              </div>
              <div className="text-[#372d2e] text-lg font-bold font-sans xl:text-6xl">
                {getDateNumber(slot.date)}
              </div>
              {slot.entry && (
                <div className="text-xs mt-1 opacity-60" aria-label="Entry completed">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {slot.status === 'missed' && (
                <div className="text-xs mt-1 opacity-60" aria-label="Entry missed">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {slot.status === 'future' && (
                <div className="text-xs mt-1 opacity-60" aria-label="Future date">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {!slot.isStreakDay && (
                <div className="text-xs mt-1 opacity-60" aria-label="Off day - no entry required">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
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
                  aspect-square border-2 rounded-full flex flex-col items-center justify-center p-2
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
                aspect-square border-2 rounded-full flex flex-col items-center justify-center p-2
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
    </div>
  );
} 