import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DebtTransaction } from '../types';
import {
  X,
  CreditCard,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  Check,
} from 'lucide-react';

interface SettleModalProps {
  transaction: DebtTransaction | null;
  onClose: () => void;
}

export const SettleModal: React.FC<SettleModalProps> = ({ transaction, onClose }) => {
  const { markTransactionSettled, users } = useApp();
  const [activeTab, setActiveTab] = useState<'upi' | 'paypal' | 'bank'>('upi');
  const [paymentRef, setPaymentRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!transaction) return null;

  const toUser = users.find((u) => u.id === transaction.toUserId);
  const upiAddress = toUser?.upiId || `${transaction.toUserName.toLowerCase().replace(/\s+/g, '')}@okaxis`;

  const upiDeepLink = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(
    transaction.toUserName
  )}&am=${transaction.amount}&cu=INR&tn=${encodeURIComponent(
    `StakeFit Pact Settlement Cycle ${transaction.cycleId}`
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiAddress);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRef = paymentRef.trim() || `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const method = activeTab === 'upi' ? 'UPI (GPay / PhonePe)' : activeTab === 'paypal' ? 'PayPal' : 'Bank IMPS';
    markTransactionSettled(transaction.id, finalRef, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121214] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Settle Pact Debt</h3>
              <p className="text-xs text-zinc-400">Peer-to-peer instant settlement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-5 border-b border-[#27272a] bg-[#0c0c0e]">
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#18181b] border border-[#27272a]">
            {/* Payer */}
            <div className="flex items-center gap-2.5">
              <img
                src={transaction.fromUserAvatar}
                alt={transaction.fromUserName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500"
              />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Debtor</div>
                <div className="text-xs font-bold text-white">{transaction.fromUserName}</div>
              </div>
            </div>

            {/* Amount & Arrow */}
            <div className="text-center px-3">
              <div className="text-lg font-black text-white font-mono flex items-center gap-1 justify-center text-red-400">
                <span>{transaction.currency}</span>
                <span>{transaction.amount}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 font-medium">
                <span>pays</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </div>
            </div>

            {/* Payee */}
            <div className="flex items-center gap-2.5 text-right">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Creditor</div>
                <div className="text-xs font-bold text-white">{transaction.toUserName}</div>
              </div>
              <img
                src={transaction.toUserAvatar}
                alt={transaction.toUserName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Tabs */}
        <div className="p-5 space-y-4">
          <div className="flex rounded-xl bg-[#18181b] p-1 border border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'upi'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              UPI & QR Code
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paypal')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'paypal'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              PayPal / CashApp
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bank')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'bank'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bank Transfer
            </button>
          </div>

          {/* Tab 1: UPI & QR Code */}
          {activeTab === 'upi' && (
            <div className="space-y-4 text-center">
              {/* Dynamic QR Code */}
              <div className="inline-block p-4 rounded-2xl bg-white shadow-xl">
                <svg
                  className="w-40 h-40 mx-auto text-black"
                  viewBox="0 0 160 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="40" height="40" rx="6" stroke="black" strokeWidth="6" fill="none" />
                  <rect x="22" y="22" width="16" height="16" rx="2" fill="black" />
                  <rect x="110" y="10" width="40" height="40" rx="6" stroke="black" strokeWidth="6" fill="none" />
                  <rect x="122" y="22" width="16" height="16" rx="2" fill="black" />
                  <rect x="10" y="110" width="40" height="40" rx="6" stroke="black" strokeWidth="6" fill="none" />
                  <rect x="22" y="122" width="16" height="16" rx="2" fill="black" />

                  {/* QR Pattern Data Matrix simulation */}
                  <rect x="60" y="15" width="8" height="8" fill="black" />
                  <rect x="75" y="15" width="8" height="8" fill="black" />
                  <rect x="90" y="15" width="8" height="8" fill="black" />
                  <rect x="60" y="30" width="8" height="8" fill="black" />
                  <rect x="75" y="45" width="8" height="8" fill="black" />
                  <rect x="60" y="60" width="8" height="8" fill="black" />
                  <rect x="75" y="60" width="8" height="8" fill="black" />
                  <rect x="90" y="60" width="8" height="8" fill="black" />
                  <rect x="105" y="60" width="8" height="8" fill="black" />
                  <rect x="120" y="60" width="8" height="8" fill="black" />
                  <rect x="135" y="60" width="8" height="8" fill="black" />

                  <rect x="15" y="65" width="8" height="8" fill="black" />
                  <rect x="30" y="65" width="8" height="8" fill="black" />
                  <rect x="45" y="65" width="8" height="8" fill="black" />
                  <rect x="15" y="80" width="8" height="8" fill="black" />
                  <rect x="35" y="80" width="8" height="8" fill="black" />

                  <rect x="60" y="80" width="40" height="40" rx="8" fill="#ef4444" />
                  <path d="M80 92L80 108M72 100L88 100" stroke="white" strokeWidth="4" strokeLinecap="round" />

                  <rect x="110" y="80" width="8" height="8" fill="black" />
                  <rect x="125" y="80" width="8" height="8" fill="black" />
                  <rect x="140" y="80" width="8" height="8" fill="black" />
                  <rect x="110" y="95" width="8" height="8" fill="black" />
                  <rect x="135" y="95" width="8" height="8" fill="black" />

                  <rect x="60" y="130" width="8" height="8" fill="black" />
                  <rect x="75" y="130" width="8" height="8" fill="black" />
                  <rect x="90" y="130" width="8" height="8" fill="black" />
                  <rect x="110" y="125" width="8" height="8" fill="black" />
                  <rect x="125" y="140" width="8" height="8" fill="black" />
                  <rect x="140" y="125" width="8" height="8" fill="black" />
                </svg>
                <div className="text-[11px] font-bold text-zinc-800 mt-1 font-mono">
                  Scan to Pay {transaction.currency}{transaction.amount}
                </div>
              </div>

              {/* UPI ID copy */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-xs">
                <div className="text-left font-mono">
                  <div className="text-[10px] text-zinc-500 font-sans">UPI ID / VPA</div>
                  <div className="text-zinc-200 font-semibold">{upiAddress}</div>
                </div>
                <button
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-xs font-semibold"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Deep Link Button */}
              <a
                href={upiDeepLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1f2937] hover:bg-[#374151] border border-zinc-700 text-white text-xs font-bold transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in UPI App (GPay / PhonePe / Paytm)</span>
              </a>
            </div>
          )}

          {/* Tab 2: PayPal */}
          {activeTab === 'paypal' && (
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3 text-xs">
              <div>
                <span className="text-zinc-500">PayPal.me handle: </span>
                <span className="text-white font-mono font-semibold">paypal.me/{transaction.toUserName.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
              <div>
                <span className="text-zinc-500">Cash App cashtag: </span>
                <span className="text-white font-mono font-semibold">${transaction.toUserName.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Send {transaction.currency}{transaction.amount} with note: "StakeFit Cycle #{transaction.cycleId}".
              </p>
            </div>
          )}

          {/* Tab 3: Bank */}
          {activeTab === 'bank' && (
            <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2 text-xs font-mono">
              <div>
                <span className="text-zinc-500 font-sans">Beneficiary: </span>
                <span className="text-white font-semibold">{transaction.toUserName}</span>
              </div>
              <div>
                <span className="text-zinc-500 font-sans">A/C Number: </span>
                <span className="text-white">9182 3049 8812 001</span>
              </div>
              <div>
                <span className="text-zinc-500 font-sans">IFSC Code: </span>
                <span className="text-white">HDFC0001842</span>
              </div>
            </div>
          )}

          {/* Confirmation Form */}
          <form onSubmit={handleConfirmSettle} className="pt-2 border-t border-[#27272a] space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                Transaction Reference / UTR Number (Optional):
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UPI-994182901"
                className="w-full px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 glow-green"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Paid & Settled</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
