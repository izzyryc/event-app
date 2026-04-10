'use client';
import { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
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
  'Fashion & Beauty'
,
];

export default function LeaderLogin() {
  const router = useRouter();
  const [step, setStep] = useState('search'); // search → confirm → complete
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
  console.log('searching for:', search);
  try {
    const snapshot = await getDocs(collection(db, 'leaders'));
    console.log('total leaders in db:', snapshot.docs.length);
    snapshot.docs.forEach(d => console.log('found doc:', d.data()));
    const filtered = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(d => d.name && d.name.toLowerCase().includes(search.toLowerCase()));
    console.log('filtered results:', filtered.length);
    setResults(filtered);
  } catch (err) {
    console.log('error:', err.message);
  }
};

 const handleClaim = async () => {
    setLoading(true);
    setError('');

    if (pin !== selected.pin) {
      setError('Incorrect PIN. Please check the PIN you were sent.');
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
      router.push('/directory');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (step === 'search') return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-2">Industry leader sign in</h1>
      <p className="text-gray-500 text-sm mb-6">Search your name to find your profile</p>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Search your name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          className="border rounded p-2 flex-1"
        />
        <button onClick={handleSearch} className="bg-black text-white rounded px-4">Search</button>
      </div>
      {results.length === 0 && search.length > 0 && (
        <p className="text-sm text-gray-400">No results found. Try a different spelling or speak to an organiser.</p>
      )}
      {results.map(r => (
        <div key={r.id} onClick={() => { setSelected(r); setStep('confirm'); }} className="border rounded p-3 mb-2 cursor-pointer hover:bg-gray-50 flex items-center gap-3">
          {r.photoURL && <img src={r.photoURL} alt={r.name} className="w-12 h-12 rounded-full object-cover" />}
          <div>
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-gray-500">{r.company}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (step === 'confirm') return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-6">Confirm your identity</h1>
      <div className="border rounded p-4 mb-6 flex items-center gap-3">
        {selected.photoURL && <img src={selected.photoURL} alt={selected.name} className="w-16 h-16 rounded-full object-cover" />}
        <div>
          <p className="font-medium">{selected.name}</p>
          <p className="text-sm text-gray-500">{selected.company}</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-2">Enter the PIN from your invitation email</p>
      <input
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={e => setPin(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleClaim()}
        className="border rounded p-2 w-full mb-3"
      />
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button onClick={handleClaim} disabled={loading} className="bg-black text-white rounded p-2 w-full mb-3">
        {loading ? 'Verifying...' : 'Confirm'}
      </button>
      <button onClick={() => { setStep('search'); setError(''); }} className="text-sm text-gray-400 w-full">Back to search</button>
    </div>
  );

  if (step === 'complete') return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-1">Welcome, {selected.name}</h1>
      <p className="text-gray-500 text-sm mb-6">Add a few details to help attendees connect with you. All fields are optional.</p>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-gray-600 block mb-1">LinkedIn URL</label>
          <input placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Email (if happy to be contacted)</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="border rounded p-2 w-full" />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Short bio</label>
          <textarea placeholder="A sentence or two about your background..." value={bio} onChange={e => setBio(e.target.value)} className="border rounded p-2 w-full" rows={3} />
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-2">Areas of expertise — select any that apply</label>
          <div className="flex flex-wrap gap-2">
            {EXPERTISE_OPTIONS.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleExpertise(item)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  expertise.includes(item)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleComplete} disabled={loading} className="bg-black text-white rounded p-2 mt-2">
          {loading ? 'Saving...' : 'Save and continue'}
        </button>
        <button onClick={() => router.push('/directory')} className="text-sm text-gray-400 text-center">
          Skip for now
        </button>
      </div>
    </div>
  );
}