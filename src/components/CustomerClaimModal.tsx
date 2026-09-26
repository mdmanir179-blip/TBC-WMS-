import React, { useState } from 'react';
import { X, Upload, AlertCircle, ShieldAlert, CheckCircle2, IndianRupee, Image as ImageIcon } from 'lucide-react';
import { WmsProduct, WmsClaim } from '../types/wms';
import { DEMO_PROOFS } from '../services/storage';

interface CustomerClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: WmsProduct | null;
  customer: { name: string; phone: string; email: string };
  onSubmitClaim: (claim: WmsClaim) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, msg: string) => void;
}

export const CustomerClaimModal: React.FC<CustomerClaimModalProps> = ({
  isOpen,
  onClose,
  product,
  customer,
  onSubmitClaim,
  onShowToast
}) => {
  const [specialCode, setSpecialCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [orderProof, setOrderProof] = useState<string>('');
  const [paymentProof, setPaymentProof] = useState<string>('');
  const [ratingProof, setRatingProof] = useState<string>('');
  const [useSampleProofs, setUseSampleProofs] = useState(false);

  if (!isOpen || !product) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        onShowToast('error', 'File Too Large', 'Please upload screenshot under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickFillDemo = () => {
    setSpecialCode(product.specialCode);
    setUpiId(`${customer.name.toLowerCase().replace(/\s+/g, '')}@okaxis`);
    setOrderProof(DEMO_PROOFS.order);
    setPaymentProof(DEMO_PROOFS.payment);
    setRatingProof(DEMO_PROOFS.rating);
    setUseSampleProofs(true);
    onShowToast('info', 'Demo Proofs Loaded', 'Prefilled valid sample screenshots and matching verification code.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = specialCode.trim().toUpperCase();
    const cleanUpi = upiId.trim();

    if (!cleanCode) {
      onShowToast('error', 'Code Missing', 'Please enter the Special Product Verification Code.');
      return;
    }

    if (!cleanUpi.includes('@')) {
      onShowToast('error', 'Invalid UPI ID', 'Please enter a valid UPI ID (e.g. mobile@upi or name@okbank).');
      return;
    }

    if (!orderProof || !paymentProof || !ratingProof) {
      onShowToast('error', 'Screenshots Required', 'Please attach all 3 proof screenshots (Order, Payment, Rating).');
      return;
    }

    const isCodeMatched = cleanCode === product.specialCode.trim().toUpperCase();
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newClaim: WmsClaim = {
      id: `CLM-${Date.now().toString().slice(-6)}`,
      productId: product.id,
      productTitle: product.title,
      platform: product.platform,
      cashbackAmount: product.cashbackAmount,
      systemCode: product.specialCode,
      submittedCode: cleanCode,
      isCodeMatched,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      refundUpi: cleanUpi,
      orderScreenshot: orderProof,
      paymentScreenshot: paymentProof,
      ratingScreenshot: ratingProof,
      status: 'Pending',
      submittedAt: now,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          action: 'Claim Submitted by Customer',
          note: isCodeMatched
            ? 'Special Code matched system verification.'
            : `Flagged: Submitted code "${cleanCode}" does not match system code "${product.specialCode}".`,
          performedBy: customer.name
        }
      ]
    };

    onSubmitClaim(newClaim);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {product.platform}
              </span>
              <h3 className="text-base font-bold text-white">Submit Cashback Claim</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-sm sm:max-w-md">
              {product.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Cashback Details Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                <IndianRupee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-indigo-200">Eligible Cashback Refund</p>
                <p className="text-base font-bold text-white font-mono">
                  ₹{product.cashbackAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-indigo-300">({product.cashbackType})</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillDemo}
              className="text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-900/60 hover:bg-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-700/60 transition-colors"
            >
              ⚡ Fast Demo Autofill
            </button>
          </div>

          {/* Verification Code Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Special Product Verification Code *
            </label>
            <input
              type="text"
              required
              value={specialCode}
              onChange={(e) => setSpecialCode(e.target.value.toUpperCase())}
              placeholder={`e.g. ${product.specialCode}`}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase tracking-widest placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">
              Must match the exact code specified on this campaign card ({product.specialCode}).
            </p>
          </div>

          {/* Proof Uploads Section */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Upload 3 Verification Screenshot Proofs *
            </label>

            {/* 1. Order Confirmation Proof */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] flex items-center justify-center font-bold text-slate-300">
                    1
                  </span>
                  Order Placed Screenshot
                </span>
                {orderProof && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setOrderProof)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {orderProof && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                  <img src={orderProof} alt="Order Preview" className="w-10 h-10 object-cover rounded" />
                  <span className="text-[11px] text-slate-400 truncate">order_proof_file.png</span>
                </div>
              )}
            </div>

            {/* 2. Payment Receipt Proof */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] flex items-center justify-center font-bold text-slate-300">
                    2
                  </span>
                  Payment Success Screenshot / Invoice
                </span>
                {paymentProof && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setPaymentProof)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {paymentProof && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                  <img src={paymentProof} alt="Payment Preview" className="w-10 h-10 object-cover rounded" />
                  <span className="text-[11px] text-slate-400 truncate">payment_proof_receipt.png</span>
                </div>
              )}
            </div>

            {/* 3. Rating & Review Proof */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] flex items-center justify-center font-bold text-slate-300">
                    3
                  </span>
                  Delivered 5-Star Rating / Review Screenshot
                </span>
                {ratingProof && (
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, setRatingProof)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {ratingProof && (
                <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                  <img src={ratingProof} alt="Rating Preview" className="w-10 h-10 object-cover rounded" />
                  <span className="text-[11px] text-slate-400 truncate">rating_review_screenshot.png</span>
                </div>
              )}
            </div>
          </div>

          {/* Refund UPI ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Disbursement Refund UPI ID *
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. mobile@upi, yourname@okhdfcbank"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm font-mono font-medium text-emerald-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-400">
              Admin will disburse cashback directly to this UPI address upon proof verification.
            </p>
          </div>

          {/* Action Buttons */}
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Submit Claim for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
