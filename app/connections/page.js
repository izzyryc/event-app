'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import useAuth from '../../lib/useAuth';

export default function ConnectionsPage() {
  const { user: currentUser, loading } = useAuth();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [notes, setNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/welcome');
    }
  }, [currentUser, loading]);

  useEffect(() => {
    const fetchConnections = async () => {
      if (!currentUser) return;

      const isLeader = currentUser.email.includes('@eventapp.com');
      const col = isLeader ? 'leaders' : 'profiles';
      const docId = isLeader
        ? currentUser.email.replace('@eventapp.com', '')
        : currentUser.uid;

      const userSnap = await getDoc(doc(db, col, docId));
      if (!userSnap.exists()) { setFetching(false); return; }

      const userData = userSnap.data();
      const connectionIds = userData.connections || [];
      const savedNotes = userData.notes || {};
      setNotes(savedNotes);

      if (connectionIds.length === 0) { setFetching(false); return; }

      const profiles = await Promise.all(
        connectionIds.map(async (pid) => {
          const studentSnap = await getDoc(doc(db, 'profiles', pid));
          if (studentSnap.exists()) {
            return { id: pid, type: 'student', ...studentSnap.data() };
          }
          const leaderSnap = await getDoc(doc(db, 'leaders', pid));
          if (leaderSnap.exists()) {
            return { id: pid, type: 'leader', ...leaderSnap.data() };
          }
          return null;
        })
      );

      setSavedProfiles(profiles.filter(Boolean));
      setFetching(false);
    };

    fetchConnections();
  }, [currentUser]);

  const handleSaveNote = async (personId) => {
    setSavingNote(true);
    const isLeader = currentUser.email.includes('@eventapp.com');
    const col = isLeader ? 'leaders' : 'profiles';
    const docId = isLeader
      ? currentUser.email.replace('@eventapp.com', '')
      : currentUser.uid;

    const updatedNotes = { ...notes, [personId]: noteText };
    await updateDoc(doc(db, col, docId), { notes: updatedNotes });
    setNotes(updatedNotes);
    setEditingNote(null);
    setNoteText('');
    setSavingNote(false);
  };

  const handleEditNote = (personId) => {
    setEditingNote(personId);
    setNoteText(notes[personId] || '');
  };

  if (loading || fetching) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
        <p style={{ color: '#36363E' }}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24 px-6 pt-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto">

        <h1
          className="text-5xl leading-none mb-2"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Saved Profiles
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          People you've saved to connect with later.
        </p>

        {savedProfiles.length === 0 ? (
          <div className="bg-white rounded-3xl px-6 py-10 text-center shadow-sm">
            <p className="text-2xl mb-2">👤</p>
            <p className="font-semibold" style={{ color: '#36363E' }}>No saved profiles yet</p>
            <p className="text-sm mt-1" style={{ color: '#36363E', opacity: 0.6 }}>
              Visit someone's profile in the directory and tap "Save profile"
            </p>
            <button
              onClick={() => router.push('/directory')}
              className="mt-4 px-6 py-2 rounded-2xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#F4324C' }}
            >
              Browse directory
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedProfiles.map((person) => (
              <div key={person.id} className="bg-white rounded-3xl px-5 py-4 shadow-sm">

                {/* Profile row */}
                <button
                  onClick={() => router.push(`/profile/${person.id}?type=${person.type}`)}
                  className="w-full flex items-center gap-4 text-left"
                >
                  {person.photoURL ? (
                    <img src={person.photoURL} alt={person.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                      style={{ backgroundColor: '#F4324C' }}
                    >
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: '#36363E' }}>{person.name}</p>
                    {person.company && (
                      <p className="text-sm truncate" style={{ color: '#36363E', opacity: 0.6 }}>{person.company}</p>
                    )}
                    {person.university && (
                      <p className="text-sm truncate" style={{ color: '#36363E', opacity: 0.6 }}>{person.university}</p>
                    )}
                    {person.type === 'leader' && (
                      <span className="text-xs text-white px-2 py-0.5 rounded-full inline-block mt-1" style={{ backgroundColor: '#36363E' }}>
                        Industry leader
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#F4324C' }}>→</span>
                </button>

                {/* Existing note */}
                {notes[person.id] && editingNote !== person.id && (
                  <div className="mt-3 rounded-2xl px-4 py-3" style={{ backgroundColor: '#FEE2DF' }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#F4324C' }}>My note</p>
                    <p className="text-sm" style={{ color: '#36363E' }}>{notes[person.id]}</p>
                  </div>
                )}

                {/* Note editing */}
                {editingNote === person.id ? (
                  <div className="mt-3">
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add a private note about this person..."
                      rows={3}
                      className="w-full rounded-2xl px-4 py-3 text-sm"
                      style={{
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        color: '#36363E',
                        outline: 'none',
                        resize: 'none',
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleSaveNote(person.id)}
                        disabled={savingNote}
                        className="flex-1 rounded-xl py-2 text-sm font-semibold text-white"
                        style={{ backgroundColor: '#F4324C' }}
                      >
                        {savingNote ? 'Saving...' : 'Save note'}
                      </button>
                      <button
                        onClick={() => { setEditingNote(null); setNoteText(''); }}
                        className="px-4 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: '#e5e7eb', color: '#36363E' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditNote(person.id)}
                    className="mt-3 text-xs font-semibold"
                    style={{ color: '#F4324C' }}
                  >
                    {notes[person.id] ? '✏️ Edit note' : '+ Add note'}
                  </button>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}