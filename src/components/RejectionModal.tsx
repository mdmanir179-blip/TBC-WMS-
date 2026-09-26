import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { WmsClaim } from '../types/wms';

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: WmsClaim | null;
  onConfirmReject: (claimId: string, reason: string) => void;
}

const COMMON_REASONS = [
  'Special verification code does not match campaign code',
  'Order screenshot does not show verified delivery status',
  'Payment receipt is missing or illegible UTR/transaction ID',
  'Rating screenshot shows review is not yet publicly visible',
  'Order cancelled or return requested on store platform',
  'Duplicate submission detected for same mobile number'
];

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  claim,
  onConfirmReject
}) => {
  const [reason, setReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !claim) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() ? customReason.trim() : reason;
    onConfirmReject(claim.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Reject Proof Submission
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Claim ID: <span className="font-mono text-slate-300 font-semibold">{claim.id}</span> • {claim.customerName}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300">
            Rejecting this claim will notify the customer with the explanation below so they can correct and resubmit.
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Preset Rejection Reason
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((r, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    reason === r && !customReason
                      ? 'bg-rose-950/40 border-rose-500/50 text-slate-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  onClick={() => {
                    setReason(r);
                    setCustomReason('');
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === r && !customReason}
                    onChange={() => {}}
                    className="mt-0.5 text-rose-500 focus:ring-0"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Or Custom Rejection Explanation
            </label>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Type specific issue (optional)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

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
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
