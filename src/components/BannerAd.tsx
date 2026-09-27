import React, { useState } from 'react';
import { ExternalLink, Sparkles, Coins, Check, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const BannerAd: React.FC = () => {
  const { addCoins } = useAuth();
  const { settings } = useSettings();
  const [claimed, setClaimed] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [timer, setTimer] = useState(5);

  const handleStartWatch = () => {
    if (claimed || isWatching) return;
    setIsWatching(true);
    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setTimer(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsWatching(false);
        setClaimed(true);
        addCoins(settings.adRewardCoins, `স্পন্সরড অ্যাড দেখে +${settings.adRewardCoins} কয়েন অর্জন! 🎁`, 'ad_reward');
      }
    }, 1000);
  };

  return (
    <div className="mx-4 my-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-500/20 relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                বিজ্ঞাপন
              </span>
              <h5 className="text-xs font-bold text-slate-100">ইনকাম বুস্টার অফার</h5>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              ৫ সেকেন্ড অ্যাড দেখুন ও জিতে নিন <span className="text-amber-300 font-bold">+{settings.adRewardCoins} কয়েন</span>
            </p>
          </div>
        </div>

        <div>
          {claimed ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>গৃহীত</span>
            </div>
          ) : isWatching ? (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{timer}s অপেক্ষা...</span>
            </div>
          ) : (
            <button
              onClick={handleStartWatch}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 text-xs font-extrabold shadow-md active:scale-95 transition"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>কয়েন নিন</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
