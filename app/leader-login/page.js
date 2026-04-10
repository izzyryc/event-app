'use client';
import { useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
 
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
 
export default function LeaderLogin() {
  const router = useRouter();
  const [step, setStep] = useState('search');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState([]);
 
  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const snapshot = await getDocs(collection(db, 'leaders'));
      const filtered = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => d.name && d.name.toLowerCase().includes(search.toLowerCase()));
      setResults(filtered);
    } catch (err) {
      console.log('error:', err.message);
    }
  };
 
  const handleClaim = async () => {
    setLoading(true);
    setError('');
    if (pin !== selected.pin) {
      setError('Incorrect PIN. Please check the PIN you were given.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, selected.id.replace(/\s+/g, '') + '@eventapp.com', pin);
      setStep('complete');
      setLoading(false);
    } catch {
      try {
        await createUserWithEmailAndPassword(auth, selected.id.replace(/\s+/g, '') + '@eventapp.com', pin);
        setStep('complete');
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  };
 
  const toggleExpertise = (item) => {
    setExpertise(prev =>
      prev.includes(item) ? prev.filter(e => e !== item) : [...prev, item]
    );
  };
 
  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'leaders', selected.id), {
        linkedin,
        email,
        bio,
        expertise,
        profileComplete: true,
      });
      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
 
  if (step === 'search') return (
    <main className="min-h-screen px-6 pt-12 pb-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.push('/welcome')}
          className="text-sm mb-6 flex items-center gap-1"
          style={{ color: '#36363E', opacity: 0.6 }}
        >
          ← Back
        </button>
        <h1
          className="text-5xl leading-none mb-2"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Industry Leader Sign In
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          Search your name to find your pre-made profile
        </p>
 
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Search your name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ ...inputStyle, borderRadius: '16px' }}
          />
          <button
            onClick={handleSearch}
            className="px-5 rounded-2xl text-white font-semibold text-sm shrink-0"
            style={{ backgroundColor: '#F4324C' }}
          >
            Search
          </button>
        </div>
 
        {results.length === 0 && search.length > 0 && (
          <p className="text-sm" style={{ color: '#36363E', opacity: 0.5 }}>
            No results found. Try a different spelling or speak to an organiser.
          </p>
        )}
 
        <div className="space-y-3 mt-2">
          {results.map(r => (
            <button
              key={r.id}
              onClick={() => { setSelected(r); setStep('confirm'); }}
              className="w-full bg-white rounded-3xl px-5 py-4 flex items-center gap-4 shadow-sm text-left hover:shadow-md transition-all active:scale-95"
            >
              {r.photoURL ? (
                <img src={r.photoURL} alt={r.name} className="w-14 h-14 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: '#F4324C' }}>
                  {r.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-semibold" style={{ color: '#36363E' }}>{r.name}</p>
                <p className="text-sm" style={{ color: '#36363E', opacity: 0.6 }}>{r.company}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
 
  if (step === 'confirm') return (
    <main className="min-h-screen px-6 pt-12 pb-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto">
        <button
          onClick={() => { setStep('search'); setError(''); }}
          className="text-sm mb-6 flex items-center gap-1"
          style={{ color: '#36363E', opacity: 0.6 }}
        >
          ← Back
        </button>
        <h1
          className="text-5xl leading-none mb-8"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Confirm your identity
        </h1>
 
        <div className="bg-white rounded-3xl px-5 py-4 flex items-center gap-4 shadow-sm mb-6">
          {selected.photoURL ? (
            <img src={selected.photoURL} alt={selected.name} className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0" style={{ backgroundColor: '#F4324C' }}>
              {selected.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold" style={{ color: '#36363E' }}>{selected.name}</p>
            <p className="text-sm" style={{ color: '#36363E', opacity: 0.6 }}>{selected.company}</p>
          </div>
        </div>
 
        <p className="text-sm mb-2" style={{ color: '#36363E', opacity: 0.7 }}>Enter the PIN from your invitation</p>
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleClaim()}
          style={inputStyle}
        />
 
        {error && (
          <div className="rounded-2xl px-4 py-3 mt-3 text-sm" style={{ backgroundColor: '#F4324C', color: 'white' }}>
            {error}
          </div>
        )}
 
        <button
          onClick={handleClaim}
          disabled={loading}
          className="w-full rounded-2xl py-4 text-white font-semibold mt-4 transition-all active:scale-95"
          style={{ backgroundColor: '#F4324C', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px' }}
        >
          {loading ? 'Verifying...' : 'Confirm'}
        </button>
      </div>
    </main>
  );
 
  if (step === 'complete') return (
    <main className="min-h-screen px-6 pt-12 pb-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto">
        <h1
          className="text-5xl leading-none mb-2"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Welcome, {selected.name}
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          Add a few details to help attendees connect with you. All fields are optional.
        </p>
 
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>LinkedIn URL</label>
            <input placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Email (if happy to be contacted)</label>
            <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest block mb-2" style={{ color: '#F4324C' }}>Short bio</label>
            <textarea placeholder="A sentence or two about your background..." value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
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
 
          {error && (
            <div className="rounded-2xl px-4 py-3 text-sm" style={{ backgroundColor: '#F4324C', color: 'white' }}>
              {error}
            </div>
          )}
 
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full rounded-2xl py-4 text-white font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#F4324C', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px' }}
          >
            {loading ? 'Saving...' : 'Save and continue'}
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-center"
            style={{ color: '#36363E', opacity: 0.5 }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}