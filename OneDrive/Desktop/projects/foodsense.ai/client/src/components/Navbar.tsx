'use client';

import { ScanLine, Clock, User } from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export default function Navbar({ onOpenProfile, onOpenHistory, historyCount }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-3 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
          <ScanLine className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">foodsense<span className="text-gray-400">.ai</span></span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenHistory}
          className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Scan history"
        >
          <Clock className="w-5 h-5 text-gray-700" />
          {historyCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full" />
          )}
        </button>

        <button
          onClick={onOpenProfile}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Dietary profile"
        >
          <User className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </nav>
  );
}
