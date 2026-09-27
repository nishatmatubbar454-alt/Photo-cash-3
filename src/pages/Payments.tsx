import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  Download,
  Filter,
  Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';
import { formatBDT, timeAgo } from '../utils/format';

export const Payments: React.FC = () => {
  const { transactions, setActiveTab } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'cashout' | 'earnings'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filtered = transactions.filter((t) => {
    if (filterType === 'cashout') return t.type === 'cashout';
    if (filterType === 'earnings') return t.type !== 'cashout';
    return true;
  });

  return (
    <div className="flex-1 p-4 pb-20 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('wallet')}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-extrabold text-slate-100">পেমেন্ট হিস্ট্রি (Transactions)</h2>
          <p className="text-xs text-slate-400">সকল উত্তোলন ও উপার্জনের বিস্তারিত খতিয়ান</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setFilterType('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'all'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          সকল ({transactions.length})
        </button>
        <button
          onClick={() => setFilterType('cashout')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'cashout'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          উত্তোলন ({transactions.filter((t) => t.type === 'cashout').length})
        </button>
        <button
          onClick={() => setFilterType('earnings')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
            filterType === 'earnings'
              ? 'bg-rose-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          আয় ({transactions.filter((t) => t.type !== 'cashout').length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 bg-slate-900 rounded-3xl border border-slate-800">
            <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-400">কোনো লেনদেন রেকর্ড নেই</p>
            <p className="text-xs text-slate-600 mt-1">ক্যাশআউট রিকোয়েস্ট পাঠালে এখানে দেখতে পাবেন।</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isCashout = tx.type === 'cashout';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                      isCashout
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isCashout ? tx.method?.toUpperCase() || 'উত্তোলন' : 'আয়'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">
                      {isCashout
                        ? `${tx.method?.toUpperCase()} ক্যাশআউট (${tx.accountType || 'Personal'})`
                        : tx.note || 'রিওয়ার্ড বোনাস'}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{timeAgo(tx.createdAt)}</span>
                      {tx.accountNumber && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          • {tx.accountNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black block ${
                      isCashout ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isCashout ? '-' : '+'}৳{tx.amountBDT.toFixed(2)}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {tx.status === 'approved' && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" /> সফল
                      </span>
                    )}
                    {tx.status === 'pending' && (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> পেন্ডিং
                      </span>
                    )}
                    {tx.status === 'rejected' && (
                      <span className="text-[10px] text-rose-400 font-semibold flex items-center gap-0.5">
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

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="text-center pb-3 border-b border-slate-800">
              <div
                className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-2 ${
                  selectedTx.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedTx.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">লেনদেনের রশিদ</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {selectedTx.trxId || selectedTx.id}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">ধরণ:</span>
                <span className="font-bold text-slate-200">
                  {selectedTx.type === 'cashout' ? 'ক্যাশআউট উত্তোলন' : 'আয় বোনাস'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">পরিমাণ:</span>
                <span className="font-black text-emerald-400 text-sm">
                  ৳{selectedTx.amountBDT.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">কয়েন:</span>
                <span className="font-bold text-amber-300">
                  {selectedTx.coins.toLocaleString()} 🪙
                </span>
              </div>
              {selectedTx.method && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">মেথড:</span>
                  <span className="font-bold text-rose-400">
                    {selectedTx.method.toUpperCase()} ({selectedTx.accountType || 'Personal'})
                  </span>
                </div>
              )}
              {selectedTx.accountNumber && (
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">অ্যাকাউন্ট নম্বর:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {selectedTx.accountNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">স্ট্যাটাস:</span>
                <span
                  className={`font-bold ${
                    selectedTx.status === 'approved'
                      ? 'text-emerald-400'
                      : selectedTx.status === 'pending'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedTx.status === 'approved'
                    ? 'অনুমোদিত / সফল'
                    : selectedTx.status === 'pending'
                    ? 'অপেক্ষমান (Pending)'
                    : 'বাতিল (Rejected)'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">তারিখ:</span>
                <span className="text-slate-300">
                  {new Date(selectedTx.createdAt).toLocaleString('bn-BD')}
                </span>
              </div>
              {selectedTx.note && (
                <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">নোট:</span>
                  {selectedTx.note}
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTx(null)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
