'use client';

import { useEffect, useState, use } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function SessionPage({ params }) {
  const [session, setSession] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const resolvedParams = use(params);
  const sessionId = decodeURIComponent(resolvedParams.id);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the session document
        const sessionDoc = await getDoc(doc(db, 'schedule', sessionId));
        if (sessionDoc.exists()) {
          setSession({ id: sessionDoc.id, ...sessionDoc.data() });
        }

        // Fetch resources for this session
        const q = query(
          collection(db, 'resources'),
          where('sessionid', '==', sessionId)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
        setResources(data);
      } catch (err) {
        console.error('Failed to fetch session data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [sessionId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Session not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-800 mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to schedule
        </button>

        {/* Session info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-8">
          <p className="text-sm font-semibold text-gray-400 mb-1">{session.time}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{session.title}</h1>
          {session.description && (
            <p className="text-gray-500 leading-relaxed">{session.description}</p>
          )}
        </div>

        {/* Resources */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources & Links</h2>

        {resources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 text-center">
            <p className="text-gray-400">No resources added for this session yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
              >
                <span className="text-base font-medium text-gray-900">
                  {resource.title}
                </span>
                <span className="text-gray-400 text-lg">→</span>
              </a>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}