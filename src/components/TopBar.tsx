import React, { useState } from 'react';
import { Coins, Send, Shield, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatBDT, formatCoins } from '../utils/format';

export const TopBar: React.FC = () => {
  const { currentUser, setActiveTab, toggleRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      {/* Brand logo & title */}
      <div 
        onClick={() => setActiveTab('home')}
        className="flex items-center gap-2.5 cursor-pointer select-none group"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-rose-400 bg-clip-text text-transparent">
            SocialCash
          </span>
          <span className="block text-[10px] text-emerald-400 font-semibold leading-none flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            আর্ন ও লাইভ ক্যাশআউট
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Admin toggle badge */}
        <button
          onClick={toggleRole}
          title={currentUser.role === 'admin' ? 'Switch to User View' : 'Switch to Admin Panel'}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
            currentUser.role === 'admin'
              ? 'bg-purple-600/30 border-purple-500/50 text-purple-300 shadow-sm shadow-purple-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>{currentUser.role === 'admin' ? 'এডমিন মোড' : 'এডমিন'}</span>
        </button>

        {/* Coin & Balance Pill */}
        <button
          onClick={() => setActiveTab('wallet')}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/30 px-3 py-1.5 rounded-full transition-all active:scale-95 group shadow-sm"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs shadow-inner">
            <Coins className="w-3 h-3 text-slate-950" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-amber-300 leading-tight">
              {formatCoins(currentUser.coins)}
            </span>
            <span className="text-[10px] font-medium text-emerald-400 leading-none">
              {formatBDT(currentUser.balanceBDT)}
            </span>
          </div>
        </button>

        {/* Telegram Community Icon */}
        <a
          href="https://t.me/socialcashbd_official"
          target="_blank"
          rel="noopener noreferrer"
          title="আমাদের টেলিগ্রাম চ্যানেলে যোগ দিন"
          className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 hover:bg-sky-500/30 text-sky-400 flex items-center justify-center transition-all"
        >
          <Send className="w-3.5 h-3.5 -rotate-12 translate-x-0.5" />
        </a>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 flex items-center justify-center transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-2">
                <span className="text-xs font-bold text-slate-200">বিজ্ঞপ্তি (Notifications)</span>
                <span className="text-[10px] text-slate-400">৩টি নতুন</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition flex items-start gap-2">
                  <span className="text-base">🎉</span>
                  <div>
                    <p className="font-semibold text-slate-200">বিকাশ ক্যাশআউট চালু!</p>
                    <p className="text-[11px] text-slate-400">মাত্র ৫০ টাকা হলেই বিকাশ ও নগদে উত্তোলন করুন।</p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 transition flex items-start gap-2">
                  <span className="text-base">👥</span>
                  <div>
                    <p className="font-semibold text-slate-200">রেফারেল বোনাস বৃদ্ধি</p>
                    <p className="text-[11px] text-slate-400">প্রতি রেফারে ১০০ কয়েন তাৎক্ষণিক পেয়ে যাবেন।</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
