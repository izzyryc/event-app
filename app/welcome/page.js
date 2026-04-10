'use client';
 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '../../lib/useAuth';
 
export default function WelcomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
 
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading]);
 
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
        <p style={{ color: '#36363E' }}>Loading...</p>
      </main>
    );
  }
 
  return (
    <main className="min-h-screen flex flex-col px-6 py-16" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
 
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4324C' }}>
            5th June 2026
          </p>
          <h1
            className="text-5xl leading-none mb-4"
            style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
          >
            Generation Prevention: Parliamentary Summit
          </h1>
          <p className="text-base" style={{ color: '#36363E', opacity: 0.7 }}>
            Lady Garden Foundation's 2026 Student Networking Event
          </p>
        </div>
 
        <div>
          <p className="text-lg font-semibold mb-4" style={{ color: '#36363E' }}>
            Who are you?
          </p>
 
          <div className="flex flex-col gap-4">
            <a
              href="/signup"
              className="w-full rounded-3xl px-6 py-6 text-left shadow-sm transition-all active:scale-95"
              style={{ backgroundColor: '#F4324C', display: 'block' }}
            >
              <p
                className="text-2xl text-white mb-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              >
                I'm a Student
              </p>
              <p className="text-sm text-white opacity-80">Create your profile and connect with industry leaders</p>
            </a>
 
            
            <a
              href="/leader-login"
              className="w-full rounded-3xl px-6 py-6 text-left shadow-sm transition-all active:scale-95"
              style={{ backgroundColor: '#36363E', display: 'block' }}
            >
              <p
                className="text-2xl text-white mb-1"
                style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
              >
                I'm an Industry Leader
              </p>
              <p className="text-sm text-white opacity-80">Find your pre-made profile and claim it with your PIN</p>
            </a>
          </div>
        </div>
 
      </div>
    </main>
  );
}