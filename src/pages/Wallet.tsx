import React from 'react';
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  History,
  TrendingUp,
  Users,
  Headphones,
  MessageCircle,
  Clock,
  Send,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const Wallet: React.FC = () => {
  const { currentUser, setActiveTab } = useAuth();
  const { settings } = useSettings();

  return (
    <div className="flex-1 bg-[#f8fafc] p-3.5 pb-20 space-y-3 font-sans">
      {/* Top Header (Exact Screenshot 4) */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('home')}
          className="w-8 h-8 rounded-full bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-800"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        <h2 className="text-base font-black text-slate-900">Wallet</h2>

        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-xs cursor-pointer">
          <span>USDT</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Balance Hero Card (Exact Screenshot 4) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs text-center space-y-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400">Total Earnings</span>
          <h1 className="text-3xl font-black text-slate-900 mt-0.5 tracking-tight">
            ${(currentUser?.balanceUSDT ?? 0).toFixed(3)}
          </h1>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Lifetime ${(currentUser?.lifetimeEarningsUSDT ?? 0).toFixed(3)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setActiveTab('cashout')}
            className="py-2.5 px-3 rounded-full bg-gradient-to-r from-[#ff4b3e] to-[#ff7438] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <CreditCard className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Cash Out</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className="py-2.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <History className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Payments</span>
          </button>
        </div>
      </div>

      {/* 2 Stats Cards Row (Exact Screenshot 4) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Today's earnings */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Today's earnings</span>
            <div className="w-5 h-5 rounded-md bg-orange-50 text-orange-500 flex items-center justify-center">
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-900 pt-0.5">
            ${(currentUser?.todayEarningsUSDT ?? 0).toFixed(3)}
          </h3>
          <span className="text-[10px] text-slate-400 block">
            {currentUser?.todayEarningPostsCount ?? 0} earning posts
          </span>
        </div>

        {/* Total Refar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Total Refar</span>
            <div className="w-5 h-5 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center">
              <Users className="w-3 h-3" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <Users className="w-4 h-4 text-sky-500 fill-sky-500" />
            <h3 className="text-lg font-black text-slate-900">
              {currentUser?.totalRefer ?? 0}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {Math.max(0, (currentUser?.requiredRefer ?? 18) - (currentUser?.totalRefer ?? 0))} more needed
          </span>
        </div>
      </div>

      {/* Requirement Notice Box */}
      <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-3 space-y-1">
        <h4 className="text-[11px] font-black text-[#e11d48] flex items-center gap-1">
          <span>⚠️ {settings?.requiredRefersForWithdraw ?? 18} রেফার ছাড়া withdraw হবে না</span>
        </h4>
        <p className="text-[10px] text-slate-700 leading-relaxed font-medium">
          Withdraw করতে হলে অবশ্যই <strong>${(settings?.minCashOutUSDT ?? 5.0).toFixed(2)} USDT</strong> ব্যালেন্স এবং <strong>{settings?.requiredRefersForWithdraw ?? 18} টি রেফার</strong> থাকতে হবে। দুইটি শর্ত পূরণ না হলে cash out রিকুয়েস্ট গ্রহণ করা হবে না।
        </p>
      </div>

      {/* Support Section (Exact Screenshot 4) */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-slate-900 px-1">Support</h3>

        <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff4b3e] to-[#ff7438] text-white flex items-center justify-center shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>Chat with support</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-600 font-extrabold flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    Online
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Withdrawals • balance • account
                </p>
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
              <MessageCircle className="w-3 h-3" />
              <span>Live agent</span>
            </button>
            <button className="py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1.5 transition">
              <Clock className="w-3 h-3" />
              <span>Quick replies</span>
            </button>
          </div>

          {/* Telegram Support Button */}
          <a
            href={currentUser.botReferLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full bg-gradient-to-r from-[#ff4b3e] to-[#ff7438] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Telegram Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};
