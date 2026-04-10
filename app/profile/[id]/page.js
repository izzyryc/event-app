'use client';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useAuth from '../../../lib/useAuth';

export default function ProfilePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user: currentUser } = useAuth();
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const col = type === 'leader' ? 'leaders' : 'profiles';
      const snap = await getDoc(doc(db, col, id));
      if (snap.exists()) setProfile(snap.data());
    };
    fetchProfile();
  }, [id, type]);

  useEffect(() => {
    if (!currentUser) return;
    // Check if this is the current user's own profile
    const leaderFlag = currentUser.email.includes('@eventapp.com');
    if (leaderFlag) {
      const leaderId = currentUser.email.replace('@eventapp.com', '');
      setIsOwnProfile(leaderId === id);
    } else {
      setIsOwnProfile(currentUser.uid === id);
    }
  }, [currentUser, id]);

  useEffect(() => {
    const checkSaved = async () => {
      if (!currentUser) return;
      const col = currentUser.email.includes('@eventapp.com') ? 'leaders' : 'profiles';
      const docId = col === 'leaders'
        ? currentUser.email.replace('@eventapp.com', '')
        : currentUser.uid;
      const snap = await getDoc(doc(db, col, docId));
      if (snap.exists()) {
        const data = snap.data();
        setSaved(data.connections && data.connections.includes(id));
      }
    };
    checkSaved();
  }, [currentUser, id]);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    const col = currentUser.email.includes('@eventapp.com') ? 'leaders' : 'profiles';
    const docId = col === 'leaders'
      ? currentUser.email.replace('@eventapp.com', '')
      : currentUser.uid;
    const ref = doc(db, col, docId);
    if (saved) {
      await updateDoc(ref, { connections: arrayRemove(id) });
      setSaved(false);
    } else {
      await updateDoc(ref, { connections: arrayUnion(id) });
      setSaved(true);
    }
    setSaving(false);
  };

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
      <p style={{ color: '#36363E' }}>Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto px-6 pt-10">

        {/* Profile header */}
        <div className="bg-white rounded-3xl px-6 py-6 mb-4 shadow-sm flex items-center gap-4">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: '#F4324C' }}
            >
              {profile.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#36363E' }}>{profile.name}</h1>
            {profile.company && <p className="text-sm" style={{ color: '#36363E', opacity: 0.6 }}>{profile.company}</p>}
            {profile.university && <p className="text-sm" style={{ color: '#36363E', opacity: 0.6 }}>{profile.university}</p>}
            {type === 'leader' && (
              <span className="text-xs text-white px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: '#36363E' }}>
                Industry leader
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-3xl px-6 py-5 mb-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4324C' }}>About</p>
            <p className="text-sm" style={{ color: '#36363E' }}>{profile.bio}</p>
          </div>
        )}

        {/* Interests */}
        {profile.interests && (
          <div className="bg-white rounded-3xl px-6 py-5 mb-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4324C' }}>Interests</p>
            <p className="text-sm" style={{ color: '#36363E' }}>{profile.interests}</p>
          </div>
        )}

        {/* Expertise tags */}
        {profile.expertise && profile.expertise.length > 0 && (
          <div className="bg-white rounded-3xl px-6 py-5 mb-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4324C' }}>Areas of expertise</p>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map(e => (
                <span key={e} className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: '#FEE2DF', color: '#36363E' }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-3 mt-2">

          {/* Edit button — only on own profile */}
          {isOwnProfile && (
            <button
              onClick={() => router.push('/edit-profile')}
              className="w-full rounded-2xl py-3 text-sm font-semibold transition-all"
              style={{ backgroundColor: '#36363E', color: 'white' }}
            >
              Edit my profile
            </button>
          )}

          {/* Save button — only on other people's profiles */}
          {currentUser && !isOwnProfile && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-2xl py-3 text-sm font-semibold transition-all"
              style={{
                backgroundColor: saved ? '#FEE2DF' : '#F4324C',
                color: saved ? '#36363E' : 'white',
                border: saved ? '1px solid #F4324C' : 'none'
              }}
            >
              {saving ? 'Saving...' : saved ? 'Saved — tap to remove' : 'Save profile'}
            </button>
          )}

          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center rounded-2xl py-3 text-sm font-semibold text-white"
              style={{ backgroundColor: '#0077B5' }}
            >
              View LinkedIn
            </a>
          )}
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="block text-center rounded-2xl py-3 text-sm font-semibold"
              style={{ backgroundColor: 'white', color: '#36363E' }}
            >
              Send email
            </a>
          )}
        </div>

      </div>
    </div>
  );
}