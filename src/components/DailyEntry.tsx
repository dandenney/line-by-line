import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
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

// Default question set
const DEFAULT_QUESTIONS = [
  "What did you learn today?",
  "What was most confusing or challenging today?",
  "What did you learn about how you learn?"
];

export default function DailyEntry({ onSave, onBack }: DailyEntryProps) {
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [questions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [supportsFieldSizing, setSupportsFieldSizing] = useState<boolean | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Check for field-sizing support
  useEffect(() => {
    const testElement = document.createElement('div');
    testElement.style.cssText = 'field-sizing: content;';
    const supports = CSS.supports('field-sizing', 'content');
    setSupportsFieldSizing(supports);
  }, []);

  // Auto-resize textarea function (fallback for browsers without field-sizing support)
  const adjustTextareaHeight = useCallback((index: number) => {
    if (supportsFieldSizing) return; // Skip if CSS handles it
    
    const textarea = textareaRefs.current[index];
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [supportsFieldSizing]);

  // Generate the combined text for LLM processing
  const generateCombinedText = () => {
    return questions.map((question, index) => {
      const answer = answers[index] || '';
      return `${question}\n${answer}`;
    }).join('\n\n');
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    
    // Adjust height after state update (only if not using field-sizing)
    if (!supportsFieldSizing) {
      setTimeout(() => adjustTextareaHeight(index), 0);
    }
  };

  // Initialize textarea heights on mount (only if not using field-sizing)
  useEffect(() => {
    if (supportsFieldSizing === false) {
      answers.forEach((_, index) => {
        adjustTextareaHeight(index);
      });
    }
  }, [supportsFieldSizing, answers, adjustTextareaHeight]);

  const handleSave = () => {
    const combinedText = generateCombinedText();
    if (!combinedText.trim()) return;

    const newEntry: Entry = {
      id: Date.now(),
      text: combinedText,
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

  const hasAnyContent = answers.some(answer => answer.trim() !== '');

  // Dynamic styles based on field-sizing support
  const textareaStyles = supportsFieldSizing 
    ? "w-full bg-transparent border-none focus:outline-none resize-none text-base leading-relaxed overflow-hidden [field-sizing:content]"
    : "w-full bg-transparent border-none focus:outline-none resize-none text-base leading-relaxed overflow-hidden";

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
          className={`text-center mb-8 ${sourceSerif.className}`}
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
              <h3 className={`text-lg font-medium text-gray-700 ${sourceSerif.className}`}>
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
          className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200"
        >
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-[#1A2630] transition-colors duration-300 font-medium"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleSave}
            disabled={!hasAnyContent}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-300 ${
              hasAnyContent
                ? 'bg-[#1A2630] text-white hover:bg-opacity-90 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Entry
          </button>
        </motion.div>

        {/* Debug Section - Remove in production */}
        {hasAnyContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-4 bg-gray-100 rounded-lg"
          >
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug: Full Text Output</h4>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
              {generateCombinedText()}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 