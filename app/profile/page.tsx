'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/TelegramProvider';

export default function ProfilePage() {
  const { user } = useTelegram();

  // Profile local storage states
  const [role, setRole] = useState('');
  const [project, setProject] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [socialLink, setSocialLink] = useState('');
  
  // UI states
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('profile_role');
    const savedProject = localStorage.getItem('profile_project');
    const savedLookingFor = localStorage.getItem('profile_lookingFor');
    const savedSocialLink = localStorage.getItem('profile_socialLink');

    if (savedRole) setRole(savedRole);
    if (savedProject) setProject(savedProject);
    if (savedLookingFor) setLookingFor(savedLookingFor);
    if (savedSocialLink) setSocialLink(savedSocialLink);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate a brief blockchain transaction delay
    setTimeout(() => {
      localStorage.setItem('profile_role', role);
      localStorage.setItem('profile_project', project);
      localStorage.setItem('profile_lookingFor', lookingFor);
      localStorage.setItem('profile_socialLink', socialLink);
      
      setIsSaving(false);
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const displayName = user 
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `User ${user.id}`
    : 'Local Node';

  return (
    <main className="min-h-screen bg-slate-950 p-6 pb-28 text-slate-200 font-sans relative overflow-x-hidden">
      {/* Background ambient glowing spheres for Web3 vibe */}
      <div className="absolute top-[-5%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-8 relative z-10">
        
        {/* Header Info */}
        <header className="flex flex-col items-center justify-center pt-8 pb-4 border-b border-slate-800/50">
          <div className="w-20 h-20 bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)] mb-4">
            <span className="text-3xl font-bold bg-gradient-to-br from-red-400 to-purple-500 text-transparent bg-clip-text">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 font-mono tracking-tight text-center">
            {displayName}
          </h1>
          <p className="text-red-400 text-xs mt-2 font-mono bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
            {user?.id ? `ID: ${user.id}` : 'UNVERIFIED ENTITY'}
          </p>
        </header>

        {/* Input Fields Container */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-6 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            
            {/* Field 1: Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
                My Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Smart Contract Dev"
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-slate-600"
              />
            </div>

            {/* Field 2: Project */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
                Current Project
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Avalanche DeFi protocol"
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-slate-600"
              />
            </div>

            {/* Field 3: Looking For */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
                Looking For
              </label>
              <input
                type="text"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="e.g. UI/UX Designer, Investors"
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-slate-600"
              />
            </div>

            {/* Field 4: Social Link */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                Social / Link
              </label>
              <input
                type="text"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="twitter.com/myhandle"
                className="w-full bg-slate-950/50 border border-slate-800 text-slate-200 text-sm rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-red-600 border border-red-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none transition-all flex items-center justify-center space-x-2 font-mono tracking-widest uppercase mt-4 active:scale-95"
          >
            {isSaving ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="text-lg">💾</span>
                <span>Save to On-Chain Identity</span>
              </>
            )}
          </button>
        </section>

        {/* Floating Toast Notification */}
        <div 
          className={`fixed top-6 left-1/2 -translate-x-1/2 bg-green-500/90 backdrop-blur-md text-white font-mono px-6 py-3 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] border border-green-400 transition-all duration-300 z-50 flex items-center gap-2 ${
            showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
        >
          <svg className="w-5 h-5 text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Identity Synced!
        </div>

      </div>
    </main>
  );
}
