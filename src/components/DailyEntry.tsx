import { motion } from 'motion/react';
<<<<<<< HEAD
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
=======
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseHelpers, supabase } from '@/lib/supabase-client';
>>>>>>> main
import { useAuth } from '@/lib/auth-context';

interface FrontendEntry {
  id: number | string;
  text: string;
  date: Date;
}

interface DailyEntryProps {
  onSave: (entry: FrontendEntry) => void;
  onBack: () => void;
}

export default function DailyEntry({ onSave, onBack }: DailyEntryProps) {
  const [answers, setAnswers] = useState(['', '', '']);
<<<<<<< HEAD
  const [saving, setSaving] = useState(false);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { user } = useAuth();
  
  const questions = useMemo(() => [
=======
  const [questions, setQuestions] = useState<string[]>([
>>>>>>> main
    "What did you learn today?",
    "What was most confusing or challenging today?",
    "What did you learn about how you learn?"
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const { user } = useAuth();

  // Load user's questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      if (!user) return;
      
      try {
        const userQuestions = await supabaseHelpers.functions.getUserQuestions(user.id);
        if (userQuestions && userQuestions.length > 0) {
          setQuestions(userQuestions);
          // Initialize answers array to match question count
          setAnswers(new Array(userQuestions.length).fill(''));
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        // Keep default questions if loading fails
      }
    };

    loadQuestions();
  }, [user]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSave = useCallback(async () => {
<<<<<<< HEAD
=======
    if (!user) {
      setError('You must be logged in to save entries');
      return;
    }

>>>>>>> main
    const combinedText = answers
      .map((answer, index) => `${questions[index]}\n${answer}`)
      .join('\n\n');
    
    if (!combinedText.trim() || !user) return;
    
<<<<<<< HEAD
    setSaving(true);
    
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from('entries')
        .insert([
          {
            user_id: user.id,
            content: combinedText,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving entry:', error);
        return;
      }

      const entry: Entry = {
        id: data.id,
        text: data.content,
        date: new Date(data.created_at),
      };
      
      onSave(entry);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setSaving(false);
=======
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the API route instead of direct Supabase client
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          entry_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          content: combinedText
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save entry');
      }

      const entry = await response.json();
      
      // Convert to frontend format for backward compatibility
      const frontendEntry: FrontendEntry = {
        id: entry.id,
        text: entry.content,
        date: new Date(entry.entry_date)
      };
      
      onSave(frontendEntry);
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Failed to save entry. Please try again.');
    } finally {
      setIsLoading(false);
>>>>>>> main
    }
  }, [answers, questions, onSave, user]);

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
            Daily Reflection
          </h2>
          <p className="text-gray-500 text-sm">
            Take a moment to reflect on your day
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
<<<<<<< HEAD
              disabled={saving}
              className="px-8 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Entry'}
=======
              disabled={isLoading}
              className="px-8 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
>>>>>>> main
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 