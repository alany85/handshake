'use client';

import { useTelegram } from '@/components/TelegramProvider';
import QRCode from 'react-qr-code';
import Link from 'next/link';

export default function MyQRCodePage() {
  const { user } = useTelegram();

  // 1. Fallback Mock Data for local browser testing
  const currentUser = user || {
    id: 987654321,
    username: 'testuser_web3',
    first_name: 'Test',
    last_name: 'User',
  };

  // 2. Encode format: id|username
  const qrData = `${currentUser.id}|${currentUser.username || ''}`;

  // 3. User Display Name
  const displayName = [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username || `User ${currentUser.id}`;

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 relative overflow-hidden">
      {/* Background ambient glowing spheres for Web3 vibe */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-sm z-10 space-y-8 flex flex-col">
        {/* Glassmorphism Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          
          {/* Top: User Info with Gradient Text */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              {displayName}
            </h1>
            {currentUser.username && (
              <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
                @{currentUser.username}
              </p>
            )}
          </div>

          {/* Middle: QR Code */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-white p-4 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
              <QRCode 
                value={qrData}
                size={200}
                bgColor="#ffffff"
                fgColor="#020617" // slate-950
                level="H"
              />
            </div>
          </div>

          {/* Bottom text */}
          <div className="mt-8 text-slate-400 text-sm font-medium tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Scan to connect & take a photo
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href="/"
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-3 backdrop-blur-sm relative overflow-hidden hover:scale-[1.02] active:scale-95 border border-blue-500/50"
        >
          <span className="text-xl">📸</span>
          Scan Someone Else
        </Link>
      </div>
    </main>
  );
}
