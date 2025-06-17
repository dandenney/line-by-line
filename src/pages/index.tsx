import { useState } from 'react';
import Head from 'next/head';
import { Source_Serif_4 } from 'next/font/google';
import Link from 'next/link';
import PageTransition from '@/components/PageTransition';

const sourceSerif = Source_Serif_4({ subsets: ['latin'] });

interface Entry {
  id: number;
  text: string;
  date: Date;
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [email, setEmail] = useState('');

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;
    
    const newEntry: Entry = {
      id: Date.now(),
      text: currentEntry,
      date: new Date(),
    };
    
    setEntries([newEntry, ...entries]);
    setCurrentEntry('');
  };

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Waitlist email:', email);
    setEmail('');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageTransition>
      <div className={`min-h-screen bg-[#F5F3EE] text-[#1A2630] ${sourceSerif.className}`}>
        <Head>
          <title>Line by Line</title>
          <meta name="description" content="Write privately. Think clearly. Share when you're ready." />
        </Head>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="text-6xl font-bold mb-6">Line by Line</h1>
          <p className="text-xl mb-12 max-w-2xl">
            Write privately. Think clearly. Share when you're ready.
          </p>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition inline-block"
            >
              Try the Demo
            </Link>
            <button
              onClick={() => scrollToSection('waitlist')}
              className="px-8 py-3 border-2 border-[#1A2630] rounded-lg hover:bg-[#1A2630] hover:text-white transition"
            >
              Join the Waitlist
            </button>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 px-4 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold mb-6">What challenged you today?</h2>
            <textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              className="w-full h-32 p-4 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#1A2630]"
              placeholder="Start writing..."
            />
            <button
              onClick={handleSaveEntry}
              className="px-6 py-2 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition"
            >
              Save Entry
            </button>

            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🔥</span>
                <span className="text-xl font-semibold">{entries.length} day streak</span>
              </div>
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div key={entry.id} className="border-b pb-4">
                    <p className="text-gray-600 mb-2">
                      {entry.date.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="line-clamp-2">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="text-xl font-semibold mb-4">Write something small</h3>
                <p className="text-gray-600">Start with just a few lines. No pressure to write a novel.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-4">See your progress</h3>
                <p className="text-gray-600">Watch your streak grow and your thoughts develop over time.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold mb-4">Share when you're ready</h3>
                <p className="text-gray-600">Choose what to share and with whom, on your own terms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section id="waitlist" className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Join the Waitlist</h2>
            <p className="text-gray-600 mb-8">
              Be the first to know when we launch. No spam, just updates.
            </p>
            <form onSubmit={handleWaitlistSubmit} className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1A2630]"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A2630] text-white rounded-lg hover:bg-opacity-90 transition"
              >
                Keep me posted
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <p className="text-gray-600">© 2024 Line by Line. All rights reserved.</p>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#1A2630] transition"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
