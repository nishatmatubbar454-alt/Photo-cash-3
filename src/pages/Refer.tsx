import React, { useState } from 'react';
import { Copy, Check, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const Refer: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);
  const [activeTabSub, setActiveTabSub] = useState<'overview' | 'level1'>('overview');

  const botLink = currentUser.botReferLink;

  const handleCopy = () => {
    navigator.clipboard.writeText(botLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(
      `🎉 PhotoCash এ জয়েন করে প্রতিদিন ফটো পোস্ট ও লাইক দিয়ে USDT ইনকাম করুন! $${(settings?.referBonusUSDT ?? 0.50).toFixed(2)} বোনাস পেতে লিংকে ক্লিক করুন:`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(botLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="flex-1 bg-[#f8fafc] p-3.5 pb-20 space-y-2.5 font-sans">
      {/* 3D Invite Banner Card (Exact Screenshot 2) */}
      <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-xs overflow-hidden flex flex-col items-center">
        <img
          src="/src/assets/images/invite_friends_banner_1790528531778.jpg"
          alt="Invite Your Friend"
          className="w-full h-auto max-h-52 object-contain rounded-2xl"
        />
      </div>

      {/* 4 Stats Cards in 1 Row (Exact Screenshot 2) */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-white rounded-2xl p-2 text-center border border-slate-100 shadow-xs">
          <span className="text-[9px] font-extrabold text-[#f97316] tracking-tight block">
            L1 TOTAL
          </span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">
            {currentUser.totalRefer}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-2 text-center border border-slate-100 shadow-xs">
          <span className="text-[9px] font-extrabold text-[#16a34a] tracking-tight block">
            L1 ACTIVE
          </span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">
            {currentUser.activeRefer}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-2 text-center border border-slate-100 shadow-xs">
          <span className="text-[9px] font-extrabold text-[#2563eb] tracking-tight block">
            BONUS
          </span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">
            ${(currentUser?.referBonusUSDT ?? settings?.referBonusUSDT ?? 0.50).toFixed(2)}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-2 text-center border border-slate-100 shadow-xs">
          <span className="text-[9px] font-extrabold text-[#9333ea] tracking-tight block">
            EARNED
          </span>
          <span className="text-sm font-black text-slate-900 mt-0.5 block">
            ${((currentUser?.totalRefer ?? 0) * (currentUser?.referBonusUSDT ?? settings?.referBonusUSDT ?? 0.50)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Alert Notice Pill */}
      <div className="bg-white border border-rose-100/90 rounded-2xl p-2.5 text-center shadow-xs">
        <p className="text-[11px] font-semibold text-rose-500 leading-snug">
          {settings?.noticeText || `🎉 বন্ধু জয়েন করলেই $${(settings?.referBonusUSDT ?? 0.50).toFixed(2)} USDT বোনাস 🤖 এখনই লিংক শেয়ার করুন 👀`}
        </p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2.5">
        {/* Link Input Row */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            readOnly
            value={botLink}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-slate-700 font-mono select-all focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="w-10 h-10 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl flex items-center justify-center transition active:scale-95 flex-shrink-0 shadow-xs cursor-pointer"
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Copy className="w-4 h-4 stroke-[2.2]" />}
          </button>
        </div>

        {/* Big Share on Telegram button */}
        <button
          onClick={handleShareTelegram}
          className="w-full py-3.5 rounded-2xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
          <span>Share on Telegram</span>
        </button>
      </div>

      {/* Overview & Level Tree Card (Exact Screenshot 2) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-3">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-100 pb-1.5 text-[11px] font-black">
          <button
            onClick={() => setActiveTabSub('overview')}
            className={`pb-1.5 transition ${
              activeTabSub === 'overview'
                ? 'text-[#f97316] border-b-2 border-[#f97316]'
                : 'text-slate-400'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTabSub('level1')}
            className={`pb-1.5 transition ${
              activeTabSub === 'level1'
                ? 'text-[#f97316] border-b-2 border-[#f97316]'
                : 'text-slate-400'
            }`}
          >
            LEVEL 1 ({currentUser.totalRefer})
          </button>
        </div>

        {/* Tree Circle */}
        <div className="py-4 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#f97316] text-white flex flex-col items-center justify-center font-black text-xs shadow-md">
            <span>YOU</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            লেভেল ১ সদস্য সংখ্যা: {currentUser.totalRefer} জন
          </span>
        </div>
      </div>
    </div>
  );
};
