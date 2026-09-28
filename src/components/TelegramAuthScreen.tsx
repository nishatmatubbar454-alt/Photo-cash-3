import React, { useState } from 'react';
import { Send, ShieldCheck, AlertCircle, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const TelegramAuthScreen: React.FC = () => {
  const { authStatus, authMessage, loginWithTelegramData } = useAuth();
  const [customTelegramId, setCustomTelegramId] = useState('5569819998');
  const [customName, setCustomName] = useState('NiShAt Buyr 🔕');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleManualDevConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTelegramId.trim()) {
      setLocalError('অনুগ্রহ করে টেলিগ্রাম চ্যাট আইডি (Chat ID) দিন');
      return;
    }
    setLocalError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/telegram-dev-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: customTelegramId.trim(),
          name: customName.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        await loginWithTelegramData(data.user);
      } else {
        await loginWithTelegramData({
          telegramId: customTelegramId.trim(),
          chatId: customTelegramId.trim(),
          firstName: customName.trim() || 'Telegram User',
          name: customName.trim() || 'Telegram User',
          username: `user_${customTelegramId.trim()}`,
        });
      }
    } catch (err: any) {
      setLocalError(err.message || 'লগইন ব্যর্থ হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If currently verifying or connecting via Telegram WebApp SDK
  if (authStatus === 'connecting' || authStatus === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 text-center shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#0088cc]/20 border border-[#0088cc]/40 flex items-center justify-center mx-auto text-[#0088cc] animate-pulse">
            <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
          </div>

          <div>
            <h3 className="text-base font-black text-white">
              {authStatus === 'connecting' ? 'Connecting Telegram...' : 'Verifying Account...'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              টেলিগ্রাম পরিচয় যাচাই করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 text-[#ff5938] text-xs font-bold">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{authMessage || 'Verifying credentials...'}</span>
          </div>
        </div>
      </div>
    );
  }

  // If login successful transition
  if (authStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-emerald-500/30 text-center shadow-2xl space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-black text-white">Login Successful</h3>
            <p className="text-xs text-emerald-300 mt-1 font-sans">
              স্বাগতম! আপনার ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans selection:bg-[#ff5938] selection:text-white">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff416c] to-[#ff5938] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Photo Cash 📸💸
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            টেলিগ্রাম অ্যাকাউন্ট দিয়ে নিরাপদে স্বয়ংক্রিয় লগইন ও সাইন-আপ করুন।
          </p>
        </div>

        {/* Error notification if any */}
        {(authStatus === 'error' || localError) && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">লগইন ত্রুটি:</span>
              <span>{localError || authMessage || 'টেলিগ্রাম প্রমাণীকরণ ব্যর্থ হয়েছে।'}</span>
            </div>
          </div>
        )}

        {/* Security & Verification Card */}
        <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-sky-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#0088cc]" />
            <span>অটোমেটিক প্রোফাইল সিঙ্ক</span>
          </div>
          <p className="text-[11px] text-sky-800 leading-relaxed">
            একাউন্ট তৈরি বা লগইন করার সময় টেলিগ্রামের <b>প্রোফাইল ছবি</b>, <b>নাম</b> এবং <b>Chat ID</b> সরাসরি ওয়েবসাইটে সেট হয়ে যাবে।
          </p>
        </div>

        {/* Telegram Direct Connect Form */}
        <form onSubmit={handleManualDevConnect} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              টেলিগ্রাম চ্যাট আইডি (Telegram Chat ID)
            </label>
            <input
              type="text"
              value={customTelegramId}
              onChange={(e) => setCustomTelegramId(e.target.value)}
              placeholder="e.g. 5569819998"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0088cc] focus:ring-1 focus:ring-[#0088cc]"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              * ইউনিক টেলিগ্রাম আইডি দিয়ে পূর্বের ব্যালেন্স ও পোস্ট আনলক হবে।
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              নাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="আপনার টেলিগ্রাম নাম"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0088cc]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>লগইন হচ্ছে...</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>টেলিগ্রাম দিয়ে লগইন করুন</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-sans">
          বট ইউজারনেম: <span className="font-bold text-[#0088cc]">@PhotoCash12_bot</span>
        </p>
      </div>
    </div>
  );
};
