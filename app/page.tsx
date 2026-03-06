'use client';

import { useState } from 'react';
import { useTelegram } from '@/components/TelegramProvider';
import Image from 'next/image';

const MESSAGES = [
  "Nice to meet you!",
  "Let's build together!",
  "Great chat at the event!"
];

export default function Home() {
  const { user, webApp } = useTelegram();
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<string>(MESSAGES[0]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleScanQR = () => {
    if (!webApp) return;

    webApp.showScanQrPopup({ text: "Scan someone's TG QR" }, (text) => {
      // Assuming the scanned QR contains the user's TG ID or a URL with it.
      // E.g., if it's "https://t.me/someuser", but the requirements say "returns the scanned user's Telegram ID"
      if (text) {
        setScannedId(text);
        // The popup doesn't close automatically on all versions. 
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

    try {
      const formData = new FormData();
      formData.append('scanner_tg_id', user.id.toString());
      formData.append('scanned_tg_id', scannedId);
      formData.append('message', selectedMessage);
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
      setSelectedMessage(MESSAGES[0]);

      // Optionally alert them native TMA popup
      webApp?.showAlert("Connection created successfully!");

    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <main className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connected!</h1>
        <p className="text-gray-600 mb-8">Your photo and message have been saved and sent.</p>
        <button
          onClick={() => setStatus('idle')}
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition"
        >
          Scan Another
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col space-y-6">
      <header className="py-4">
        <h1 className="text-2xl font-bold text-gray-900">New Connection</h1>
        <p className="text-gray-500 text-sm mt-1">Scan to meet Web3 builders.</p>
        {user && (
          <p className="text-xs text-blue-600 mt-2 font-medium bg-blue-50 w-fit px-2 py-1 rounded">
            Logged in as {user.first_name}
          </p>
        )}
      </header>

      {/* Step 1: Scan QR */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">1. Scan ID</h2>
          <p className="text-xs text-gray-500">Scan their Telegram QR code to connect.</p>
        </div>
        {scannedId ? (
          <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-200">
            <span className="text-sm font-medium text-green-800 truncate">ID: {scannedId}</span>
            <button onClick={() => setScannedId(null)} className="text-xs font-semibold text-red-600 hover:opacity-75">Clear</button>
          </div>
        ) : (
          <button
            onClick={handleScanQR}
            className="w-full bg-blue-50 text-blue-700 font-semibold py-3 px-4 rounded-xl hover:bg-blue-100 active:bg-blue-200 transition flex items-center justify-center space-x-2 border border-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Scan QR to Connect</span>
          </button>
        )}
      </section>

      {/* Step 2 & 3: Photo & Message (Only show if scanned) */}
      {scannedId && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">2. Take a Photo</h2>
              <p className="text-xs text-gray-500 mb-4">Capture the moment together.</p>
            </div>

            <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer overflow-hidden transition">
              {photoPreview ? (
                <div className="absolute inset-0 w-full h-full">
                  <Image src={photoPreview} fill style={{ objectFit: 'cover' }} alt="Preview" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">Tap to retake</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 font-medium">Open Camera</p>
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

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">3. Select Message</h2>
              <p className="text-xs text-gray-500">Pick a greeting for the connection.</p>
            </div>
            <div className="flex flex-col space-y-2">
              {MESSAGES.map((msg, idx) => (
                <label key={idx} className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${selectedMessage === msg ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="message"
                    value={msg}
                    checked={selectedMessage === msg}
                    onChange={() => setSelectedMessage(msg)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-800">{msg}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {status === 'error' && errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {errorMessage}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!photo || status === 'loading'}
            className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 active:bg-blue-800 transition flex items-center justify-center space-x-2"
          >
            {status === 'loading' ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span>Send Connection</span>
            )}
          </button>
        </section>
      )}
    </main>
  );
}
