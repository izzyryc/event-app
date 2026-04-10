'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useRouter } from 'next/navigation';

export default function Directory() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const profileSnap = await getDocs(collection(db, 'profiles'));
      const leaderSnap = await getDocs(collection(db, 'leaders'));
      setProfiles(profileSnap.docs.map(d => ({ id: d.id, ...d.data(), userType: 'student' })));
      setLeaders(leaderSnap.docs.map(d => ({ id: d.id, ...d.data(), userType: 'leader' })));
      setLoading(false);
    };
    fetchAll();
  }, []);

  const everyone = [...leaders, ...profiles];

  const filtered = everyone.filter(p =>
    p.name && p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-1">Attendees</h1>
      <p className="text-gray-500 text-sm mb-6">{everyone.length} people at this event</p>
      <input
        placeholder="Search by name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="border rounded p-2 w-full mb-6"
      />
      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm">No results found.</p>
      )}
      {filtered.map(person => (
        <div
          key={person.id}
          onClick={() => router.push(`/profile/${person.id}?type=${person.userType}`)}
          className="flex items-center gap-3 p-3 border rounded mb-2 cursor-pointer hover:bg-gray-50"
        >
          {person.photoURL ? (
            <img src={person.photoURL} alt={person.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium flex-shrink-0">
              {person.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium">{person.name}</p>
            {person.userType === 'leader' && (
              <p className="text-sm text-gray-500">{person.company}</p>
            )}
            {person.userType === 'student' && (
              <p className="text-sm text-gray-500">{person.university}</p>
            )}
            {person.userType === 'leader' && (
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">Industry leader</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}