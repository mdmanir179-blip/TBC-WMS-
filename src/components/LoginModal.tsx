import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserSession } from '../types/wms';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  initialTab?: 'customer' | 'admin';
  onLoginSuccess: (session: UserSession) => void;
  lang: 'en' | 'bn';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'customer',
  onLoginSuccess,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(initialTab);

  // Customer Form state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);

  // Admin Form state
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Error feedback
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!custName.trim()) {
      setErrorMessage(lang === 'bn' ? 'দয়া করে আপনার নাম লিখুন।' : 'Please enter your name.');
      return;
    }
    if (!custPhone.trim() || custPhone.trim().length < 10) {
      setErrorMessage(lang === 'bn' ? '১০ ডিজিটের মোবাইল নম্বর প্রদান করুন।' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!custEmail.trim() || !custEmail.includes('@')) {
      setErrorMessage(lang === 'bn' ? 'সঠিক ইমেইল আইডি প্রদান করুন।' : 'Please enter a valid email address.');
      return;
    }
    if (!custPassword.trim()) {
      setErrorMessage(lang === 'bn' ? 'পাসওয়ার্ড প্রদান করুন।' : 'Please enter your password.');
      return;
    }

    const session: UserSession = {
      type: 'customer',
      name: custName.trim(),
      phone: custPhone.trim(),
      email: custEmail.trim()
    };

    onLoginSuccess(session);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = adminId.trim().toLowerCase();
    const trimmedPass = adminPass.trim();

    // Verification check for admin
    if ((trimmedId === 'admin' || trimmedId === 'admin@tbcwms.com') && (trimmedPass === 'admin123' || trimmedPass === 'admin')) {
      const session: UserSession = {
        type: 'admin',
        name: 'Executive Admin',
        email: 'admin@tbcwms.com',
        adminRole: 'Executive Admin'
      };
      onLoginSuccess(session);
    } else {
      setErrorMessage(
        lang === 'bn'
          ? 'ভুল অ্যাডমিন আইডি বা পাসওয়ার্ড! (ইউজার: admin, পাসওয়ার্ড: admin123)'
          : 'Invalid Admin Credentials! (Use ID: admin, Password: admin123)'
      );
    }
  };

  const handleDemoCustomer = () => {
    setCustName('Rahul Roy');
    setCustPhone('9876543210');
    setCustEmail('rahul.roy@example.com');
    setCustPassword('customer123');
    setErrorMessage('');
  };

  const handleDemoAdmin = () => {
    setAdminId('admin');
    setAdminPass('admin123');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Banner */}
        <div className="p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-b border-slate-800 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-600/30">
              T
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white tracking-tight">TBC WMS</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Portal Login
                </span>
              </div>
              <p className="text-xs text-slate-400">Cashback &amp; Rewards Management Software</p>
            </div>
          </div>

          {/* Login Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'customer'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কাস্টমার লগইন' : 'Customer Login'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage('');
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>{lang === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6">
          {activeTab === 'customer' ? (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {lang === 'bn' ? 'ক্যাশব্যাক রিফান্ড ক্লেইম করতে লগইন করুন' : 'Login to claim cashbacks & track UPI refunds'}
                </span>
                <button
                  type="button"
                  onClick={handleDemoCustomer}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Fill Demo
                </button>
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'গ্রাহকের পুরো নাম *' : 'Customer Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Rahul Roy"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'মোবাইল নম্বর (১০ ডিজিট) *' : 'Mobile Number (10 Digits) *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    title="10 digit phone number"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'ইমেইল এড্রেস *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    placeholder="rahul@example.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'পাসওয়ার্ড *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCustPassword ? 'text' : 'password'}
                    required
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustPassword(!showCustPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>{lang === 'bn' ? 'কাস্টমার পোর্টালে প্রবেশ করুন' : 'Access Customer Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {lang === 'bn' ? 'ম্যানেজমেন্ট ও প্রুফ যাচাই কনসোল' : 'Administrative Verification & Payout Console'}
                </span>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto-Fill Admin
                </button>
              </div>

              {/* Admin ID */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'অ্যাডমিন আইডি বা ইমেইল *' : 'Admin ID or Email *'}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="admin or admin@tbcwms.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Admin Password */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {lang === 'bn' ? 'অ্যাডমিন পাসওয়ার্ড *' : 'Admin Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-indigo-300">Demo Credentials:</span>
                  <span className="font-mono text-emerald-400">admin / admin123</span>
                </div>
                <p>Full permissions to verify image proofs, approve claims &amp; disburse UPI refunds.</p>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন' : 'Login to Admin Dashboard'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
