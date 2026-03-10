'use client';

import { useState } from 'react';
import Image from 'next/image';

const MOCK_CONNECTIONS = [
  {
    id: 1,
    name: 'Alex Vance',
    handle: '@alex_avax',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    tags: ['#DeFi', '#Avalanche', 'Met at Hacker House'],
    match: true
  },
  {
    id: 2,
    name: 'Sarah Chen',
    handle: '@sarah_xyz',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    tags: ['#UIUX', '#Web3', 'Looking for Devs'],
    match: false
  },
  {
    id: 3,
    name: '0xMike',
    handle: '@mike_0x',
    avatar: 'https://i.pravatar.cc/150?u=mike',
    tags: ['#SmartContracts', 'Met at EthDenver', 'Auditor'],
    match: false
  }
];

export default function NetworkCRM() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setHasSearched(false);

    // Simulate AI scanning delay
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 1500);
  };

  const displayedConnections = hasSearched 
    ? MOCK_CONNECTIONS.filter(conn => conn.match) 
    : MOCK_CONNECTIONS;

  return (
    <main className="min-h-screen bg-slate-950 p-4 pb-28 text-slate-200 font-sans relative overflow-x-hidden">
      {/* Background ambient glowing spheres for Web3 vibe */}
      <div className="absolute top-[-5%] right-[-10%] w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-6 relative z-10 pt-4">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-2 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold text-slate-100 font-mono tracking-tight flex items-center gap-2">
            <span className="text-xl">🌐</span> Network CRM
          </h1>
          <div className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-[10px] text-red-400 font-mono font-bold uppercase tracking-widest shadow-[inset_0_0_8px_rgba(239,68,68,0.2)]">
            AI Active
          </div>
        </header>

        {/* Top Section (AI Search) */}
        <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4">
           <div className="space-y-3">
             <label className="text-xs font-mono text-slate-400 uppercase tracking-widest pl-1">
               Ask AI Assistant
             </label>
             <div className="relative">
               <textarea
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Ask AI: 'Who was the Avalanche dev I met yesterday?'"
                 className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 pr-12 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] resize-none"
                 rows={2}
               />
               <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="absolute shrink-0 bottom-3 right-3 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold font-mono shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all active:scale-95 disabled:opacity-50"
               >
                 ✨ Search
               </button>
             </div>
           </div>

           {isSearching && (
             <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in duration-300">
                <div className="flex space-x-1 items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-xs text-purple-400 font-mono animate-pulse tracking-wider">
                  🧠 AI scanning your on-chain graph...
                </p>
             </div>
           )}
        </section>

        {/* Middle Section (Mini Social Graph) */}
        <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-2xl p-4 overflow-hidden relative">
          <div className="h-40 w-full relative flex items-center justify-center">
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="50%" x2="20%" y2="25%" className="stroke-red-500/40 stroke-2 animate-pulse" />
              <line x1="50%" y1="50%" x2="80%" y2="35%" className="stroke-purple-500/40 stroke-2 animate-pulse [animation-delay:0.5s]" />
              <line x1="50%" y1="50%" x2="30%" y2="80%" className="stroke-red-500/30 stroke-2 animate-[pulse_2s_infinite] [animation-delay:1s]" />
              <line x1="50%" y1="50%" x2="75%" y2="75%" className="stroke-purple-500/30 stroke-2 animate-[pulse_3s_infinite] [animation-delay:1.5s]" />
            </svg>
            
            {/* Avatars */}
            <div className="absolute top-[25%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-red-500/50 overflow-hidden shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              <Image src="https://i.pravatar.cc/150?u=alex" fill alt="Node 1" className="object-cover" />
            </div>
            <div className="absolute top-[35%] left-[80%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-purple-500/50 overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.5)] bg-slate-800">
              <Image src="https://i.pravatar.cc/150?u=sarah" fill alt="Node 2" className="object-cover" />
            </div>
            <div className="absolute top-[80%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-red-500/40 overflow-hidden shadow-[0_0_10px_rgba(239,68,68,0.3)] bg-slate-800">
              <Image src="https://i.pravatar.cc/150?u=mike" fill alt="Node 3" className="object-cover" />
            </div>
            <div className="absolute top-[75%] left-[75%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-purple-500/40 overflow-hidden shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-slate-800">
              <Image src="https://i.pravatar.cc/150?u=4" fill alt="Node 4" className="object-cover" />
            </div>
            
            {/* Center User Node */}
            <div className="z-10 w-16 h-16 rounded-full border-2 border-red-500 bg-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.8)] overflow-hidden">
               <span className="text-2xl drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">🔺</span>
            </div>
            
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-full px-3 py-1.5 text-[10px] text-slate-400 font-mono inline-flex items-center whitespace-nowrap z-20 shadow-lg">
               <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
               142 Connections on Avalanche Fuji
            </div>
          </div>
        </section>

        {/* Bottom Section (Recent Connections) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono">
              {hasSearched ? 'AI Result' : 'Recent Connections'}
            </h2>
            {hasSearched && (
              <button 
                onClick={() => { setHasSearched(false); setSearchQuery('') }}
                className="text-xs text-red-400 hover:text-red-300 font-mono transition"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="space-y-3">
            {displayedConnections.map((conn) => (
              <div key={conn.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl shadow-lg flex flex-col space-y-3">
                
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-700">
                      <Image src={conn.avatar} fill alt={conn.name} className="object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{conn.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{conn.handle}</p>
                    </div>
                  </div>
                  <a 
                    href={`https://t.me/${conn.handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-slate-800 border border-slate-700 hover:border-red-500 hover:text-red-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] text-slate-300 transition-all rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                  >
                    <span>💬</span> Message
                  </a>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {conn.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono tracking-wide ${
                        tag.includes('#Avalanche') || tag.includes('Hacker House')
                          ? 'bg-red-500/10 border-red-500/30 text-red-300'
                          : 'bg-slate-950/50 border-slate-700 text-slate-400'
                      }`}
                    >
                      {tag.startsWith('#') ? tag : `[${tag}]`}
                    </span>
                  ))}
                </div>

              </div>
            ))}
          </div>

        </section>

      </div>
    </main>
  );
}
