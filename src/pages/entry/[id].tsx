import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface Entry {
  id: number;
  text: string;
  date: string;
}

export default function EntryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
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
            {entry ? (
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