'use client';

import { useRouter, usePathname } from 'next/navigation';
import useAuth from '../lib/useAuth';

export default function NavBar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const hideOn = ['/signup', '/leader-login', '/welcome'];
  if (hideOn.includes(pathname)) return null;

  const tabs = [
    { label: 'Home', icon: '🏠', path: '/' },
    { label: 'Schedule', icon: '📅', path: '/schedule' },
    { label: 'Directory', icon: '🔍', path: '/directory' },
    { label: 'Connections', icon: '🤝', path: '/connections' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-3"
      style={{ backgroundColor: '#36363E' }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || (pathname.startsWith(tab.path + '/') && tab.path !== '/');
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
          >
            <span className="text-xl">{tab.icon}</span>
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