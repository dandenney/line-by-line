import { motion } from 'motion/react';
import { useState } from 'react';
import { Source_Serif_4 } from 'next/font/google';

const sourceSerif = Source_Serif_4({ subsets: ['latin'] });

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface DailyEntryProps {
  onSave: () => void;
  onBack: () => void;
}

export default function DailyEntry({ onSave, onBack }: DailyEntryProps) {
  const [entry, setEntry] = useState('');

  const handleSave = () => {
    if (!entry.trim()) return;

    const newEntry: Entry = {
      id: Date.now(),
      text: entry,
      date: new Date(),
    };

    // Get existing entries
    const savedEntries = localStorage.getItem('entries');
    const entries = savedEntries ? JSON.parse(savedEntries) : [];
    
    // Add new entry and save
    entries.unshift(newEntry);
    localStorage.setItem('entries', JSON.stringify(entries));
    
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#F5F3EE] z-50"
    >
      <div className="max-w-4xl mx-auto h-full flex flex-col p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className={`text-center mb-8 ${sourceSerif.className}`}
        >
          <h2 className="text-xl text-gray-600">
            What challenged you today?
          </h2>
        </motion.div>

        {/* Writing Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full h-full p-8 bg-transparent border-none focus:outline-none resize-none text-lg leading-relaxed"
            placeholder="Start writing..."
            autoFocus
          />
        </motion.div>

        {/* Bottom Toolbar */}
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="flex justify-between items-center pt-4 border-t"
        >
          <button
            onClick={onBack}
            className="px-6 py-2 text-gray-600 hover:text-[#1A2630] transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Save Entry
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
} 