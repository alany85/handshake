'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Camera, User, Bell, QrCode, Network } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Connect', href: '/', icon: Camera },
    { name: 'My QR', href: '/my-qr', icon: QrCode },
    { name: 'Network', href: '/network', icon: Network },
    { name: 'Inbox', href: '/inbox', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 px-6 py-3 flex justify-between z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              isActive 
                ? 'text-red-500 scale-105' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
            <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'font-bold' : 'font-medium'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
