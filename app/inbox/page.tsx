'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Bell, ChevronLeft, Sparkles, MessageCircle, Clock } from 'lucide-react';
import { useTelegram } from '@/components/TelegramProvider';
import { supabase } from '@/utils/supabase';

interface InboxRequest {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  time: string;
  message: string;
  photo: string;
}

export default function InboxPage() {
  const { user } = useTelegram();
  const [requests, setRequests] = useState<InboxRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InboxRequest | null>(null);
  
  // Profile Data States
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

  const [draftedReply, setDraftedReply] = useState('');

  useEffect(() => {
    // Load local profile data
    setProfileData({
      role: localStorage.getItem('profile_role') || '',
      project: localStorage.getItem('profile_project') || '',
      lookingFor: localStorage.getItem('profile_lookingFor') || '',
      socialLink: localStorage.getItem('profile_socialLink') || '',
    });

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch real connections targeting exactly this user
    const fetchInbox = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('connections')
          .select('*')
          .or(`scanned_tg_id.eq.${user.id},scanned_tg_id.eq.${user.username},scanned_tg_id.eq.@${user.username}`)
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        const formatted = (data || []).map((conn: any) => {
           // Calculate time string mock logic
           const date = new Date(conn.created_at);
           const now = new Date();
           const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
           let timeStr = `${diffMins} mins ago`;
           if (diffMins > 60) timeStr = `${Math.floor(diffMins/60)} hours ago`;
           if (diffMins > 1440) timeStr = date.toLocaleDateString();

           return {
             id: conn.id,
             name: `User ${conn.scanner_tg_id}`, // In real app, fetch actual name or store it in DB
             handle: conn.scanner_tg_id,
             avatar: `https://i.pravatar.cc/150?u=${conn.scanner_tg_id}`,
             time: timeStr,
             message: conn.message,
             photo: conn.image_url
           };
        });

        setRequests(formatted);
      } catch (err: any) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [user]);

  const handleAIReply = () => {
    let draft = "Gm! Great connecting! 🙌";
    if (profileData.role && selectedTags.role) {
      draft += ` I'm working as a ${profileData.role}.`;
    }
    if (profileData.project && selectedTags.project) {
      draft += ` Right now I'm focused on ${profileData.project}.`;
    }
    if (profileData.lookingFor && selectedTags.lookingFor) {
      draft += ` I'm actively looking for ${profileData.lookingFor}.`;
    }
    if (profileData.socialLink && selectedTags.socialLink) {
      draft += ` Here's my link: ${profileData.socialLink}.`;
    }
    draft += " Let's chat more!";
    setDraftedReply(draft);
  };

  const handleReplyTelegram = () => {
    if (!selectedRequest) return;
    const encodedReply = encodeURIComponent(draftedReply || "Gm! Got your connection! ☕️");
    const handle = selectedRequest.handle.replace('@', '');
    window.open(`https://t.me/${handle}?text=${encodedReply}`, '_blank');
  };

  // ----- Detail View Render -----
  if (selectedRequest) {
    return (
      <main className="min-h-screen bg-gray-50 pb-28 text-gray-900 font-sans relative">
        <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-40">
          <button 
            onClick={() => {
              setSelectedRequest(null);
              setDraftedReply('');
            }}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-red-500"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
             <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                <Image src={selectedRequest.avatar} fill alt={selectedRequest.name} className="object-cover" />
             </div>
             <div>
               <h1 className="text-sm font-bold tracking-tight leading-tight">{selectedRequest.name}</h1>
               <p className="text-xs text-gray-500">{selectedRequest.handle}</p>
             </div>
          </div>
        </header>

        <div className="p-4 max-w-md mx-auto space-y-6">
           {/* Photo Memory */}
           <div className="bg-white p-3 pb-5 rounded-2xl shadow-sm border border-gray-100 rotate-1 max-w-sm mx-auto">
             <div className="w-full aspect-square relative bg-gray-100 rounded-xl mb-3 overflow-hidden border border-gray-100">
               <Image src={selectedRequest.photo} fill alt="Connection Photo" className="object-cover grayscale-[20%]" />
             </div>
             <p className="text-gray-600 text-sm px-2 font-serif italic text-center text-balance leading-snug">
               "{selectedRequest.message}"
             </p>
           </div>

           {/* Context Toggles */}
           {(profileData.role || profileData.project || profileData.lookingFor || profileData.socialLink) && (
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-3">
                <h2 className="text-sm font-bold text-gray-900 px-1">Reply Context</h2>
                <div className="flex flex-wrap gap-2">
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
                            ? 'bg-blue-50 text-blue-600 border border-blue-200' 
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

            {/* AI Reply Builder */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-gray-900">Message Draft</h2>
                <button
                  onClick={handleAIReply}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all active:scale-95 border border-indigo-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Draft Reply
                </button>
              </div>
              <textarea
                value={draftedReply}
                onChange={(e) => setDraftedReply(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl p-4 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all placeholder:text-gray-400 resize-none"
                placeholder="Write your reply..."
              />
            </div>

            <button
              onClick={handleReplyTelegram}
              className="w-full bg-blue-500 text-white font-semibold py-4 px-4 rounded-full shadow-sm hover:bg-blue-600 transition-all active:scale-95 text-base flex items-center justify-center gap-2 mb-10"
            >
              <MessageCircle className="w-5 h-5" />
              Reply on Telegram
            </button>
        </div>
      </main>
    );
  }

  // ----- List View Render -----
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center font-sans tracking-tight">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-red-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </main>
    );
  }

  if (!user && requests.length === 0) {
     return (
        <main className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans">
           <p className="text-gray-500 text-center">Please open inside Telegram to view your real Inbox.</p>
        </main>
     )
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 pb-28 text-gray-900 font-sans">
      <div className="max-w-md mx-auto space-y-6 pt-2">
        <header className="px-2 pt-2 pb-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             Inbox
             <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold self-center shadow-sm">
               {requests.length}
             </span>
          </h1>
        </header>

        {requests.length === 0 ? (
          <div className="text-center py-20 px-4">
             <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
             </div>
             <h2 className="text-lg font-bold text-gray-900 mb-1">Inbox Empty</h2>
             <p className="text-sm text-gray-500">You haven't received any connection requests yet.</p>
          </div>
        ) : (
          <section className="space-y-4">
             {requests.map((req) => (
               <button
                  key={req.id}
                  onClick={() => setSelectedRequest(req)}
                  className="w-full text-left bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:bg-gray-50 hover:border-gray-200 hover:shadow-md active:scale-[0.98]"
               >
                  <div className="relative w-14 h-14 shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-red-100 bg-white p-0.5 overflow-hidden">
                      <img src={req.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-100">
                      <span className="text-xl leading-none">📸</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                     <div className="flex items-start justify-between mb-1">
                        <span className="font-bold text-gray-900 text-[15px] truncate pr-2">
                          {req.name} <span className="text-gray-500 font-normal text-xs">{req.handle.startsWith('@') ? req.handle : `@${req.handle}`}</span>
                        </span>
                     </div>
                     <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed font-medium">
                       connected with you.
                     </p>
                     <div className="flex items-center gap-1 mt-2 text-gray-400 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {req.time}
                     </div>
                  </div>
               </button>
             ))}
          </section>
        )}

      </div>
    </main>
  );
}
