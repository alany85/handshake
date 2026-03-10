'use client';

import { useState, useEffect } from 'react';
import { useTelegram } from '@/components/TelegramProvider';
import Image from 'next/image';
import { Camera, QrCode as QRIcon, Sparkles, CheckCircle2 } from 'lucide-react';

const LOADING_STEPS = [
  "Processing photo...",
  "Analyzing metadata...",
  "Saving connection...",
  "Finishing up..."
];

export default function Home() {
  const { user, webApp } = useTelegram();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [draftedMessage, setDraftedMessage] = useState<string>("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [successData, setSuccessData] = useState<{ image: string | null, targetId: string | null } | null>(null);
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
    let draft = "Hi! 👋";
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
      draft += ` Let's connect: ${profileData.socialLink}.`;
    }
    draft += " Great meeting you today!";
    
    setDraftedMessage(draft);
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
      formData.append('custom_intro', draftedMessage || "Great meeting you today! Let's stay in touch.");
      formData.append('photo', photo);

      const res = await fetch('/api/connect', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to connect.');
      }

      setSuccessData({ image: photoPreview, targetId: scannedId });
      setStatus('success');
      setScannedId(null);
      setPhoto(null);
      setPhotoPreview(null);
      setDraftedMessage("");

      // Optionally alert them native TMA popup
      webApp?.showAlert("You are now connected!");

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    let displayId = successData?.targetId || '';
    if (displayId.includes('|')) {
      displayId = displayId.split('|')[1] || displayId.split('|')[0];
    } else if (displayId.includes('t.me/')) {
      displayId = displayId.split('t.me/')[1].split('/')[0].split('?')[0];
    } else {
      displayId = displayId.replace('@', '');
    }

    return (
      <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[85vh] text-center bg-gray-50 text-gray-900 pb-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full blur-[80px] -z-10 pointer-events-none" />
        
        {/* The Polaroid Card */}
        <div className="bg-white p-3 pb-6 rounded-sm shadow-xl mt-4 mb-2 w-72 rotate-3 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out z-10">
          <div className="w-full aspect-[4/5] relative bg-gray-200 mb-4 overflow-hidden shadow-inner border border-gray-100">
            {successData?.image && (
              <Image 
                src={successData.image} 
                fill 
                className="object-cover" 
                alt="Memory Snapshot" 
              />
            )}
          </div>
          <div className="flex flex-col items-center space-y-1">
             <p className="font-serif italic text-gray-700 text-lg tracking-tight">
                Connected with @{displayId}
             </p>
             <p className="text-gray-400 text-[10px] font-sans uppercase tracking-[0.2em]">{today}</p>
          </div>
        </div>
        
        {/* Subtle Web3 Flex */}
        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-12 px-5 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm mt-8 z-10 text-left leading-relaxed">
           <span className="text-lg leading-none shrink-0">🔒</span> 
           <span>Memory permanently saved on Avalanche Network.</span>
        </div>

        <button 
          onClick={() => { setStatus('idle'); setSuccessData(null); }}
          className="w-full bg-red-500 text-white font-semibold py-4 px-4 rounded-full hover:bg-red-600 shadow-md transition-all active:scale-95 text-lg z-10"
        >
          Back to Camera
        </button>
      </main>
    );
  }

  if (status === 'loading') {
    return (
      <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center bg-gray-50 text-gray-900">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connecting...
        </h2>
        <p className="text-gray-500 animate-pulse">
          {LOADING_STEPS[loadingStepIndex]}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-24 text-gray-900 font-sans">
      <div className="max-w-md mx-auto space-y-6 pt-2">
        <header className="py-4 px-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            New Connection
          </h1>
          <p className="text-gray-500 text-sm mt-1">Scan a QR code to connect with someone.</p>
        </header>

        {/* Step 1: Scan QR */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">1. Contact Info</h2>
          </div>
          {scannedId ? (
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-2xl border border-gray-200">
              <span className="text-sm font-medium text-gray-700 truncate mr-2">{scannedId}</span>
              <button onClick={() => setScannedId(null)} className="text-xs font-semibold text-gray-500 hover:text-red-500 transition px-2 py-1 bg-white rounded-lg border border-gray-200 shadow-sm whitespace-nowrap">Change</button>
            </div>
          ) : (
            <button 
              onClick={handleScanQR}
              className="w-full bg-gray-100 text-gray-900 font-semibold py-4 px-4 rounded-2xl hover:bg-gray-200 transition flex items-center justify-center space-x-2 border border-gray-200"
            >
              <QRIcon className="w-5 h-5 text-gray-600" />
              <span>Scan QR Code</span>
            </button>
          )}
        </section>

        {/* Step 2 & 3: Photo & Message */}
        {scannedId && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">2. Take a Photo</h2>
                <p className="text-xs text-gray-500 mt-1">Remember who you met.</p>
              </div>
              
              <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition group">
                {photoPreview ? (
                  <div className="absolute inset-0 w-full h-full">
                    <Image src={photoPreview} fill style={{ objectFit: 'cover' }} alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-sm shadow-sm flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Retake
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-gray-600 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                      <Camera className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-sm font-medium">Tap to open camera</p>
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
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">3. Context to Share</h2>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(profileData).map(([key, value]) => {
                    if (!value) return null;
                    const isSelected = selectedTags[key as keyof typeof selectedTags];
                    const label = key === 'lookingFor' ? 'Looking For' : key.charAt(0).toUpperCase() + key.slice(1);
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedTags(prev => ({ ...prev, [key]: !prev[key as keyof typeof selectedTags] }))}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                          isSelected 
                            ? 'bg-red-50 text-red-600 border border-red-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected && <span className="mr-1 inline-block -translate-y-[0.5px]">✓</span>}
                        <span className="opacity-80 font-normal mr-1">{label}:</span>{value}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">4. Message</h2>
                </div>
                <button
                  onClick={handleAIMagic}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-all active:scale-95 border border-blue-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Draft
                </button>
              </div>
              
              <textarea
                value={draftedMessage}
                onChange={(e) => setDraftedMessage(e.target.value)}
                rows={3}
                className="w-full bg-gray-100 border-none text-gray-900 text-sm rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all placeholder:text-gray-400 resize-none"
                placeholder="Write a custom intro message..."
              />
            </div>

            {/* Error Message */}
            {status === 'error' && errorMessage && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm flex items-center gap-2">
                <span className="font-bold">!</span> {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!photo}
              className="w-full bg-red-500 text-white font-semibold py-4 px-4 rounded-2xl hover:bg-red-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-sm mt-4"
            >
              <span>Connect</span>
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
