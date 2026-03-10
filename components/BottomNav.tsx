'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Camera, User, History, QrCode } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Connect', href: '/', icon: Camera },
    { name: 'My QR', href: '/my-qr', icon: QrCode },
    { name: 'History', href: '/notes', icon: History },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800/50 px-6 py-4 flex justify-around z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              isActive 
                ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] scale-110' 
                : 'text-slate-500 hover:text-slate-300 hover:scale-105'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] font-mono tracking-wider uppercase ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
