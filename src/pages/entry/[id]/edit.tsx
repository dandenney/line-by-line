import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import DailyEntry from '@/components/DailyEntry';
import { supabaseHelpers } from '@/lib/supabase-client';
import { useAuth } from '@/lib/auth-context';
import { FrontendEntry } from '@/types/database';

export default function EditEntryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState<FrontendEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadEntry = async () => {
      if (!id || !user) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const supabaseEntry = await supabaseHelpers.entries.getById(id as string);
        
        if (supabaseEntry) {
          // Check if this entry is from today
          const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
          if (supabaseEntry.entry_date !== today) {
            setError('Only today\'s entries can be edited');
            return;
          }
          
          setEntry({
            id: supabaseEntry.id,
            text: supabaseEntry.content,
            date: supabaseEntry.entry_date
          });
        } else {
          setError('Entry not found');
        }
      } catch (error) {
        console.error('Error loading entry:', error);
        setError('Failed to load entry');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [id, user]);

  const handleSaveEntry = () => {
    router.push(`/entry/${id}`);
  };

  const handleBackFromEntry = () => {
    router.push(`/entry/${id}`);
  };

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <PageTransition>
          <div className="min-h-screen bg-[#F5F3EE] text-[#1A2630] font-serif p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2630] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading entry...</p>
              </div>
            </div>
          </div>
        </PageTransition>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <PageTransition>
          <div className="min-h-screen bg-[#F5F3EE] text-[#1A2630] font-serif p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
              <Link
                href="/dashboard"
                className="mb-6 text-[#1A2630] hover:underline"
              >
                ← Back to Dashboard
              </Link>
              
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">⚠️</div>
                <p className="text-gray-600">{error}</p>
                <Link
                  href={`/entry/${id}`}
                  className="mt-4 inline-block px-4 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  View Entry
                </Link>
              </div>
            </div>
          </div>
        </PageTransition>
      </ProtectedRoute>
    );
  }

  if (!entry) {
    return (
      <ProtectedRoute>
        <PageTransition>
          <div className="min-h-screen bg-[#F5F3EE] text-[#1A2630] font-serif p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
              <div className="text-gray-500">Entry not found.</div>
            </div>
          </div>
        </PageTransition>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DailyEntry
        onSave={handleSaveEntry}
        onBack={handleBackFromEntry}
        existingEntry={entry}
      />
    </ProtectedRoute>
  );
} 