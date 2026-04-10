'use client';

import { useRouter, usePathname } from 'next/navigation';
import useAuth from '../lib/useAuth';

export default function NavBar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const hideOn = ['/signup', '/login', '/leader-login', '/welcome', '/admin/login', '/admin', '/edit-profile'];
  if (hideOn.includes(pathname)) return null;

  const handleProfileNav = () => {
    if (user.email.includes('@eventapp.com')) {
      const leaderId = user.email.replace('@eventapp.com', '');
      router.push(`/profile/${leaderId}?type=leader`);
    } else {
      router.push(`/profile/${user.uid}?type=student`);
    }
  };

  const tabs = [
    { label: 'Home', icon: '🏠', path: '/', onClick: () => router.push('/') },
    { label: 'Schedule', icon: '📅', path: '/schedule', onClick: () => router.push('/schedule') },
    { label: 'Directory', icon: '🔍', path: '/directory', onClick: () => router.push('/directory') },
    { label: 'Connections', icon: '🤝', path: '/connections', onClick: () => router.push('/connections') },
    { label: 'Profile', icon: '👤', path: '/profile', onClick: handleProfileNav },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
      style={{ backgroundColor: '#36363E' }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path ||
          (tab.path !== '/' && pathname.startsWith(tab.path));
        return (
          <button
            key={tab.path}
            onClick={tab.onClick}
            className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all"
          >
            <span className="text-lg">{tab.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: isActive ? '#F4324C' : 'rgba(255,255,255,0.6)' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}