'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const snapshot = await getDocs(collection(db, 'schedule'));
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading schedule...</p>
      </main>
    );
  }

  if (sessions.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No sessions added yet.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Schedule</h1>
        <p className="text-gray-500 mb-8">Tap a session to see resources and links.</p>

        <div className="relative">
          <div className="absolute left-[72px] top-0 bottom-0 w-px bg-gray-200" />

          <div className="space-y-8">
            {sessions.map((session) => (
              <div key={session.id} className="flex gap-6 items-start relative">

                <div className="w-16 shrink-0 text-right">
                  <span className="text-sm font-semibold text-gray-500 leading-tight">
                    {session.time}
                  </span>
                </div>

                <div className="shrink-0 w-3 h-3 rounded-full bg-black mt-1 relative z-10 ring-4 ring-gray-50" />

                <button
                  onClick={() => router.push(`/schedule/${encodeURIComponent(session.id)}`)}
                  className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 text-left hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                >
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {session.title}
                  </h2>
                  {session.description && (
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {session.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">Tap to view resources →</p>
                </button>

              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}