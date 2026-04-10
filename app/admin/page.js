'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../lib/firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import useAuth from '../../lib/useAuth';

const ADMIN_EMAIL = 'admin@generationprevention.com';

const inputStyle = {
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  backgroundColor: 'white',
  color: '#36363E',
  outline: 'none',
};

const sectionTitle = {
  fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 900,
  fontSize: '28px',
  color: '#36363E',
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('schedule');

  // Schedule state
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({ id: '', time: '', title: '', description: '', order: '' });
  const [editingSession, setEditingSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Resources state
  const [resources, setResources] = useState([]);
  const [resourceForm, setResourceForm] = useState({ sessionid: '', title: '', url: '', order: '' });
  const [editingResource, setEditingResource] = useState(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  // Leaders state
  const [leaders, setLeaders] = useState([]);
  const [leaderForm, setLeaderForm] = useState({ id: '', name: '', company: '', pin: '', photoURL: '' });
  const [editingLeader, setEditingLeader] = useState(null);
  const [leaderLoading, setLeaderLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/admin/login');
    if (!loading && user && user.email !== ADMIN_EMAIL) router.push('/');
  }, [user, loading]);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      fetchSessions();
      fetchResources();
      fetchLeaders();
    }
  }, [user]);

  // ── SCHEDULE ──────────────────────────────────────────

  const fetchSessions = async () => {
    const snap = await getDocs(collection(db, 'schedule'));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
    setSessions(data);
  };

  const handleSessionSubmit = async () => {
    setSessionLoading(true);
    try {
      if (editingSession) {
        await updateDoc(doc(db, 'schedule', editingSession), {
          time: sessionForm.time,
          title: sessionForm.title,
          description: sessionForm.description,
          order: sessionForm.order,
        });
      } else {
        const docId = sessionForm.id.trim().toLowerCase().replace(/\s+/g, '-');
        await updateDoc(doc(db, 'schedule', docId), {
          time: sessionForm.time,
          title: sessionForm.title,
          description: sessionForm.description,
          order: sessionForm.order,
        }).catch(async () => {
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, 'schedule', docId), {
            time: sessionForm.time,
            title: sessionForm.title,
            description: sessionForm.description,
            order: sessionForm.order,
          });
        });
      }
      setSessionForm({ id: '', time: '', title: '', description: '', order: '' });
      setEditingSession(null);
      await fetchSessions();
    } catch (err) {
      console.error(err);
    }
    setSessionLoading(false);
  };

  const handleEditSession = (session) => {
    setEditingSession(session.id);
    setSessionForm({
      id: session.id,
      time: session.time || '',
      title: session.title || '',
      description: session.description || '',
      order: session.order || '',
    });
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    await deleteDoc(doc(db, 'schedule', id));
    await fetchSessions();
  };

  // ── RESOURCES ─────────────────────────────────────────

  const fetchResources = async () => {
    const snap = await getDocs(collection(db, 'resources'));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.order || '').localeCompare(b.order || ''));
    setResources(data);
  };

  const handleResourceSubmit = async () => {
    setResourceLoading(true);
    try {
      if (editingResource) {
        await updateDoc(doc(db, 'resources', editingResource), {
          sessionid: resourceForm.sessionid,
          title: resourceForm.title,
          url: resourceForm.url,
          order: resourceForm.order,
        });
      } else {
        await addDoc(collection(db, 'resources'), {
          sessionid: resourceForm.sessionid,
          title: resourceForm.title,
          url: resourceForm.url,
          order: resourceForm.order,
        });
      }
      setResourceForm({ sessionid: '', title: '', url: '', order: '' });
      setEditingResource(null);
      await fetchResources();
    } catch (err) {
      console.error(err);
    }
    setResourceLoading(false);
  };

  const handleEditResource = (resource) => {
    setEditingResource(resource.id);
    setResourceForm({
      sessionid: resource.sessionid || '',
      title: resource.title || '',
      url: resource.url || '',
      order: resource.order || '',
    });
  };

  const handleDeleteResource = async (id) => {
    if (!confirm('Delete this resource?')) return;
    await deleteDoc(doc(db, 'resources', id));
    await fetchResources();
  };

  // ── LEADERS ───────────────────────────────────────────

  const fetchLeaders = async () => {
    const snap = await getDocs(collection(db, 'leaders'));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setLeaders(data);
  };

  const handleLeaderSubmit = async () => {
    setLeaderLoading(true);
    try {
      if (editingLeader) {
        await updateDoc(doc(db, 'leaders', editingLeader), {
          name: leaderForm.name,
          company: leaderForm.company,
          pin: leaderForm.pin,
          photoURL: leaderForm.photoURL,
        });
      } else {
        const { setDoc } = await import('firebase/firestore');
        const docId = leaderForm.id.trim().toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'leaders', docId), {
          name: leaderForm.name,
          company: leaderForm.company,
          pin: leaderForm.pin,
          photoURL: leaderForm.photoURL,
        });
      }
      setLeaderForm({ id: '', name: '', company: '', pin: '', photoURL: '' });
      setEditingLeader(null);
      await fetchLeaders();
    } catch (err) {
      console.error(err);
    }
    setLeaderLoading(false);
  };

  const handleEditLeader = (leader) => {
    setEditingLeader(leader.id);
    setLeaderForm({
      id: leader.id,
      name: leader.name || '',
      company: leader.company || '',
      pin: leader.pin || '',
      photoURL: leader.photoURL || '',
    });
  };

  const handleDeleteLeader = async (id) => {
    if (!confirm('Delete this leader?')) return;
    await deleteDoc(doc(db, 'leaders', id));
    await fetchLeaders();
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (loading || !user) return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FEE2DF' }}>
      <p style={{ color: '#36363E' }}>Loading...</p>
    </main>
  );

  if (user.email !== ADMIN_EMAIL) return null;

  const tabs = ['schedule', 'resources', 'leaders'];

  return (
    <main className="min-h-screen pb-16 px-4 pt-10" style={{ backgroundColor: '#FEE2DF' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ ...sectionTitle, fontSize: '36px' }}>Admin Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="text-sm px-4 py-2 rounded-xl"
            style={{ backgroundColor: '#36363E', color: 'white' }}
          >
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
              style={{
                backgroundColor: activeTab === tab ? '#F4324C' : 'white',
                color: activeTab === tab ? 'white' : '#36363E',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── SCHEDULE TAB ── */}
        {activeTab === 'schedule' && (
          <div>
            <h2 style={sectionTitle} className="mb-4">
              {editingSession ? 'Edit Session' : 'Add Session'}
            </h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-6 flex flex-col gap-3">
              {!editingSession && (
                <input
                  placeholder="Document ID (e.g. welcome, speed-dating)"
                  value={sessionForm.id}
                  onChange={e => setSessionForm({ ...sessionForm, id: e.target.value })}
                  style={inputStyle}
                />
              )}
              <input
                placeholder="Time (e.g. 12:30 or 13:00-13:30)"
                value={sessionForm.time}
                onChange={e => setSessionForm({ ...sessionForm, time: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Title"
                value={sessionForm.title}
                onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })}
                style={inputStyle}
              />
              <textarea
                placeholder="Description"
                value={sessionForm.description}
                onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
              <input
                placeholder="Order (e.g. 1, 2, 3)"
                value={sessionForm.order}
                onChange={e => setSessionForm({ ...sessionForm, order: e.target.value })}
                style={inputStyle}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSessionSubmit}
                  disabled={sessionLoading}
                  className="flex-1 rounded-xl py-3 text-white text-sm font-semibold"
                  style={{ backgroundColor: '#F4324C' }}
                >
                  {sessionLoading ? 'Saving...' : editingSession ? 'Update session' : 'Add session'}
                </button>
                {editingSession && (
                  <button
                    onClick={() => { setEditingSession(null); setSessionForm({ id: '', time: '', title: '', description: '', order: '' }); }}
                    className="px-4 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#e5e7eb', color: '#36363E' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 style={sectionTitle} className="mb-4">All Sessions</h2>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold mb-0.5" style={{ color: '#F4324C' }}>{session.time}</p>
                    <p className="font-semibold text-sm" style={{ color: '#36363E' }}>{session.title}</p>
                    <p className="text-xs mt-0.5 opacity-50" style={{ color: '#36363E' }}>ID: {session.id} · Order: {session.order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditSession(session)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#FEE2DF', color: '#36363E' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ backgroundColor: '#F4324C' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESOURCES TAB ── */}
        {activeTab === 'resources' && (
          <div>
            <h2 style={sectionTitle} className="mb-4">
              {editingResource ? 'Edit Resource' : 'Add Resource'}
            </h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-6 flex flex-col gap-3">
              <input
                placeholder="Session ID (e.g. cv-and-linkedin)"
                value={resourceForm.sessionid}
                onChange={e => setResourceForm({ ...resourceForm, sessionid: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Title (e.g. Example CV Template)"
                value={resourceForm.title}
                onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="URL (e.g. https://drive.google.com/...)"
                value={resourceForm.url}
                onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Order (e.g. 1, 2, 3)"
                value={resourceForm.order}
                onChange={e => setResourceForm({ ...resourceForm, order: e.target.value })}
                style={inputStyle}
              />

              {/* Session ID helper */}
              <div className="rounded-xl px-4 py-3 text-xs" style={{ backgroundColor: '#FEE2DF', color: '#36363E' }}>
                <p className="font-semibold mb-1">Session IDs:</p>
                {sessions.map(s => (
                  <p key={s.id} className="opacity-70">{s.id} — {s.title}</p>
                ))}
              </div>

              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleResourceSubmit}
                  disabled={resourceLoading}
                  className="flex-1 rounded-xl py-3 text-white text-sm font-semibold"
                  style={{ backgroundColor: '#F4324C' }}
                >
                  {resourceLoading ? 'Saving...' : editingResource ? 'Update resource' : 'Add resource'}
                </button>
                {editingResource && (
                  <button
                    onClick={() => { setEditingResource(null); setResourceForm({ sessionid: '', title: '', url: '', order: '' }); }}
                    className="px-4 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#e5e7eb', color: '#36363E' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 style={sectionTitle} className="mb-4">All Resources</h2>
            <div className="space-y-3">
              {resources.map(resource => (
                <div key={resource.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#36363E' }}>{resource.title}</p>
                    <p className="text-xs mt-0.5 opacity-50 truncate" style={{ color: '#36363E' }}>Session: {resource.sessionid}</p>
                    <p className="text-xs opacity-50 truncate" style={{ color: '#36363E' }}>{resource.url}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditResource(resource)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#FEE2DF', color: '#36363E' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ backgroundColor: '#F4324C' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LEADERS TAB ── */}
        {activeTab === 'leaders' && (
          <div>
            <h2 style={sectionTitle} className="mb-4">
              {editingLeader ? 'Edit Leader' : 'Add Leader'}
            </h2>
            <div className="bg-white rounded-3xl p-5 shadow-sm mb-6 flex flex-col gap-3">
              {!editingLeader && (
                <input
                  placeholder="Document ID (e.g. jane-smith)"
                  value={leaderForm.id}
                  onChange={e => setLeaderForm({ ...leaderForm, id: e.target.value })}
                  style={inputStyle}
                />
              )}
              <input
                placeholder="Full name"
                value={leaderForm.name}
                onChange={e => setLeaderForm({ ...leaderForm, name: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Company"
                value={leaderForm.company}
                onChange={e => setLeaderForm({ ...leaderForm, company: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="PIN (6 digits)"
                value={leaderForm.pin}
                onChange={e => setLeaderForm({ ...leaderForm, pin: e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Photo URL (optional)"
                value={leaderForm.photoURL}
                onChange={e => setLeaderForm({ ...leaderForm, photoURL: e.target.value })}
                style={inputStyle}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleLeaderSubmit}
                  disabled={leaderLoading}
                  className="flex-1 rounded-xl py-3 text-white text-sm font-semibold"
                  style={{ backgroundColor: '#F4324C' }}
                >
                  {leaderLoading ? 'Saving...' : editingLeader ? 'Update leader' : 'Add leader'}
                </button>
                {editingLeader && (
                  <button
                    onClick={() => { setEditingLeader(null); setLeaderForm({ id: '', name: '', company: '', pin: '', photoURL: '' }); }}
                    className="px-4 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#e5e7eb', color: '#36363E' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <h2 style={sectionTitle} className="mb-4">All Leaders</h2>
            <div className="space-y-3">
              {leaders.map(leader => (
                <div key={leader.id} className="bg-white rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {leader.photoURL ? (
                      <img src={leader.photoURL} alt={leader.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#F4324C' }}>
                        {leader.name?.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#36363E' }}>{leader.name}</p>
                      <p className="text-xs opacity-50 truncate" style={{ color: '#36363E' }}>{leader.company} · PIN: {leader.pin}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditLeader(leader)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ backgroundColor: '#FEE2DF', color: '#36363E' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLeader(leader.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ backgroundColor: '#F4324C' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}