import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Sparkles,
  Gift,
  Coins,
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const Refer: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referLink = `${window.location.origin}?ref=${currentUser.referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 SocialCash এ জয়েন করে প্রতিদিন পোস্ট ও লাইক দিয়ে বিকাশ/নগদে টাকা ইনকাম করুন! আমার রেফারেল কোড: ${currentUser.referralCode} অথবা লিংকে ক্লিক করুন: ${referLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(
      `🔥 SocialCash - লাইক ও পোস্ট করে আয় করুন! রেফারেল কোড: ${currentUser.referralCode}\n${referLink}`
    );
    window.open(`https://t.me/share/url?url=${referLink}&text=${text}`, '_blank');
  };

  // Sample invited members
  const invitedList = [
    { name: 'Hasan Mahmud', date: '২ দিন আগে', reward: settings.referRewardCoins },
    { name: 'Rifat Islam', date: '৩ দিন আগে', reward: settings.referRewardCoins },
    { name: 'Sadia Sultana', date: '৫ দিন আগে', reward: settings.referRewardCoins },
  ];

  return (
    <div className="flex-1 p-4 pb-20 space-y-4">
      {/* Hero Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-rose-900/60 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-slate-950 mx-auto shadow-xl shadow-rose-500/20 mb-3">
          <Users className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-white">বন্ধুদের আমন্ত্রণ জানান ও আয় করুন</h2>
        <p className="text-xs text-purple-200 mt-1 max-w-xs mx-auto">
          প্রতিটি সফল রেফারে আপনি পাবেন <strong className="text-amber-300">+{settings.referRewardCoins} কয়েন</strong> ফ্রি বোনাস!
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-purple-500/20">
          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-200/70 block">মোট আমন্ত্রিত</span>
            <span className="text-lg font-black text-white">{currentUser.referralCount} জন</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-2xl border border-purple-500/20">
            <span className="text-[10px] text-purple-200/70 block">রেফারেল থেকে আয়</span>
            <span className="text-lg font-black text-amber-300">
              {(currentUser.referralCount * settings.referRewardCoins).toLocaleString()} 🪙
            </span>
          </div>
        </div>
      </div>

      {/* Referral Code Box */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <label className="text-xs font-bold text-slate-300 block">
          আপনার রেফারেল কোড (Referral Code)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center tracking-widest font-black text-rose-400 text-lg select-all">
            {currentUser.referralCode}
          </div>
          <button
            onClick={copyCode}
            className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>
        </div>

        {/* Referral Link Box */}
        <div className="pt-2">
          <label className="text-xs font-bold text-slate-300 block mb-1">
            সরাসরি রেফারেল লিংক
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referLink}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 truncate"
            />
            <button
              onClick={copyLink}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              title="লিংক কপি করুন"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={shareWhatsApp}
            className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে শেয়ার</span>
          </button>
          <button
            onClick={shareTelegram}
            className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
          >
            <Send className="w-4 h-4" />
            <span>টেলিগ্রামে শেয়ার</span>
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-200 flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-rose-400" />
          <span>রেফারেল কীভাবে কাজ করে?</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              ১
            </span>
            <div>
              <p className="font-bold text-slate-200">লিংক বা কোড শেয়ার করুন</p>
              <p className="text-[11px] text-slate-400">আপনার বন্ধুকে SocialCash এ আমন্ত্রণ জানান।</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              ২
            </span>
            <div>
              <p className="font-bold text-slate-200">বন্ধু অ্যাকাউন্ট খুললে</p>
              <p className="text-[11px] text-slate-400">
                বন্ধু সাইন-আপ করার সাথে সাথে আপনি পাবেন {settings.referRewardCoins} কয়েন।
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0 text-xs">
              ৩
            </span>
            <div>
              <p className="font-bold text-slate-200">আনলিমিটেড ক্যাশআউট</p>
              <p className="text-[11px] text-slate-400">যেকোনো সময় কয়েনকে টাকায় রূপান্তর করে বিকাশ ও নগদে নিন।</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invited List */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-3">সাম্প্রতিক আমন্ত্রিত বন্ধুরা</h4>
        <div className="space-y-2">
          {invitedList.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <p className="text-xs font-bold text-slate-200">{item.name}</p>
                <span className="text-[10px] text-slate-500">{item.date}</span>
              </div>
              <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> +{item.reward}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
