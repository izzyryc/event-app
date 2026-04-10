'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import useAuth from '../lib/useAuth';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    }
  }, [user, loading]);

  useEffect(() => {
    async function fetchName() {
      if (!user) return;
      const studentDoc = await getDoc(doc(db, 'profiles', user.uid));
      if (studentDoc.exists()) {
        setUserName(studentDoc.data().name);
        return;
      }
      if (user.email.includes('@eventapp.com')) {
        const leaderId = user.email.replace('@eventapp.com', '');
        const leaderSnap = await getDoc(doc(db, 'leaders', leaderId));
        if (leaderSnap.exists()) {
          setUserName(leaderSnap.data().name);
        }
      }
    }
    fetchName();
  }, [user]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    setIsIOS(ios);
    const dismissed = localStorage.getItem('installBannerDismissed');
    if (dismissed) return;
    if (ios) {
      setShowInstallBanner(true);
    } else {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
      });
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    localStorage.setItem('installBannerDismissed', 'true');
  };

  const handleSignOut = async () => {
    const { signOut } = await import('firebase/auth');
    const { auth } = await import('../lib/firebase');
    await signOut(auth);
    router.push('/welcome');
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
        <p style={{ color: '#36363E' }}>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24" style={{ backgroundColor: '#FEE2DF' }}>

      {/* Hero section */}
      <div className="px-6 pt-16 pb-10">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4324C' }}>
          5th June 2026
        </p>
        <h1
          className="text-5xl leading-none mb-3"
          style={{ color: '#36363E', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900 }}
        >
          Generation Prevention: Parliamentary Summit
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#36363E', opacity: 0.7 }}>
          Lady Garden Foundation's 2026 Student Networking Event
        </p>
      </div>

            {/* Install banner */}
            {showInstallBanner && !isInstalled && (
              <div className="mx-6 mb-6 rounded-3xl px-5 py-4 shadow-sm" style={{ backgroundColor: '#36363E' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white font-semibold text-sm mb-1">📲 Add to your home screen</p>
                    {isIOS ? (
                      <p className="text-white text-xs opacity-80 leading-relaxed">
                        Tap the <strong>Share button</strong> then tap <strong>Add to Home Screen</strong>
                      </p>
                    ) : (
                      <p className="text-white text-xs opacity-80 leading-relaxed">
                        Install our app for quick access to your schedule and event info
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleInstall}
                    className="flex-shrink-0 px-4 py-2 bg-white rounded-full text-sm font-semibold"
                    style={{ color: '#36363E' }}
                  >
                    Install
                  </button>
                  <button
                    onClick={dismissBanner}
                    className="flex-shrink-0 text-white text-xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
      
            {/* Content section */}
            <div className="px-6 mb-8">
              <p className="text-sm font-semibold mb-4" style={{ color: '#36363E' }}>
                Welcome, {userName || 'Guest'}!
              </p>
            </div>
      
            {/* Sign out */}
            <div className="px-6">
              <button
                onClick={handleSignOut}
                className="w-full py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: '#F4324C' }}
              >
                Sign Out
              </button>
            </div>
          </main>
        );
      }