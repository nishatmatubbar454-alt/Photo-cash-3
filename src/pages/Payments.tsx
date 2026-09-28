import React from 'react';
import { ArrowLeft, CheckCircle2, Clock, XCircle, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Payments: React.FC = () => {
  const { transactions, setActiveTab } = useAuth();

  return (
    <div className="flex-1 bg-[#f8fafc] p-4 pb-20 space-y-4 font-sans min-h-screen">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('wallet')}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-800"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
        </button>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Payments</h2>
          <p className="text-xs text-slate-400">Withdrawals & transaction records</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No payment records yet</p>
            <p className="text-xs text-slate-400 mt-1">Cash out requests will appear here</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center font-bold text-xs">
                  USDT
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {tx.method} Withdrawal
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                    {tx.address}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-slate-900 block">
                  -${(tx.amountUSDT ?? 0).toFixed(2)}
                </span>
                {tx.status === 'approved' && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Approved
                  </span>
                )}
                {tx.status === 'rejected' && (
                  <span className="text-[10px] text-rose-500 font-bold flex items-center justify-end gap-1 mt-0.5">
                    <XCircle className="w-3 h-3" /> Rejected
                  </span>
                )}
                {tx.status === 'pending' && (
                  <span className="text-[10px] text-amber-500 font-bold flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Pending
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
