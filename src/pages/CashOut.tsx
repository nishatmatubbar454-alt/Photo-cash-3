import React, { useState } from 'react';
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Send,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { PaymentMethod, AccountType } from '../types';
import { formatBDT, formatCoins } from '../utils/format';

export const CashOut: React.FC = () => {
  const { currentUser, requestCashout, setActiveTab } = useAuth();
  const { settings } = useSettings();

  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [accountType, setAccountType] = useState<AccountType>('personal');
  const [accountNumber, setAccountNumber] = useState(currentUser.phone || '');
  const [amountBDT, setAmountBDT] = useState<number>(settings.minCashOutBDT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const methodsList: { id: PaymentMethod; name: string; subtitle: string; color: string }[] = [
    { id: 'bkash', name: 'বিকাশ', subtitle: 'bKash Personal / Agent', color: 'from-[#e2136e] to-[#ff2b85]' },
    { id: 'nagad', name: 'নগদ', subtitle: 'Nagad Personal / Agent', color: 'from-[#f7941d] to-[#ffaa40]' },
    { id: 'rocket', name: 'রকেট', subtitle: 'Rocket DBBL', color: 'from-[#8c3494] to-[#af4bb8]' },
    { id: 'recharge', name: 'মোবাইল রিচার্জ', subtitle: 'GP, Robi, BL, Airtel', color: 'from-emerald-500 to-teal-600' },
  ];

  const presets = [50, 100, 200, 500, 1000];

  const ratePerCoin = settings.coinRate / 1000;
  const coinsNeeded = Math.round(amountBDT / ratePerCoin);
  const hasEnoughBalance = currentUser.balanceBDT >= amountBDT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    const cleanNumber = accountNumber.trim();
    if (!/^01[3-9]\d{8}$/.test(cleanNumber)) {
      setErrorMsg('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)');
      return;
    }

    if (amountBDT < settings.minCashOutBDT) {
      setErrorMsg(`সর্বনিম্ন উত্তোলনের পরিমাণ ৳${settings.minCashOutBDT}`);
      return;
    }

    if (!hasEnoughBalance) {
      setErrorMsg('আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }

    setIsSubmitting(true);
    const result = await requestCashout(method, cleanNumber, accountType, amountBDT);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="flex-1 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActiveTab('wallet')}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-slate-100">টাকা উত্তোলন (Cash Out)</h2>
          <p className="text-xs text-slate-400">বিকাশ, নগদ, রকেট বা রিচার্জে টাকা নিন</p>
        </div>
      </div>

      {/* Balance Summary Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 mb-5 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400">উত্তোলনযোগ্য ব্যালেন্স:</span>
          <p className="text-xl font-black text-emerald-400">{formatBDT(currentUser.balanceBDT)}</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400">কয়েন ব্যালেন্স:</span>
          <p className="text-sm font-bold text-amber-300 flex items-center justify-end gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            {formatCoins(currentUser.coins)}
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg ? (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/50 text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">অনুরোধ গৃহীত হয়েছে!</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {successMsg}
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl text-xs space-y-1 text-slate-300 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-500">পদ্ধতি:</span>
              <span className="font-bold text-rose-400">{method.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">অ্যাকাউন্ট:</span>
              <span className="font-bold">{accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">পরিমাণ:</span>
              <span className="font-bold text-emerald-400">৳{amountBDT.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('payments')}
            className="w-full py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition"
          >
            পেমেন্ট হিস্ট্রি দেখুন
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              ১. পেমেন্ট মেথড নির্বাচন করুন
            </label>
            <div className="grid grid-cols-2 gap-2">
              {methodsList.map((m) => {
                const selected = method === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition relative flex flex-col justify-between ${
                      selected
                        ? 'bg-slate-900 border-rose-500 ring-2 ring-rose-500/30'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-sm text-slate-100">{m.name}</span>
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${m.color}`}></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{m.subtitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Account Type (Personal / Agent) */}
          {method !== 'recharge' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                অ্যাকাউন্ট টাইপ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('personal')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    accountType === 'personal'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Personal (ব্যক্তিগত)
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('agent')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    accountType === 'agent'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Agent (এজেন্ট)
                </button>
              </div>
            </div>
          )}

          {/* 3. Account Number */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              ২. {method.toUpperCase()} নম্বর
            </label>
            <input
              type="tel"
              placeholder="01XXXXXXXXX"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 tracking-wider"
              required
            />
          </div>

          {/* 4. Amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300">
                ৩. উত্তোলনের পরিমাণ (টাকা)
              </label>
              <span className="text-[11px] text-slate-400">
                মিনিমাম: ৳{settings.minCashOutBDT}
              </span>
            </div>

            <div className="relative mb-2">
              <span className="absolute left-4 top-3 text-sm font-bold text-slate-500">৳</span>
              <input
                type="number"
                min={settings.minCashOutBDT}
                value={amountBDT}
                onChange={(e) => setAmountBDT(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-8 pr-4 py-3 text-sm font-bold text-emerald-400 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            {/* Presets */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmountBDT(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex-shrink-0 ${
                    amountBDT === p
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ৳{p}
                </button>
              ))}
            </div>
          </div>

          {/* Calculation notice */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">প্রয়োজনীয় কয়েন:</span>
              <span className="font-bold text-amber-300">{coinsNeeded.toLocaleString()} Coins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">সার্ভিস চার্জ:</span>
              <span className="font-bold text-emerald-400">০% (ফ্রি)</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
              <span className="text-slate-200">আপনি পাবেন:</span>
              <span className="text-emerald-400">৳{amountBDT.toFixed(2)} BDT</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
            <p>
              সাধারণত রিকোয়েস্ট পাঠানোর ৫ মিনিট থেকে ২ ঘণ্টার মধ্যে পেমেন্ট সম্পন্ন করা হয়। কোনো সমস্যা হলে আমাদের টেলিগ্রাম হেল্পডেস্কে যোগাযোগ করুন।
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !hasEnoughBalance}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-slate-950 font-black text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>প্রসেসিং হচ্ছে...</span>
            ) : (
              <>
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>ক্যাশআউট রিকোয়েস্ট পাঠান</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
