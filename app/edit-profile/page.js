'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import useAuth from '../../lib/useAuth';

const EXPERTISE_OPTIONS = [
  'Venture Capital & Funding',
  'Womens Health',
  'Charity & Non-Profit',
  'Education & Academia',
  'Tech & Innovation',
  'Sustainability & Climate',
  'Arts & Culture',
  'Policy & Advocacy',
  'Finance',
  'Entrepreneurship & Startups',
  'Healthcare & Medicine',
  'Academic Research',
  'Science & Engineering',
  'Fashion & Beauty',
];

const inputStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '16px',
  padding: '12px 16px',
  fontSize: '14px',
  width: '100%',
  backgroundColor: 'white',
  color: '#36363E',
  outline: 'none',
};

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [isLeader, setIsLeader] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedMsg] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [interests, setInterests] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  const [bio, setBio] = useState('');
  const [leaderLinkedin, setLeaderLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [expertise, setExpertise] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push('/welcome');
  }, [user, loading]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const leaderFlag = user.email.includes('@eventapp.com');
      setIsLeader(leaderFlag);

      if (leaderFlag) {
        const leaderId = user.email.replace('@eventapp.com', '');
        const snap = await getDoc(doc(db, 'leaders', leaderId));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setBio(data.bio || '');
          setLeaderLinkedin(data.linkedin || '');
          setEmail(data.email || '');
          setExpertise(data.expertise || []);
        }
      } else {
        const snap = await getDoc(doc(db, 'profiles', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setName(data.name || '');
          setUniversity(data.university || '');
          setInterests(data.interests || '');
          setLinkedin(data.linkedin || '');
          setPhotoURL(data.photoURL || '');
        }
      }
    }
    fetchProfile();
  }, [user, loading]);

  const toggleExpertise = (item) => {
    setExpertise(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (isLeader) {
        const leaderId = user.email.replace('@eventapp.com', '');
        await updateDoc(doc(db, 'leaders', leaderId), {
          bio,
          linkedin: leaderLinkedin,
          email,
          expertise,
        });
      } else {
        await updateDoc(doc(db, 'profiles', user.uid), {
          name,
          university,
          interests,
          linkedin,
          photoURL,
        });
      }
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setSaving(false);
  };

  if (loading) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
      <p style={{ color: '#36363E' }}>Loading...</p>
    </main>
  );

  if (!user) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
      <p style={{ color: '#36363E' }}>Not logged in.</p>
    </main>
  );

  if (!profile) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
      <p style={{ color: '#36363E' }}>Profile not found.</p>
    </main>
  );

  return (
    <main className="min-h-screen pb-24 px-6 pt-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto">

        <button
          onClick={() => router.back()}
          className="text-sm mb-6 flex items-center gap-1"
          style={{ color: '#36363E', opacity: 0.6 }}
        >
          ← Back
        </button>

        <h1
          className="text-5xl leading-none mb-2"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Edit your profile
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          Your details will be visible to other attendees in the directory.
        </p>

        {saved && (
          <div className="rounded-2xl px-4 py-3 mb-6 text-sm font-semibold" style={{ backgroundColor: '#36363E', color: 'white' }}>
            ✓ Profile saved successfully
          </div>
        )}

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#F4324C', color: 'white' }}>
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!isLeader && (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>University</label>
                <input value={university} onChange={e => setUniversity(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Interests</label>
                <textarea value={interests} onChange={e => setInterests(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>LinkedIn URL</label>
                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Photo URL</label>
                <input value={photoURL} onChange={e => setPhotoURL(e.target.value)} placeholder="Paste a link to a photo of yourself" style={inputStyle} />
              </div>
            </>
          )}

          {isLeader && (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Short bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="A sentence or two about your background..." style={{ ...inputStyle, resize: 'none' }} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>LinkedIn URL</label>
                <input value={leaderLinkedin} onChange={e => setLeaderLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourname" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Email (if happy to be contacted)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest block mb-3" style={{ color: '#F4324C' }}>Areas of expertise</label>
                <div className="flex flex-wrap gap-2">
                  {EXPERTISE_OPTIONS.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleExpertise(item)}
                      className="text-sm px-3 py-1 rounded-full transition-all"
                      style={{
                        backgroundColor: expertise.includes(item) ? '#F4324C' : 'white',
                        color: expertise.includes(item) ? 'white' : '#36363E',
                        border: `1px solid ${expertise.includes(item) ? '#F4324C' : '#e5e7eb'}`,
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-2xl py-4 text-white font-semibold mt-2 transition-all active:scale-95"
            style={{ backgroundColor: '#F4324C', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px' }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </main>
  );
}