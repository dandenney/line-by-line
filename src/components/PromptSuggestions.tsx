import { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';

interface PromptSuggestionsProps {
  entryId: string;
  entryContent: string;
}

export default function PromptSuggestions({ entryId, entryContent }: PromptSuggestionsProps) {
  const [prompts, setPrompts] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
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
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
        >
          {error}
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
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="font-medium text-blue-900 mb-3">💡 Writing Ideas</h4>
          <div className="text-blue-800 whitespace-pre-line text-sm leading-relaxed">
            {prompts}
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200">
            <button
              onClick={() => {
                setPrompts('');
                setHasGenerated(false);
                setError(null);
              }}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Generate new ideas
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 