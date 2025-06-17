import { useState } from 'react';
import Head from 'next/head';
import { Source_Serif_4 } from 'next/font/google';
import { AnimatePresence } from 'motion/react';
import Dashboard from '../components/Dashboard';
import DailyEntry from '../components/DailyEntry';
import PageTransition from '@/components/PageTransition';

const sourceSerif = Source_Serif_4({ subsets: ['latin'] });

export default function DashboardPage() {
  const [showEntry, setShowEntry] = useState(false);

  return (
    <PageTransition>
      <div className={`min-h-screen bg-[#F5F3EE] text-[#1A2630] ${sourceSerif.className}`}>
        <Head>
          <title>Dashboard - Line by Line</title>
          <meta name="description" content="Your daily writing journal" />
        </Head>

        <AnimatePresence mode="wait">
          {showEntry ? (
            <DailyEntry
              key="entry"
              onSave={() => setShowEntry(false)}
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
  );
} 