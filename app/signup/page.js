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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        type: 'student',
        createdAt: new Date(),
      });

      router.push('/directory');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-6">Create your profile</h1>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input required placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="border rounded p-2" />
        <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded p-2" />
        <input required type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} className="border rounded p-2" />
        <input placeholder="University" value={university} onChange={e => setUniversity(e.target.value)} className="border rounded p-2" />
        <textarea placeholder="Interests" value={interests} onChange={e => setInterests(e.target.value)} className="border rounded p-2" rows={3} />
        <input placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="border rounded p-2" />
        <input placeholder="Photo URL (optional — paste a link to a photo of yourself)" value={photoURL} onChange={e => setPhotoURL(e.target.value)} className="border rounded p-2" />
        <button type="submit" disabled={loading} className="bg-black text-white rounded p-2 mt-2">
          {loading ? 'Creating profile...' : 'Create profile'}
        </button>
      </form>
    </div>
  );
}
