import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AnimatePresence } from 'motion/react';
import Dashboard from '../components/Dashboard';
import DailyEntry from '../components/DailyEntry';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';
import { FrontendEntry } from '@/types/database';
import { supabaseHelpers } from '@/lib/supabase-client';

export default function DashboardPage() {
  const [showEntry, setShowEntry] = useState(false);
  const [todayEntry, setTodayEntry] = useState<FrontendEntry | null>(null);
  const { user, justAuthenticated, setJustAuthenticated } = useAuth();

  // Show daily entry view only for new authentications
  useEffect(() => {
    if (user && justAuthenticated) {
      setShowEntry(true);
    }
  }, [user, justAuthenticated]);

  const handleSaveEntry = () => {
    setShowEntry(false);
    setJustAuthenticated(false); // Clear the flag after saving
    setTodayEntry(null); // Clear today's entry after saving
  };

  const handleBackFromEntry = () => {
    setShowEntry(false);
    setJustAuthenticated(false); // Clear the flag when going back
    setTodayEntry(null); // Clear today's entry when going back
  };

  const handleStartEntry = async () => {
    if (!user) return;
    
    try {
      // Check if today's entry already exists
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format
      const existingEntry = await supabaseHelpers.entries.getByDate(user.id, today);
      
      if (existingEntry) {
        // Convert to frontend format
        const frontendEntry: FrontendEntry = {
          id: existingEntry.id,
          text: existingEntry.content,
          date: existingEntry.entry_date
        };
        setTodayEntry(frontendEntry);
      } else {
        setTodayEntry(null);
      }
      
      setShowEntry(true);
    } catch (error) {
      console.error('Error checking today\'s entry:', error);
      setTodayEntry(null);
      setShowEntry(true);
    }
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <div className="min-h-screen bg-[#F5F3EE] text-[#1A2630] font-serif">
          <Head>
            <title>Dashboard - Line by Line</title>
            <meta name="description" content="Your daily writing journal" />
          </Head>

          <AnimatePresence mode="wait">
            {showEntry ? (
              <DailyEntry
                key="entry"
                onSave={handleSaveEntry}
                onBack={handleBackFromEntry}
                existingEntry={todayEntry}
              />
            ) : (
              <Dashboard
                key="dashboard"
                onStartEntry={handleStartEntry}
              />
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
}

export async function getServerSideProps() {
  return { props: {} };
} 