import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Entry {
  id: number;
  text: string;
  date: Date;
}

interface DailyEntryProps {
  onSave: (entry: Entry) => void;
  onBack: () => void;
}

export default function DailyEntry({ onSave, onBack }: DailyEntryProps) {
  const [answers, setAnswers] = useState(['', '', '']);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  
  const questions = [
    "What's the most important thing that happened today?",
    "What did you learn or discover?",
    "What are you grateful for today?"
  ];

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSave = useCallback(() => {
    const combinedText = answers
      .map((answer, index) => `${questions[index]}\n${answer}`)
      .join('\n\n');
    
    if (!combinedText.trim()) return;
    
    const entry: Entry = {
      id: Date.now(),
      text: combinedText,
      date: new Date(),
    };
    
    // Save to localStorage
    const savedEntries = localStorage.getItem('entries');
    const entries = savedEntries ? JSON.parse(savedEntries) : [];
    entries.unshift(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    
    onSave(entry);
  }, [answers, questions, onSave]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const textareaStyles = `
    w-full p-4 border border-gray-200 rounded-lg resize-none
    focus:outline-none focus:ring-2 focus:ring-[#1A2630] focus:border-transparent
    transition-all duration-200
    font-sans text-gray-700 placeholder-gray-400
  `;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      className="fixed inset-0 bg-[#F5F3EE] z-50 overflow-y-auto"
    >
      <div className="max-w-4xl mx-auto min-h-full flex flex-col p-8">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.1,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="text-center mb-8 font-serif"
        >
          <h2 className="text-2xl text-gray-600 mb-2">
            Daily Reflection
          </h2>
          <p className="text-gray-500 text-sm">
            Take a moment to reflect on your day
          </p>
        </motion.div>

        {/* Questions and Answers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="flex-1 space-y-8"
        >
          {questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + (index * 0.1),
                ease: [0.4, 0.0, 0.2, 1],
              }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-gray-700 font-serif">
                {question}
              </h3>
              <textarea
                ref={(el) => {
                  textareaRefs.current[index] = el;
                }}
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={textareaStyles}
                rows={3}
                autoFocus={index === 0}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Toolbar */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.6,
            ease: [0.4, 0.0, 0.2, 1],
          }}
          className="flex justify-between items-center pt-8 border-t border-gray-200"
        >
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Press ⌘+S to save
            </span>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 