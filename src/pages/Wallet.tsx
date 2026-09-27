import React, { useState } from 'react';
import {
  Coins,
  ArrowUpRight,
  Gift,
  Users,
  PlaySquare,
  History,
  CheckCircle,
  Clock,
  XCircle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatBDT, formatCoins, timeAgo } from '../utils/format';

export const Wallet: React.FC = () => {
  const { currentUser, transactions, setActiveTab, claimDailyBonus, addCoins } = useAuth();
  const { settings } = useSettings();
  const [bonusStatus, setBonusStatus] = useState<string | null>(null);

  const today = new Date().toDateString();
  const hasClaimedToday = currentUser.lastDailyClaim === today;

  const handleClaimDaily = () => {
    const res = claimDailyBonus();
    setBonusStatus(res.message);
    setTimeout(() => setBonusStatus(null), 3000);
  };

  const handleWatchAd = () => {
    addCoins(settings.adRewardCoins, `ভিডিও বিজ্ঞাপন দেখে +${settings.adRewardCoins} কয়েন অর্জন! 🎬`, 'ad_reward');
    setBonusStatus(`+${settings.adRewardCoins} কয়েন আপনার অ্যাকাউন্টে যোগ করা হয়েছে!`);
    setTimeout(() => setBonusStatus(null), 3000);
  };

  // Recent 6 transactions
  const recentTransactions = transactions.slice(0, 6);

  return (
    <div className="flex-1 p-4 pb-20 space-y-4">
      {/* Wallet Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950/40 to-amber-950/50 border border-rose-500/30 p-5 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              বর্তমান ব্যালেন্স
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {formatBDT(currentUser.balanceBDT)}
              </h1>
              <span className="text-xs font-bold text-emerald-400">BDT</span>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-300">
              {formatCoins(currentUser.coins)} Coins
            </span>
          </div>
        </div>

        {/* Rate info */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 mb-5">
          <span>এক্সচেঞ্জ রেট:</span>
          <span className="font-bold text-amber-400">১০০০ কয়েন = ৳{settings.coinRate.toFixed(2)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('cashout')}
            className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 transition"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            <span>টাকা উত্তোলন (Cash Out)</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className="py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>পেমেন্ট হিস্ট্রি</span>
          </button>
        </div>
      </div>

      {bonusStatus && (
        <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center font-bold animate-in fade-in">
          {bonusStatus}
        </div>
      )}

      {/* Ways to Earn section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>কয়েন আয়ের উপায় (Ways to Earn)</span>
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Daily bonus */}
          <div
            onClick={hasClaimedToday ? undefined : handleClaimDaily}
            className={`p-3.5 rounded-2xl border transition ${
              hasClaimedToday
                ? 'bg-slate-900/60 border-slate-800 opacity-70 cursor-default'
                : 'bg-slate-900 border-purple-500/30 hover:border-purple-500/60 cursor-pointer active:scale-95'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
              <Gift className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">দৈনিক বোনাস</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {hasClaimedToday ? 'আজকেরটা নিয়েছেন' : `+${settings.dailyBonusCoins} কয়েন ফ্রি`}
            </p>
          </div>

          {/* Watch Ad */}
          <div
            onClick={handleWatchAd}
            className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <PlaySquare className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">অ্যাড দেখুন</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              প্রতিটি অ্যাডে +{settings.adRewardCoins} কয়েন
            </p>
          </div>

          {/* Refer friends */}
          <div
            onClick={() => setActiveTab('refer')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-sky-500/30 hover:border-sky-500/60 cursor-pointer active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">বন্ধুদের রেফার</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              প্রতি রেফারে +{settings.referRewardCoins} কয়েন
            </p>
          </div>

          {/* Create Post */}
          <div
            onClick={() => setActiveTab('create')}
            className="p-3.5 rounded-2xl bg-slate-900 border border-rose-500/30 hover:border-rose-500/60 cursor-pointer active:scale-95 transition"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-200">পোস্ট তৈরি</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              প্রতি পোস্টে +{settings.postRewardCoins} কয়েন
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" />
            <span>সাম্প্রতিক লেনদেন (Transactions)</span>
          </h3>
          <button
            onClick={() => setActiveTab('payments')}
            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center"
          >
            <span>সব দেখুন</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
              এখনও কোনো লেনদেন সম্পন্ন হয়নি।
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isCashout = tx.type === 'cashout';

              return (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isCashout
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isCashout ? 'উত্তোলন' : 'আয়'}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-200">
                        {isCashout
                          ? `${tx.method?.toUpperCase()} ক্যাশআউট`
                          : tx.note || 'রিওয়ার্ড বোনাস'}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        {timeAgo(tx.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-extrabold ${
                        isCashout ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isCashout ? '-' : '+'}৳{tx.amountBDT.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {tx.status === 'approved' && (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" /> সফল
                        </span>
                      )}
                      {tx.status === 'pending' && (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> অপেক্ষমান
                        </span>
                      )}
                      {tx.status === 'rejected' && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                          <XCircle className="w-3 h-3" /> বাতিল
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
