import React from 'react';
import { Home, Users, Plus, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAuth();

  const navItems = [
    { id: 'home' as NavigationTab, label: 'হোম', icon: Home },
    { id: 'refer' as NavigationTab, label: 'রেফার', icon: Users, badge: 'বোনাস' },
    { id: 'create' as NavigationTab, label: 'পোস্ট', icon: Plus, isAction: true },
    { id: 'wallet' as NavigationTab, label: 'ওয়ালেট', icon: Wallet },
    { id: 'profile' as NavigationTab, label: 'প্রোফাইল', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 max-w-md mx-auto shadow-2xl">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center -top-4 relative group active:scale-90 transition-transform"
                title="নতুন পোস্ট বা স্টোরি তৈরি করুন"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 ring-4 ring-slate-900 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-semibold text-slate-300 mt-1">পোস্ট</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all relative ${
                isActive ? 'text-rose-500 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] bg-rose-500 text-white px-1 py-0.2 rounded-full font-extrabold uppercase animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 ${isActive ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
