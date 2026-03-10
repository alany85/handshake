'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/TelegramProvider';
import Image from 'next/image';

const LOADING_STEPS = [
  "Encrypting photo data...",
  "Generating Zero-Knowledge Proof...",
  "Verifying on Avalanche Fuji Testnet...",
  "Minting Connection NFT..."
];

export default function Home() {
  const { user, webApp } = useTelegram();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("Gm! Great meeting you at the Avalanche Hacker House! 🔺");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Profile Context State
  const [profileData, setProfileData] = useState<{
    role: string;
    project: string;
    lookingFor: string;
    socialLink: string;
  }>({ role: '', project: '', lookingFor: '', socialLink: '' });

  const [selectedTags, setSelectedTags] = useState({
    role: true,
    project: true,
    lookingFor: true,
    socialLink: true
  });

  useEffect(() => {
    // Load profile data on mount
    setProfileData({
      role: localStorage.getItem('profile_role') || '',
      project: localStorage.getItem('profile_project') || '',
      lookingFor: localStorage.getItem('profile_lookingFor') || '',
      socialLink: localStorage.getItem('profile_socialLink') || '',
    });
  }, []);

  // Fake sequence loading logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'loading') {
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    } else {
      setLoadingStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleAIMagic = () => {
    let draft = "Gm! ☕️";
    if (profileData.role && selectedTags.role) {
      draft += ` I'm a ${profileData.role}.`;
    }
    if (profileData.project && selectedTags.project) {
      draft += ` Currently building ${profileData.project}.`;
    }
    if (profileData.lookingFor && selectedTags.lookingFor) {
      draft += ` Looking for ${profileData.lookingFor}.`;
    }
    if (profileData.socialLink && selectedTags.socialLink) {
      draft += ` Hit me up at ${profileData.socialLink}.`;
    }
    draft += " Let's connect and build on Avalanche! 🔺";
    
    setCustomMessage(draft);
  };

  const handleScanQR = () => {
    if (!webApp) return;

    webApp.showScanQrPopup({ text: "Scan someone's TG QR" }, (text) => {
      if (text) {
        setScannedId(text);
        // We close it manually to be safe.
        webApp.closeScanQrPopup();
        return true;
      }
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setErrorMessage("Telegram user ID not found. Open this in Telegram.");
      setStatus('error');
      return;
    }
    if (!scannedId || !photo) {
      setErrorMessage("Please scan a QR code and take a photo first.");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setLoadingStepIndex(0);

    try {
      const formData = new FormData();
      formData.append('scanner_tg_id', user.id.toString());
      formData.append('scanner_username', user.username || '');
      formData.append('scanned_tg_id', scannedId);
      formData.append('custom_message', customMessage);
      formData.append('photo', photo);

      const res = await fetch('/api/connect', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit connection.');
      }

      setStatus('success');
      setScannedId(null);
      setPhoto(null);
      setPhotoPreview(null);
      setCustomMessage("Gm! Great meeting you at the Avalanche Hacker House! 🔺");

      // Optionally alert them native TMA popup
      webApp?.showAlert("Connection Verified & Minted!");

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center bg-slate-950 text-slate-100">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500/50">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2 font-mono">Verified!</h1>
        <p className="text-slate-400 mb-8 font-mono text-sm">Proof of connection minted on Avalanche.</p>
        <button 
          onClick={() => setStatus('idle')}
          className="w-full bg-red-600/90 text-white font-semibold py-4 px-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:bg-red-500 border border-red-500 transition-all font-mono"
        >
          Scan Another Node
        </button>
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center bg-slate-950 text-slate-100 relative overflow-hidden">
        {/* Glow ambient background isolated for loading page */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-[80px]" />
        
        <div className="relative w-24 h-24 mb-8 z-10">
          <div className="absolute inset-0 border-t-2 border-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-red-400 rounded-full animate-[spin_2s_linear_reverse]"></div>
          <div className="absolute inset-4 border-b-2 border-red-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)] rounded-full bg-slate-950/50 backdrop-blur-sm">
            <span className="text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">🔺</span>
          </div>
        </div>
        
        <h2 className="text-lg font-bold text-red-500 mb-4 font-mono animate-pulse tracking-wide z-10">
          Processing Tx...
        </h2>
        
        <div className="h-10 z-10">
          <p className="text-slate-300 font-mono text-sm tracking-wide animate-pulse">
            {LOADING_STEPS[loadingStepIndex]}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 pb-24 text-slate-200 font-sans relative overflow-x-hidden">
      {/* Background ambient glowing spheres for Web3 vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-96 h-96 bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        <header className="py-4 border-b border-slate-800/50 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2 font-mono tracking-tight">
            <span className="text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">INIT</span> 
            SYNC
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Establish Avalanche connection.</p>
          {user && (
            <p className="inline-block text-xs text-red-400 mt-3 font-medium bg-red-500/10 px-2 py-1 rounded border border-red-500/20 font-mono shadow-[0_0_10px_rgba(239,68,68,0.2)]">
              Authorized: @{user.username || user.first_name}
            </p>
          )}
        </header>

        {/* Step 1: Scan QR */}
        <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-200">1. Target ID</h2>
            <p className="text-xs text-slate-500 mt-1">Scan QR to identify peer node.</p>
          </div>
          {scannedId ? (
            <div className="flex items-center justify-between bg-slate-950/50 px-4 py-3 rounded-xl border border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">
              <span className="text-sm font-mono text-red-400 truncate tracking-wide">[{scannedId}]</span>
              <button onClick={() => setScannedId(null)} className="text-xs font-semibold text-red-500 hover:text-red-400 transition ml-4 uppercase tracking-wider">Abort</button>
            </div>
          ) : (
            <button 
              onClick={handleScanQR}
              className="w-full bg-slate-800/80 text-slate-200 font-semibold py-4 px-4 rounded-xl hover:bg-slate-800 active:bg-slate-700 transition flex items-center justify-center space-x-2 border border-slate-700 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] font-mono group"
            >
              <svg className="w-5 h-5 text-red-500 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span>Scan QR Code</span>
            </button>
          )}
        </section>

        {/* Step 2 & 3: Photo & Message */}
        {scannedId && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-200">2. Optical Capture</h2>
                <p className="text-xs text-slate-500 mt-1">Provide visual proof of existence.</p>
              </div>
              
              <label className="relative flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 hover:bg-slate-900 cursor-pointer overflow-hidden transition group">
                {photoPreview ? (
                  <div className="absolute inset-0 w-full h-full">
                    <Image src={photoPreview} fill style={{ objectFit: 'cover' }} alt="Preview" className="opacity-80 mix-blend-lighten" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-red-400 font-mono bg-slate-900 border border-red-500/50 px-3 py-1 rounded-full text-xs shadow-[0_0_10px_rgba(239,68,68,0.5)]">RETARGET</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-red-500/70 group-hover:text-red-500 transition-colors group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="mb-2 text-sm text-slate-400 font-mono tracking-wider">LAUNCH CAM</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handlePhotoChange}
                />
              </label>
            </div>

            {/* Context / Tags Section */}
            {(profileData.role || profileData.project || profileData.lookingFor || profileData.socialLink) && (
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">3. Context</h2>
                  <p className="text-xs text-slate-500 mt-1">Select Info to Share</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profileData).map(([key, value]) => {
                    if (!value) return null;
                    const isSelected = selectedTags[key as keyof typeof selectedTags];
                    const label = key === 'lookingFor' ? 'Looking For' : key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTags(prev => ({ ...prev, [key]: !prev[key as keyof typeof selectedTags] }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all text-left ${
                          isSelected 
                            ? 'bg-slate-800 border-red-500 text-red-400 shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]' 
                            : 'bg-slate-950/50 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                        <span className="opacity-70 mr-1.5 text-slate-400">[{isSelected ? 'x' : ' '}]</span> 
                        <span className="font-semibold">{label}:</span> {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">4. Payload</h2>
                  <p className="text-xs text-slate-500 mt-1">Custom Intro Message (Optional)</p>
                </div>
                <button
                  onClick={handleAIMagic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-red-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider hover:from-purple-600/40 hover:to-red-600/40 transition-all hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                >
                  <span className="text-sm">✨</span> AI Draft Intro
                </button>
              </div>
              
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-950/50 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/50 transition-colors placeholder:text-slate-600 font-sans resize-none"
                placeholder="Write a custom intro message..."
              />
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="bg-red-950/50 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm font-mono shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                {'>'} ERROR: {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!photo}
              className="w-full bg-red-600 border border-red-500 text-white font-bold py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none transition-all flex items-center justify-center space-x-2 font-mono tracking-widest uppercase"
            >
              <span>Execute Tx</span>
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
