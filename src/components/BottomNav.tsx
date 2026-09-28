import React from 'react';
import { Home, Users, Plus, Wallet, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NavigationTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAuth();

  const navItems = [
    {
      id: 'home' as NavigationTab,
      label: 'Home',
      icon: Home,
      activeCircle: 'bg-gradient-to-tr from-[#ff385c] to-[#ff7745] text-white shadow-sm shadow-rose-500/25',
      activeText: 'text-[#ff385c] font-black',
    },
    {
      id: 'refer' as NavigationTab,
      label: 'Refer',
      icon: Users,
      badge: '0.5$',
      activeCircle: 'bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] text-white shadow-sm shadow-sky-500/25',
      activeText: 'text-[#0077b6] font-black',
    },
    {
      id: 'create' as NavigationTab,
      label: 'Create',
      icon: Plus,
      isCenterSpecial: true,
    },
    {
      id: 'wallet' as NavigationTab,
      label: 'Wallet',
      icon: Wallet,
      activeCircle: 'bg-gradient-to-tr from-[#f59e0b] to-[#ea580c] text-white shadow-sm shadow-amber-500/25',
      activeText: 'text-[#ea580c] font-black',
    },
    {
      id: 'profile' as NavigationTab,
      label: 'Profile',
      icon: UserIcon,
      activeCircle: 'bg-gradient-to-tr from-[#8b5cf6] to-[#ec4899] text-white shadow-sm shadow-purple-500/25',
      activeText: 'text-[#8b5cf6] font-black',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 max-w-md mx-auto shadow-[0_-2px_15px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeTab === item.id ||
            (item.id === 'wallet' && (activeTab === 'cashout' || activeTab === 'payments'));

          // Special Center Create Button
          if (item.isCenterSpecial) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab('create')}
                className="flex flex-col items-center justify-center -top-2.5 relative group active:scale-90 transition-transform duration-200 select-none"
                title="Create post"
              >
                {/* Elevated 3D Circular Badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff1361] via-[#ff5e3a] to-[#ff9900] flex items-center justify-center text-white shadow-md shadow-orange-500/30 ring-3 ring-white group-hover:scale-105 transition-all">
                  <Icon className="w-5 h-5 stroke-[2.8]" />
                </div>

                {/* Create Label */}
                <span className="text-[9.5px] font-black text-[#ff5e3a] mt-0.5 leading-none">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center py-0.5 px-1 transition-all select-none relative group active:scale-90"
            >
              {/* Badge if present */}
              {item.badge && !isActive && (
                <span className="absolute -top-1 right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[7.5px] font-black px-1.5 py-0.2 rounded-full shadow-xs animate-pulse z-10">
                  {item.badge}
                </span>
              )}

              {/* Compact Round/Circular Icon Background */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? `${item.activeCircle} scale-105`
                    : 'bg-slate-100/90 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>

              {/* Text label underneath */}
              <span
                className={`text-[9.5px] mt-0.5 font-sans leading-none tracking-tight transition-colors ${
                  isActive ? item.activeText : 'font-semibold text-slate-400 group-hover:text-slate-600'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
