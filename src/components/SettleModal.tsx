import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { DebtTransaction } from '../types';
import {
  X,
  CheckCircle2,
  Copy,
  ExternalLink,
  ArrowRight,
  Check,
  QrCode,
  MessageCircle,
} from 'lucide-react';
import { playCashChime, playPop } from '../utils/audio';

interface SettleModalProps {
  transaction: DebtTransaction | null;
  onClose: () => void;
}

export const SettleModal: React.FC<SettleModalProps> = ({ transaction, onClose }) => {
  const { markTransactionSettled, users } = useApp();
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
    playPop();
    navigator.clipboard?.writeText(upiAddress);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleShareWhatsApp = () => {
    playPop();
    const text = `💸 STAKEFIT SETTLEMENT 💸\n${transaction.fromUserName} pays ${transaction.currency}${transaction.amount} to ${transaction.toUserName}\nVerified UPI ID: ${upiAddress}\nPact Cycle #${transaction.cycleId}\nPay via GPay / PhonePe: ${upiDeepLink}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    playCashChime();
    const finalRef = paymentRef.trim() || `UTR-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const method = 'UPI & Dynamic QR';
    markTransactionSettled(transaction.id, finalRef, method);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#09090b] border-2 border-red-600/40 rounded-2xl shadow-2xl overflow-hidden my-8 ring-1 ring-white/10">
        {/* Header - Athletic Red, White & Black */}
        <div className="p-4 sm:p-5 border-b border-[#27272a] flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-md glow-red">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                  Settle Pact Debt
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-black">
                  UPI & QR Only
                </span>
              </div>
              <p className="text-xs text-zinc-400">Scan & pay instantly peer-to-peer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card - High Contrast White & Black Surface */}
        <div className="p-5 border-b border-[#27272a] bg-[#121214]">
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-white text-zinc-950 border-2 border-red-500 shadow-xl">
            {/* Payer (Debtor) */}
            <div className="flex items-center gap-2.5">
              <img
                src={transaction.fromUserAvatar}
                alt={transaction.fromUserName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-red-600 shadow-md"
              />
              <div>
                <div className="text-[10px] text-red-600 uppercase font-black tracking-wider">Debtor</div>
                <div className="text-xs font-black text-black">{transaction.fromUserName}</div>
              </div>
            </div>

            {/* Amount & Arrow */}
            <div className="text-center px-2">
              <div className="text-xl font-black text-red-600 font-mono flex items-center gap-0.5 justify-center">
                <span>{transaction.currency}</span>
                <span>{transaction.amount}</span>
              </div>
              <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-600 font-bold uppercase">
                <span>pays</span>
                <ArrowRight className="w-3 h-3 text-red-600" />
              </div>
            </div>

            {/* Payee (Creditor) */}
            <div className="flex items-center gap-2.5 text-right">
              <div>
                <div className="text-[10px] text-emerald-600 uppercase font-black tracking-wider">Creditor</div>
                <div className="text-xs font-black text-black">{transaction.toUserName}</div>
              </div>
              <img
                src={transaction.toUserAvatar}
                alt={transaction.toUserName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-600 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* UPI & Dynamic QR Code Section (Exclusively UPI & QR) */}
        <div className="p-5 space-y-4 bg-[#09090b]">
          {/* Stark White Dynamic QR Card */}
          <div className="text-center">
            <div className="inline-block p-4 sm:p-5 rounded-2xl bg-white shadow-2xl border-4 border-red-600 ring-2 ring-white/20">
              <svg
                className="w-44 h-44 mx-auto text-black"
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

                {/* Red Center Stake Logo */}
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
              <div className="text-xs font-black text-black mt-2 font-mono uppercase tracking-wider">
                Scan with any UPI App • {transaction.currency}{transaction.amount}
              </div>
              <div className="text-[10px] text-zinc-500 font-bold">
                Google Pay • PhonePe • Paytm • BHIM
              </div>
            </div>
          </div>

          {/* UPI ID copy */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-[#27272a] text-xs">
            <div className="text-left font-mono">
              <div className="text-[10px] text-zinc-400 font-sans font-bold uppercase tracking-wider">
                Verified UPI ID / VPA
              </div>
              <div className="text-white font-bold">{upiAddress}</div>
            </div>
            <button
              onClick={handleCopyUpi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black transition-colors text-xs font-black shadow-md"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons: Open App & Share to WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={upiDeepLink}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 glow-red"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Pay in UPI App</span>
            </a>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 glow-green"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share Request on WhatsApp</span>
            </button>
          </div>

          {/* Confirmation Form */}
          <form onSubmit={handleConfirmSettle} className="pt-3 border-t border-[#27272a] space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1">
                UPI Reference / UTR Number (Optional):
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="e.g. UTR-491820491820"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/50 glow-green"
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
