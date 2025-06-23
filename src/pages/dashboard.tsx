import { useState, useEffect } from 'react';
import Head from 'next/head';
import { AnimatePresence } from 'motion/react';
import Dashboard from '../components/Dashboard';
import DailyEntry from '../components/DailyEntry';
import PageTransition from '@/components/PageTransition';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth-context';

export default function DashboardPage() {
  const [showEntry, setShowEntry] = useState(false);
  const { user } = useAuth();

  // Start authenticated users at the entry view
  useEffect(() => {
    if (user) {
      setShowEntry(true);
    }
  }, [user]);

  const handleSaveEntry = () => {
    setShowEntry(false);
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
                onBack={() => setShowEntry(false)}
              />
            ) : (
              <Dashboard
                key="dashboard"
                onStartEntry={() => setShowEntry(true)}
              />
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </ProtectedRoute>
  );
} 