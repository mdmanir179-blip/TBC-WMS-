import React, { useState } from 'react';
import { X, CheckCircle2, IndianRupee, Copy, Check } from 'lucide-react';
import { WmsClaim } from '../types/wms';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: WmsClaim | null;
  onConfirmPayout: (claimId: string, utrRef: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  isOpen,
  onClose,
  claim,
  onConfirmPayout,
  onShowToast
}) => {
  const [utrRef, setUtrRef] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen || !claim) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(claim.refundUpi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
    onShowToast('info', 'UPI Copied', `Copied ${claim.refundUpi} to clipboard.`);
  };

  const handleGenerateSampleUtr = () => {
    const randomUtr = `UTR-${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    setUtrRef(randomUtr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrRef.trim()) {
      onShowToast('error', 'UTR Missing', 'Please enter or generate a Banking UTR / Transaction Reference number.');
      return;
    }
    onConfirmPayout(claim.id, utrRef.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Disburse UPI Payout
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Claim ID: <span className="font-mono text-slate-300 font-semibold">{claim.id}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-300">Total Cashback Due</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                ₹{claim.cashbackAmount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Recipient</p>
              <p className="text-sm font-semibold text-white">{claim.customerName}</p>
            </div>
          </div>

          {/* UPI Address Box */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Customer UPI Handle
              </p>
              <p className="text-sm font-mono font-bold text-slate-100 mt-0.5">{claim.refundUpi}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Banking Links */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Pay using:</span>
            <a
              href={`upi://pay?pa=${encodeURIComponent(claim.refundUpi)}&pn=${encodeURIComponent(
                claim.customerName
              )}&am=${claim.cashbackAmount}&cu=INR&tn=TBC WMS Cashback ${claim.id}`}
              className="text-indigo-400 hover:underline font-medium"
            >
              Direct UPI App Intent
            </a>
            <span>•</span>
            <span>GPay / PhonePe / Paytm</span>
          </div>

          {/* UTR Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Bank UTR / Transaction Reference No *
              </label>
              <button
                type="button"
                onClick={handleGenerateSampleUtr}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Generate Test UTR
              </button>
            </div>
            <input
              type="text"
              required
              value={utrRef}
              onChange={(e) => setUtrRef(e.target.value.toUpperCase())}
              placeholder="e.g. 426819208492 or UTR-2026-X88"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500 tracking-wider"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
            >
              Confirm Payout Complete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
