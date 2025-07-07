import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabaseHelpers } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { EntryComment } from '@/types/database';

interface CommentSectionProps {
  entryId: string;
}

export default function CommentSection({ entryId }: CommentSectionProps) {
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadComments = async () => {
      if (!entryId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const commentsData = await supabaseHelpers.comments.getByEntryId(entryId);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading comments:', error);
        setError('Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };

    loadComments();
  }, [entryId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const newCommentData = await supabaseHelpers.comments.create({
        entry_id: entryId,
        user_id: user.id,
        content: newComment.trim()
      });
      
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    
    try {
      await supabaseHelpers.comments.delete(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Comments & Reflections</h3>
      
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

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a reflection or comment on this entry..."
            className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1A2630] focus:border-transparent"
            rows={3}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            {isSubmitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A2630] mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No comments yet. Be the first to reflect on this entry!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm text-gray-500">
                  {formatDate(comment.created_at)}
                </div>
                {user && comment.user_id === user.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="text-gray-700 whitespace-pre-line">
                {comment.content}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 