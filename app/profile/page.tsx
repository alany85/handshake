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
    
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('profile_role', role);
      localStorage.setItem('profile_project', project);
      localStorage.setItem('profile_lookingFor', lookingFor);
      localStorage.setItem('profile_socialLink', socialLink);
      
      setIsSaving(false);
      setShowToast(true);
      
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    }, 600);
  };

  const displayName = user 
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `User ${user.id}`
    : 'Local User';

  return (
    <main className="min-h-screen bg-gray-50 p-6 pb-28 text-gray-900 font-sans relative overflow-x-hidden">
      <div className="max-w-md mx-auto space-y-8 relative z-10 pt-4">
        
        {/* Header Info */}
        <header className="flex flex-col items-center justify-center pt-4 pb-4">
          <div className="w-24 h-24 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm mb-4">
            <span className="text-4xl font-semibold text-gray-800">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight text-center">
            {displayName}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.id ? `@${user.username || user.id}` : 'Not connected to Telegram'}
          </p>
        </header>

        {/* Input Fields Container */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
          <div className="space-y-4">
            
            {/* Field 1: Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">
                My Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Smart Contract Dev"
                className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Field 2: Project */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">
                Current Project
              </label>
              <input
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Avalanche DeFi protocol"
                className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Field 3: Looking For */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 pl-1">
                Looking For
              </label>
              <input
                type="text"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                placeholder="e.g. UI/UX Designer, Investors"
                className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Field 4: Social Link */}
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-medium text-gray-700 pl-1 flex items-center gap-1.5">
                 Social Link
              </label>
              <input
                type="text"
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
                placeholder="twitter.com/myhandle"
                className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-2xl py-3.5 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-red-500 text-white font-semibold py-4 px-4 rounded-2xl hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center space-x-2 mt-4 active:scale-95 shadow-sm"
          >
            {isSaving ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Save Profile</span>
            )}
          </button>
        </section>

        {/* Floating Toast Notification */}
        <div 
          className={`fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center gap-2 text-sm font-medium ${
            showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8 pointer-events-none'
          }`}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          Profile Saved
        </div>

      </div>
    </main>
  );
}
