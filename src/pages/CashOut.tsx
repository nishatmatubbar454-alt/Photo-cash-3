import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export const CashOut: React.FC = () => {
  const { currentUser, requestCashout, setActiveTab } = useAuth();
  const { settings } = useSettings();

  const amounts = [5, 10, 15, 30, 60, 100];
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasMinBalance = currentUser.balanceUSDT >= (settings.minCashOutUSDT || 5.00);
  const hasMinRefers = currentUser.totalRefer >= (settings.requiredRefersForWithdraw || 18);
  const hasValidAddress = address.trim().length >= 8;

  const handleCashout = () => {
    setIsSubmitting(true);
    const res = requestCashout(selectedAmount, address);
    setIsSubmitting(false);
    setToastMessage(res.message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex-1 bg-[#f8fafc] p-3.5 pb-20 space-y-3 font-sans min-h-screen">
      {/* Top Bar (Exact Screenshot 5) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('wallet')}
            className="p-1 text-slate-800 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="text-sm font-black text-slate-900">Cash Out</h2>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-full px-2.5 py-0.5 text-[11px] font-black text-slate-800 shadow-xs">
          Balance ${(currentUser?.balanceUSDT ?? 0).toFixed(2)}
        </div>
      </div>

      {toastMessage && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-center font-bold animate-in fade-in">
          {toastMessage}
        </div>
      )}

      {/* Select Amount Card (Exact Screenshot 5) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2">
        <label className="text-[11px] font-black text-slate-700 block">Select Amount</label>

        <div className="grid grid-cols-3 gap-2">
          {amounts.map((amt) => {
            const isSelected = selectedAmount === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => setSelectedAmount(amt)}
                className={`py-2.5 rounded-xl text-xs font-black transition ${
                  isSelected
                    ? 'bg-[#fff7ed] border-2 border-[#ff7d45] text-[#ea580c] shadow-xs'
                    : 'bg-slate-50/90 hover:bg-slate-100 text-slate-800 border border-slate-100'
                }`}
              >
                $ {amt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Method Card (Exact Screenshot 5) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2">
        <label className="text-[11px] font-black text-slate-700 block">Payment Method</label>

        <div className="grid grid-cols-3 gap-2">
          {/* Soon 1 */}
          <div className="py-4 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-400">
            Soon
          </div>

          {/* Soon 2 */}
          <div className="py-4 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-400">
            Soon
          </div>

          {/* Binance (Active selected) */}
          <div className="py-2 px-1.5 rounded-xl bg-[#fff7ed] border-2 border-[#ff7d45] flex flex-col items-center justify-center relative shadow-xs cursor-pointer">
            {/* Checked badge */}
            <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ff7d45] text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>

            {/* Binance Icon */}
            <div className="w-6 h-6 rounded-full bg-[#f3ba2f] text-slate-900 flex items-center justify-center font-black text-xs shadow-xs mb-0.5">
              <span>❖</span>
            </div>
            <span className="text-[11px] font-black text-[#ea580c]">Binance</span>
          </div>
        </div>
      </div>

      {/* Account Number Card (Exact Screenshot 5) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-1.5">
        <label className="text-[11px] font-black text-slate-700 block">Account Number</label>
        <input
          type="text"
          placeholder="USDT BEP20 address / Binance ID"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#ff7d45]"
        />
        <p className="text-[9px] text-slate-400 leading-tight">
          শুধুমাত্র USDT (BEP20) নেটওয়ার্ক সাপোর্ট করা হয়। ভুল অ্যাড্রেসের জন্য কর্তৃপক্ষ দায়ী নয়।
        </p>
      </div>

      {/* Requirement Checklist Card (Exact Screenshot 5) */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2 text-[11px]">
        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinBalance ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={hasMinBalance ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
            ব্যালেন্স ন্যূনতম ${(settings?.minCashOutUSDT ?? 5.0).toFixed(2)} USDT (এখন ${(currentUser?.balanceUSDT ?? 0).toFixed(2)})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-3.5 h-3.5 ${hasMinRefers ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={hasMinRefers ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
            {settings?.requiredRefersForWithdraw ?? 18} টি রেফার বাধ্যতামূলক (এখন {currentUser?.totalRefer ?? 0} টি)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 className={`w-3.5 h-3.5 ${hasValidAddress ? 'text-emerald-500' : 'text-slate-300'}`} />
          <span className={hasValidAddress ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
            সঠিক BEP20 অ্যাড্রেস দিন
          </span>
        </div>
      </div>

      {/* Warning Notice Banner (Exact Screenshot 5) */}
      <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-2xl p-2.5 flex items-start gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-rose-700 leading-tight font-bold">
          ⚠️ 18 টা রেফার ছাড়া withdraw হবে না। আগে 18 টি রেফার সম্পূর্ণ করুন।
        </p>
      </div>

      {/* Cash out Button (Exact Screenshot 5) */}
      <div className="space-y-1.5">
        <button
          onClick={handleCashout}
          disabled={!hasMinRefers || isSubmitting}
          className={`w-full py-3 rounded-full font-black text-xs flex items-center justify-center gap-1 transition shadow-sm ${
            hasMinRefers
              ? 'bg-gradient-to-r from-[#ff4b3e] to-[#ff7438] text-white active:scale-95'
              : 'bg-[#fecdd3]/70 text-white cursor-not-allowed'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          <span>Cash out ${selectedAmount}.00</span>
        </button>

        <p className="text-[9px] text-center text-slate-400">
          By cashing out, you agree to PhotoCash's Cash Out Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};
