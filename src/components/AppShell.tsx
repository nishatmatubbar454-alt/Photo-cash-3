import React from 'react';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { TelegramAuthScreen } from './TelegramAuthScreen';
import { Home } from '../pages/Home';
import { Refer } from '../pages/Refer';
import { Create } from '../pages/Create';
import { Wallet } from '../pages/Wallet';
import { Profile } from '../pages/Profile';
import { CashOut } from '../pages/CashOut';
import { Payments } from '../pages/Payments';
import { Admin } from '../pages/Admin';
import { useAuth } from '../contexts/AuthContext';

export const AppShell: React.FC = () => {
  const { activeTab, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <TelegramAuthScreen />;
  }

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
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex justify-center selection:bg-[#ff5938] selection:text-white">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md min-h-screen bg-[#f8fafc] border-x border-slate-200/80 shadow-xl flex flex-col relative">
        {/* TopBar only shown on Home */}
        {activeTab === 'home' && <TopBar />}

        {/* Active Page View */}
        <main className="flex-1 flex flex-col">
          {renderActiveView()}
        </main>

        {/* Persistent Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
