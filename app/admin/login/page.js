'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useRouter } from 'next/navigation';

const ADMIN_EMAIL = 'isabelle@ladygardenfoundation.com';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email !== ADMIN_EMAIL) {
      setError('Access denied.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err) {
      setError('Incorrect email or password.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center px-6 py-16" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-md mx-auto w-full">
        <h1
          className="text-5xl leading-none mb-2"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Organiser Login
        </h1>
        <p className="text-sm mb-8" style={{ color: '#36363E', opacity: 0.6 }}>
          This page is for event organisers only.
        </p>

        {error && (
          <div className="rounded-2xl px-4 py-3 mb-6 text-sm" style={{ backgroundColor: '#F4324C', color: 'white' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 text-white font-semibold transition-all active:scale-95"
            style={{ backgroundColor: '#F4324C', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: '18px' }}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}