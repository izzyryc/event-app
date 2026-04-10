'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import useAuth from '../lib/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchName() {
      if (!user) return;
      // Try students first
      const studentDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (studentDoc.exists()) {
        setUserName(studentDoc.data().name);
        return;
      }
      // Try leaders
      const leaderSnap = await getDoc(doc(db, 'leaders', user.uid));
      if (leaderSnap.exists()) {
        setUserName(leaderSnap.data().name);
      }
    }
    fetchName();
  }, [user]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
        <p style={{ color: '#36363E' }}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: '#FEE2DF' }}>

      {/* Hero section */}
      <div className="px-6 pt-16 pb-10">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4324C' }}>
          5th June 2026
        </p>
        <h1 className="text-4xl font-bold leading-tight mb-3" style={{ color: '#36363E' }}>
          Generation Prevention: Parliamentary Summit
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#36363E', opacity: 0.7 }}>
          Lady Garden Foundation's 2026 Student Networking Event
        </p>
      </div>

      {/* Welcome card */}
      <div className="mx-6 bg-white rounded-3xl px-6 py-5 mb-6 shadow-sm">
        <p className="text-sm" style={{ color: '#36363E', opacity: 0.6 }}>Welcome back</p>
        <p className="text-xl font-bold mt-1" style={{ color: '#36363E' }}>
          {userName || 'Attendee'} 👋
        </p>
      </div>

      {/* Quick links */}
      <div className="px-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#36363E', opacity: 0.5 }}>
          Quick links
        </p>

        <button
          onClick={() => router.push('/schedule')}
          className="w-full text-left bg-white rounded-3xl px-6 py-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="font-bold text-base" style={{ color: '#36363E' }}>📅 Event Schedule</p>
            <p className="text-sm mt-0.5" style={{ color: '#36363E', opacity: 0.6 }}>See what's happening and when</p>
          </div>
          <span style={{ color: '#F4324C' }}>→</span>
        </button>

        <button
          onClick={() => router.push('/directory')}
          className="w-full text-left bg-white rounded-3xl px-6 py-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="font-bold text-base" style={{ color: '#36363E' }}>🔍 Attendee Directory</p>
            <p className="text-sm mt-0.5" style={{ color: '#36363E', opacity: 0.6 }}>Find and connect with attendees</p>
          </div>
          <span style={{ color: '#F4324C' }}>→</span>
        </button>

        <button
          onClick={() => router.push('/connections')}
          className="w-full text-left bg-white rounded-3xl px-6 py-5 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="font-bold text-base" style={{ color: '#36363E' }}>🤝 My Connections</p>
            <p className="text-sm mt-0.5" style={{ color: '#36363E', opacity: 0.6 }}>View people you've connected with</p>
          </div>
          <span style={{ color: '#F4324C' }}>→</span>
        </button>
      </div>

      {/* LGF footer note */}
      <div className="mx-6 mt-8 rounded-3xl px-6 py-5" style={{ backgroundColor: '#F4324C' }}>
        <p className="text-white font-bold text-base mb-1">Lady Garden Foundation</p>
        <p className="text-white text-sm opacity-90">
          Raising awareness and funds for gynaecological cancers. Thank you for being part of this event.
        </p>
      </div>

    </main>
  );
}