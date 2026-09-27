import React, { useState } from 'react';
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Coins,
  DollarSign,
  Users,
  Settings,
  AlertTriangle,
  Send,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { formatBDT, timeAgo } from '../utils/format';

export const Admin: React.FC = () => {
  const { transactions, approveCashout, rejectCashout, setActiveTab } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [activeAdminTab, setActiveAdminTab] = useState<'cashouts' | 'settings'>('cashouts');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states for settings
  const [coinRate, setCoinRate] = useState(settings.coinRate);
  const [minCashOutBDT, setMinCashOutBDT] = useState(settings.minCashOutBDT);
  const [postRewardCoins, setPostRewardCoins] = useState(settings.postRewardCoins);
  const [likeRewardCoins, setLikeRewardCoins] = useState(settings.likeRewardCoins);
  const [referRewardCoins, setReferRewardCoins] = useState(settings.referRewardCoins);
  const [dailyBonusCoins, setDailyBonusCoins] = useState(settings.dailyBonusCoins);
  const [noticeText, setNoticeText] = useState(settings.noticeText);
  const [botToken, setBotToken] = useState(settings.telegramBotToken || '');
  const [adminChatId, setAdminChatId] = useState(settings.telegramAdminChatId || '');

  const pendingCashouts = transactions.filter(
    (t) => t.type === 'cashout' && t.status === 'pending'
  );

  const approvedCashouts = transactions.filter(
    (t) => t.type === 'cashout' && t.status === 'approved'
  );

  const totalPaidBDT = approvedCashouts.reduce((sum, t) => sum + t.amountBDT, 0);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      coinRate: Number(coinRate),
      minCashOutBDT: Number(minCashOutBDT),
      postRewardCoins: Number(postRewardCoins),
      likeRewardCoins: Number(likeRewardCoins),
      referRewardCoins: Number(referRewardCoins),
      dailyBonusCoins: Number(dailyBonusCoins),
      noticeText,
      telegramBotToken: botToken,
      telegramAdminChatId: adminChatId,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="flex-1 p-4 pb-20 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('profile')}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-1.5">
              <Shield className="w-5 h-5 text-purple-400" />
              <span>এডমিন প্যানেল</span>
            </h2>
            <p className="text-xs text-purple-300/80">ক্যাশআউট রিকোয়েস্ট ও রিওয়ার্ড কন্ট্রোল</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('home')}
          className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
        >
          অ্যাপে ফিরুন
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30">
          <span className="text-[10px] text-purple-300 block">অপেক্ষমান ক্যাশআউট</span>
          <span className="text-lg font-black text-amber-300">{pendingCashouts.length} টি</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">মোট পরিশোধ</span>
          <span className="text-lg font-black text-emerald-400">৳{totalPaidBDT.toFixed(0)}</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">কয়েন রেট</span>
          <span className="text-lg font-black text-rose-400">৳{settings.coinRate}/k</span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveAdminTab('cashouts')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'cashouts'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>পেন্ডিং ক্যাশআউট</span>
          {pendingCashouts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {pendingCashouts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeAdminTab === 'settings'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>অ্যাপ সেটিংস</span>
        </button>
      </div>

      {/* Tab 1: Pending Cashouts */}
      {activeAdminTab === 'cashouts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-300">
              অনুমোদনের জন্য অপেক্ষমান ({pendingCashouts.length})
            </h3>
            <span className="text-[10px] text-slate-500">বিকাশ/নগদে টাকা পাঠিয়ে অ্যাপ্রুভ করুন</span>
          </div>

          {pendingCashouts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              কোনো অপেক্ষমান ক্যাশআউট রিকোয়েস্ট নেই!
            </div>
          ) : (
            pendingCashouts.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{tx.userName}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase">
                        {tx.method} ({tx.accountType || 'Personal'})
                      </span>
                    </h4>
                    <p className="text-xs font-mono font-bold text-amber-300 mt-1 select-all">
                      নম্বর: {tx.accountNumber}
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {timeAgo(tx.createdAt)} • {tx.trxId}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block">
                      ৳{tx.amountBDT.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {tx.coins.toLocaleString()} কয়েন
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => approveCashout(tx.id)}
                    className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>অনুমোদন (Approve)</span>
                  </button>
                  <button
                    onClick={() => rejectCashout(tx.id, 'নম্বর সঠিক নয় বা ইনভ্যালিড')}
                    className="py-2 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>বাতিল (Reject)</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Settings Configuration */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs text-center font-bold">
              সেটিংস সফলভাবে সংরক্ষিত হয়েছে! ✅
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-300">কয়েন রেট ও মিনিমাম ক্যাশআউট</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি ১০০০ কয়েনের দাম (BDT)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={coinRate}
                  onChange={(e) => setCoinRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  সর্বনিম্ন ক্যাশআউট (BDT)
                </label>
                <input
                  type="number"
                  value={minCashOutBDT}
                  onChange={(e) => setMinCashOutBDT(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-amber-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-300">কয়েন রিওয়ার্ড সেটিংস</h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি পোস্ট রিওয়ার্ড (Coins)
                </label>
                <input
                  type="number"
                  value={postRewardCoins}
                  onChange={(e) => setPostRewardCoins(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি লাইক রিওয়ার্ড (Coins)
                </label>
                <input
                  type="number"
                  value={likeRewardCoins}
                  onChange={(e) => setLikeRewardCoins(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  প্রতি রেফার বোনাস (Coins)
                </label>
                <input
                  type="number"
                  value={referRewardCoins}
                  onChange={(e) => setReferRewardCoins(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  দৈনিক বোনাস (Coins)
                </label>
                <input
                  type="number"
                  value={dailyBonusCoins}
                  onChange={(e) => setDailyBonusCoins(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-purple-300">টেলিগ্রাম বট ও নোটিশ কন্ট্রোল</h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                হোম নোটিশ বার্তা (Notice Bar Text)
              </label>
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Telegram Bot Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="bot123456:ABC-DEF..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Admin Chat ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="@mychannel বা -1001234"
                  value={adminChatId}
                  onChange={(e) => setAdminChatId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Save className="w-4 h-4" />
            <span>সেটিংস সেভ করুন</span>
          </button>
        </form>
      )}
    </div>
  );
};
