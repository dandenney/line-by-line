import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Entry {
  id: number;
  text: string;
  date: string;
}

export default function EntryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState<Entry | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const savedEntries = localStorage.getItem('entries');
    if (savedEntries) {
      const entries: Entry[] = JSON.parse(savedEntries);
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
    }
  }, [id]);

  if (!id) {
    return null;
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