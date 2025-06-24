import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
<<<<<<< HEAD
import { createClient } from '@/lib/supabase';
=======
import { supabaseHelpers } from '@/lib/supabase-client';
>>>>>>> main
import { useAuth } from '@/lib/auth-context';

interface FrontendEntry {
  id: number | string;
  text: string;
  date: string;
}

export default function EntryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
<<<<<<< HEAD
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id || !user) return;
      
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from('entries')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching entry:', error);
          setEntry(null);
        } else if (data) {
          setEntry({
            id: data.id,
            text: data.content,
            date: data.created_at
          });
        }
      } catch (error) {
        console.error('Error fetching entry:', error);
        setEntry(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
=======
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
        // Try to load from Supabase first using entry ID
        const supabaseEntry = await supabaseHelpers.entries.getById(id as string);
        
        if (supabaseEntry) {
          // Fix timezone issue: create date as local date, not UTC
          // const [year, month, day] = supabaseEntry.entry_date.split('-').map(Number);
          // const localDate = new Date(year, month - 1, day); // month is 0-indexed
          
          setEntry({
            id: supabaseEntry.id,
            text: supabaseEntry.content,
            date: supabaseEntry.entry_date // Keep as string for display
          });
          return;
        }
        
        // If not found in Supabase, try localStorage (for demo data)
        const savedEntries = localStorage.getItem('entries');
        if (savedEntries) {
          const entries: FrontendEntry[] = JSON.parse(savedEntries);
          const found = entries.find((e) => String(e.id) === String(id));
          if (found) {
            setEntry(found);
            return;
          }
        }
        
        // Handle demo entries (entries with IDs that don't exist in localStorage)
        const demoId = Number(id);
        const demoDate = new Date(demoId);
        if (!isNaN(demoDate.getTime())) {
          setEntry({
            id: demoId,
            text: `Demo entry for ${demoDate.toLocaleDateString()} - This is sample content to show how the linking works. In a real app, this would be your actual entry content.`,
            date: demoDate.toISOString()
          });
          return;
        }
        
        setError('Entry not found');
      } catch (error) {
        console.error('Error loading entry:', error);
        setError('Failed to load entry');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
>>>>>>> main
  }, [id, user]);

  if (!id) {
    return null;
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <PageTransition>
          <div className="min-h-screen bg-[#F5F3EE] text-[#1A2630] font-serif p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 mt-12">
              <div className="text-gray-500">Loading...</div>
            </div>
          </div>
        </PageTransition>
      </ProtectedRoute>
    );
  }

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
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2630] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading entry...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">⚠️</div>
                <p className="text-gray-600">{error}</p>
              </div>
            ) : entry ? (
              <>
                <div className="mb-4 text-gray-500 text-sm">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-lg whitespace-pre-line">
                  {entry.text}
                </div>
              </>
            ) : (
              <div className="text-gray-500">Entry not found.</div>
            )}
          </div>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}

export async function getServerSideProps() {
  return { props: {} };
} 