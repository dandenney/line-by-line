import { motion } from 'motion/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { getLocalDateString } from '@/lib/utils';

interface FrontendEntry {
  id: number | string;
  text: string;
  date: Date | string;
}

interface DailyEntryProps {
  onSave: (entry: FrontendEntry) => void;
  onBack: () => void;
  existingEntry?: FrontendEntry | null;
}

export default function DailyEntry({ onSave, onBack, existingEntry }: DailyEntryProps) {
  const [questions, setQuestions] = useState<string[]>([
    "What did you learn today?",
    "What was most confusing or challenging today?",
    "What did you learn about how you learn?"
  ]);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { user, session } = useAuth();

  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) return;
      
      try {
        // For now, use default questions
        // TODO: Load from user settings or question templates
        setQuestions([
          "What did you learn today?",
          "What was most confusing or challenging today?",
          "What did you learn about how you learn?"
        ]);
      } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback to default questions
      }
    };

    loadQuestions();
  }, [user]);

  // Load existing entry data if editing
  useEffect(() => {
    if (existingEntry) {
      try {
        // Parse the existing entry content to extract answers
        const content = existingEntry.text;
        const questionAnswerPairs = content.split('\n\n---\n\n');
        
        const newAnswers = questions.map((question, index) => {
          if (index < questionAnswerPairs.length) {
            const pair = questionAnswerPairs[index];
            // Remove the question part and get just the answer
            const lines = pair.split('\n\n');
            if (lines.length >= 2) {
              return lines.slice(1).join('\n\n'); // Everything after the first question
            }
          }
          return '';
        });
        
        setAnswers(newAnswers);
      } catch (error) {
        console.error('Error parsing existing entry:', error);
      }
    }
  }, [existingEntry, questions]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSave = useCallback(async () => {
    console.log('handleSave called');
    console.log('User:', user);
    console.log('Session:', session);
    console.log('Session user:', session?.user);
    
    if (!user) {
      console.error('No user found');
      setError('Authentication required. Please log in again.');
      return;
    }
    
    if (!session) {
      console.error('No session found');
      setError('Session expired. Please log in again.');
      return;
    }

    const combinedText = questions.map((question, index) => {
      const answer = answers[index] || '';
      return `${question}\n\n${answer}`;
    }).join('\n\n---\n\n');

    if (!combinedText.trim()) {
      setError('Please answer at least one question before saving.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Saving entry for user:', user.id);
      console.log('Session user ID:', session.user.id);
      console.log('Entry content:', combinedText);
      
      // Get current date in user's local timezone
      const localDate = getLocalDateString();
      console.log('Local date:', localDate);
      console.log('Current time:', new Date().toLocaleString());
      
      let data;
      let error;
      
      if (existingEntry) {
        // Update existing entry
        console.log('Updating existing entry:', existingEntry.id);
        const result = await supabase
          .from('entries')
          .update({
            content: combinedText,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Create new entry
        console.log('Creating new entry');
        const result = await supabase
          .from('entries')
          .insert({
            user_id: user.id,
            entry_date: localDate, // Use local date instead of UTC
            content: combinedText
          })
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Supabase insert error:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If it's an RLS error, the policies might not be set up
        if (error.message.includes('row-level security policy')) {
          throw new Error('Database security policies not configured. Please contact support.');
        }
        
        throw new Error(error.message || 'Failed to save entry');
      }

      console.log('Successfully saved entry:', data);
      
      // Convert to frontend format for backward compatibility
      const frontendEntry: FrontendEntry = {
        id: data.id,
        text: data.content,
        date: new Date(data.entry_date) // This will be in local timezone
      };
      
      onSave(frontendEntry);
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [answers, questions, onSave, user, session, existingEntry]);

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
    w-full p-4 rounded-lg resize-none
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
            {existingEntry ? 'Edit Today\'s Reflection' : 'Daily Reflection'}
          </h2>
          <p className="text-gray-500 text-sm">
            {existingEntry ? 'Update your thoughts from today' : 'Take a moment to reflect on your day'}
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {error}
          </motion.div>
        )}

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
                value={answers[index] || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className={textareaStyles}
                rows={3}
                autoFocus={index === 0}
                disabled={isLoading}
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
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Press ⌘+S to save
            </span>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-8 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 