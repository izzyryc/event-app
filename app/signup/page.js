'use client';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [interests, setInterests] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'profiles', user.uid), {
        name,
        email,
        university,
        interests,
        linkedin,
        photoURL,
        marketingOptIn,
        type: 'student',
        createdAt: new Date(),
      });
      router.push('/');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-10 px-6 pt-12" style={{ backgroundColor: '#FEE2DF' }}>
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
          Create your profile
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          Fill in your details so industry leaders can find and connect with you.
        </p>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#F4324C', color: 'white' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input required type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          <input placeholder="University" value={university} onChange={e => setUniversity(e.target.value)} style={inputStyle} />
          <textarea
            placeholder="Interests"
            value={interests}
            onChange={e => setInterests(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'none' }}
          />
          <input placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} style={inputStyle} />
          <input placeholder="Photo URL (optional)" value={photoURL} onChange={e => setPhotoURL(e.target.value)} style={inputStyle} />

          {/* Marketing opt-in */}
          <button
            type="button"
            onClick={() => setMarketingOptIn(!marketingOptIn)}
            className="flex items-start gap-3 text-left mt-2 p-4 rounded-2xl transition-all"
            style={{
              backgroundColor: marketingOptIn ? '#FEE2DF' : 'white',
              border: `1px solid ${marketingOptIn ? '#F4324C' : '#e5e7eb'}`,
            }}
          >
            <div
              className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center"
              style={{
                backgroundColor: marketingOptIn ? '#F4324C' : 'white',
                border: `2px solid ${marketingOptIn ? '#F4324C' : '#e5e7eb'}`,
              }}
            >
              {marketingOptIn && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#36363E' }}>
                Sign me up for the Lady Garden Foundation newsletter
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#36363E', opacity: 0.6 }}>
                Stay up to date with our latest news, events and campaigns. You can unsubscribe at any time.
              </p>
            </div>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 text-base font-semibold text-white mt-2 transition-all active:scale-95"
            style={{ backgroundColor: '#F4324C', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px' }}
          >
            {loading ? 'Creating profile...' : 'Create profile'}
          </button>
        </form>

      </div>
    </main>
  );
}