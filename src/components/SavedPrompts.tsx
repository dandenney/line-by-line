import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';
import { WritingPrompt } from '@/types/database';

export default function SavedPrompts() {
  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPrompts, setUpdatingPrompts] = useState<Set<string>>(new Set());
  const { session } = useAuth();

  useEffect(() => {
    loadPrompts();
  }, [session]);

  const loadPrompts = async () => {
    if (!session?.access_token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load prompts');
      }

      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error('Error loading prompts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePromptStatus = async (promptId: string, newStatus: 'active' | 'written' | 'archived') => {
    if (!session?.access_token) return;

    setUpdatingPrompts(prev => new Set(prev).add(promptId));

    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          promptId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      // Update local state
      setPrompts(prev => prev.map(prompt => 
        prompt.id === promptId 
          ? { ...prompt, status: newStatus, is_used: newStatus === 'written' }
          : prompt
      ));
    } catch (error) {
      console.error('Error updating prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to update prompt');
    } finally {
      setUpdatingPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    }
  };

  const deletePrompt = async (promptId: string) => {
    if (!session?.access_token) return;

    setUpdatingPrompts(prev => new Set(prev).add(promptId));

    try {
      const response = await fetch('/api/prompts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ promptId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      // Remove from local state
      setPrompts(prev => prev.filter(prompt => prompt.id !== promptId));
    } catch (error) {
      console.error('Error deleting prompt:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete prompt');
    } finally {
      setUpdatingPrompts(prev => {
        const newSet = new Set(prev);
        newSet.delete(promptId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1A2630]"></div>
          <span className="text-gray-600">Loading saved prompts...</span>
        </div>
      </motion.div>
    );
  }

  if (prompts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-medium text-gray-700 mb-2">Writing Prompts</h3>
        <p className="text-gray-700 text-sm">
          No saved prompts yet. Generate writing ideas from your entries to see them here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-gray-700">Writing Prompts</h3>
        <span className="text-sm text-gray-700">{prompts.length} saved</span>
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

      {/* Prompts List */}
      <div className="space-y-3">
        {prompts.map((prompt) => {
          const isWritten = prompt.status === 'written';
          const isArchived = prompt.status === 'archived';
          const isActive = prompt.status === 'active';
          
          return (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border transition-colors ${
                isWritten 
                  ? 'bg-[#e8f5e8] border-[#9bbf8d]' 
                  : isArchived
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-gray-50 border-gray-200'
              }`}
            >
                          <div className="flex items-start justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  {isWritten && (
                    <span className="text-sm text-[#2d5a2d] bg-[#d4e6d4] px-2 py-1 rounded">
                      ✓ Written
                    </span>
                  )}
                  {isArchived && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      📁 Archived
                    </span>
                  )}
                </div>
                <p className={`text-base leading-relaxed ${
                  isWritten ? 'text-[#2d5a2d]' : isArchived ? 'text-gray-500' : 'text-gray-700'
                }`}>
                  {prompt.prompt_text}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  From entry on {formatDate(prompt.source_entry_date)}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-6">
                {isActive && (
                  <>
                    <button
                      onClick={() => updatePromptStatus(prompt.id, 'written')}
                      disabled={updatingPrompts.has(prompt.id)}
                      className="text-sm text-[#2d5a2d] hover:text-[#1a3d1a] px-4 py-2 rounded bg-[#d4e6d4] hover:bg-[#b8d4b8] transition-colors disabled:opacity-50 font-medium"
                    >
                      {updatingPrompts.has(prompt.id) ? 'Updating...' : 'I Wrote About This'}
                    </button>
                    <button
                      onClick={() => updatePromptStatus(prompt.id, 'archived')}
                      disabled={updatingPrompts.has(prompt.id)}
                      className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                    >
                      {updatingPrompts.has(prompt.id) ? 'Updating...' : 'Archive'}
                    </button>
                  </>
                )}
                {(isWritten || isArchived) && (
                  <button
                    onClick={() => updatePromptStatus(prompt.id, 'active')}
                    disabled={updatingPrompts.has(prompt.id)}
                    className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                  >
                    {updatingPrompts.has(prompt.id) ? 'Updating...' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 