import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { Home } from '../pages/Home';
import { Refer } from '../pages/Refer';
import { Create } from '../pages/Create';
import { Wallet } from '../pages/Wallet';
import { Profile } from '../pages/Profile';
import { CashOut } from '../pages/CashOut';
import { Payments } from '../pages/Payments';
import { Admin } from '../pages/Admin';
import { UserProfile } from '../pages/UserProfile';
import { useAuth } from '../contexts/AuthContext';
import { Coins, Sparkles } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { activeTab, rewardNotification } = useAuth();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'refer':
        return <Refer />;
      case 'create':
        return <Create />;
      case 'wallet':
        return <Wallet />;
      case 'profile':
        return <Profile />;
      case 'cashout':
        return <CashOut />;
      case 'payments':
        return <Payments />;
      case 'admin':
        return <Admin />;
      case 'user-profile':
        return <UserProfile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-rose-500 selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 border-x border-slate-800/80 shadow-2xl flex flex-col relative">
        {/* Floating Coin Toast Alert */}
        {rewardNotification && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
            <div className="px-4 py-2 rounded-full bg-slate-900/95 border border-amber-500/50 shadow-2xl shadow-amber-500/20 flex items-center gap-2 backdrop-blur-md">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-amber-300">
                +{rewardNotification.coins} Coins!
              </span>
              <span className="text-[11px] text-slate-300">
                {rewardNotification.message}
              </span>
            </div>
          </div>
        )}

        {/* Top Header */}
        <TopBar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {renderActiveView()}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
