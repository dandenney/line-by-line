import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';

interface PromptSuggestionsProps {
  entryId: string;
  entryContent: string;
  sourceEntryDate: string;
}

export default function PromptSuggestions({ entryId, entryContent, sourceEntryDate }: PromptSuggestionsProps) {
  const [prompts, setPrompts] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState<string[]>([]);
  const [savingPrompts, setSavingPrompts] = useState<Set<string>>(new Set());
  const { session } = useAuth();

  const generatePrompts = async () => {
    if (!session?.access_token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ entryId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle rate limit error specifically
        if (response.status === 429) {
          const rateLimitMessage = errorData.error || 'You have reached your daily limit of 3 question requests.';
          setError(rateLimitMessage);
          return;
        }
        
        throw new Error(errorData.error || 'Failed to generate prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts);
      setHasGenerated(true);
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const savePrompt = async (promptText: string) => {
    if (!session?.access_token) {
      setError('Authentication required');
      return;
    }

    setSavingPrompts(prev => new Set(prev).add(promptText));

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          entryId,
          promptText,
          sourceEntryDate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save prompt');
      }

      setSavedPrompts(prev => [...prev, promptText]);
    } catch (error) {
      console.error('Error saving prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to save prompt');
    } finally {
      setSavingPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptText);
        return newSet;
      });
    }
  };

  const parsePrompts = (promptText: string): string[] => {
    // Parse numbered prompts from the AI response
    const lines = promptText.split('\n').filter(line => line.trim());
    return lines
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(prompt => prompt.length > 0);
  };

  // Only show if there's content in the entry
  if (!entryContent.trim()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 border-t border-gray-200 pt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">Writing Prompts</h3>
        {!hasGenerated && (
          <button
            onClick={generatePrompts}
            disabled={isLoading}
            className="px-4 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Generating...' : 'Get Writing Ideas'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 border rounded-lg text-sm ${
            error.includes('daily limit') 
              ? 'bg-amber-50 border-amber-200 text-amber-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-start gap-2">
            {error.includes('daily limit') && (
              <span className="text-amber-600">⏰</span>
            )}
            <div>
              <p className="font-medium mb-1">
                {error.includes('daily limit') ? 'Daily Limit Reached' : 'Error'}
              </p>
              <p className="text-sm opacity-90">{error}</p>
              {error.includes('daily limit') && (
                <p className="text-xs mt-2 opacity-75">
                  You can request new writing ideas again tomorrow.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1A2630]"></div>
          <span className="text-gray-600">Generating writing prompts...</span>
        </motion.div>
      )}

      {/* Generated Prompts */}
      {prompts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-gray-700 mb-3">💡 Writing Ideas</h4>
          <div className="space-y-3">
            {parsePrompts(prompts).map((prompt, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200">
                <div className="flex-1 text-gray-700 text-sm leading-relaxed">
                  {prompt}
                </div>
                {savedPrompts.includes(prompt) ? (
                  <span className="text-gray-600 text-xs font-medium px-2 py-1 bg-gray-100 rounded">
                    Saved
                  </span>
                ) : (
                  <button
                    onClick={() => savePrompt(prompt)}
                    disabled={savingPrompts.has(prompt)}
                    className="text-gray-600 hover:text-gray-800 text-xs font-medium px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {savingPrompts.has(prompt) ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setPrompts('');
                setHasGenerated(false);
                setError(null);
                setSavedPrompts([]);
              }}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Generate new ideas
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 