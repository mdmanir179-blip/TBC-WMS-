import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Rocket, Terminal, ShieldCheck, Globe } from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'bn';
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      titleEn: '1. Push Code to GitHub Repository',
      titleBn: '১. কোডটি আপনার গিটহাব (GitHub) রিপোজিটরিতে পুশ করুন',
      descEn: 'Initialize git if needed, commit your files and push to your private or public GitHub repository.',
      descBn: 'গিট ইনিশিয়ালাইজ করে সমস্ত কোড গিটহাবে পুশ করুন।',
      code: `git init\ngit add .\ngit commit -m "feat: initial wms cashback portal release"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/wms-portal.git\ngit push -u origin main`
    },
    {
      titleEn: '2. Import Project on Vercel Dashboard',
      titleBn: '২. Vercel ড্যাশবোর্ডে প্রজেক্ট ইমপোর্ট করুন',
      descEn: 'Go to vercel.com, sign in with GitHub, click "Add New... -> Project", and select your wms-portal repository.',
      descBn: 'vercel.com-এ গিয়ে "Add New Project" এ ক্লিক করে আপনার রিপোজিটর সিলেক্ট করুন।',
      code: `https://vercel.com/new`
    },
    {
      titleEn: '3. Verify Vite Build Settings (Auto-Configured)',
      titleBn: '৩. বিল্ড সেটিংস কনফার্ম করুন (অটোমেটিক সেটিংস)',
      descEn: 'Vercel will automatically detect Vite. The root vercel.json rewrite file is already configured for zero 404 router errors.',
      descBn: 'Vercel স্বয়ংক্রিয়ভাবে Vite ডিটেক্ট করবে। রুটে vercel.json তৈরি করে রাখা হয়েছে।',
      code: `Framework Preset: Vite\nBuild Command: npm run build\nOutput Directory: dist\nInstall Command: npm install`
    },
    {
      titleEn: '4. Alternative: Deploy via Vercel CLI in 30 Seconds',
      titleBn: '৪. অথবা টার্মিনাল থেকে সরাসরি Vercel CLI দিয়ে ডিপ্লয় করুন',
      descEn: 'If you have Node.js installed, you can simply run the official Vercel command in your project directory.',
      descBn: 'আপনার টার্মিনালে সরাসরি নিচের কমান্ডটি দিয়ে এক ক্লিকে ডিপ্লয় করে নিন।',
      code: `npm i -g vercel\nvercel --prod`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'Vercel এ ডিপ্লয় করার পূর্ণাঙ্গ গাইড' : 'Vercel Deployment Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'এই TBC WMS সফটওয়্যারটি সহজে Vercel এ লাইভ করার নির্দেশিকা'
                  : 'Zero-configuration production deployment for TBC WMS Portal'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-200 leading-relaxed">
              <strong className="text-emerald-300 font-semibold block mb-0.5">
                {lang === 'bn' ? '✓ vercel.json কনফিগারেশন যুক্ত করা হয়েছে' : '✓ vercel.json routing is pre-configured'}
              </strong>
              {lang === 'bn'
                ? 'SPA রাউটিং এবং ব্রাউজার রিফ্রেশে যাতে কোনো 404 এরর না আসে সেজন্য রুট ডিরেক্টরিতে vercel.json আগেই সেট করা আছে।'
                : 'Single-page application (SPA) rewrite rules and HTTP security headers are pre-bundled in the root.'}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-200">
                    {lang === 'bn' ? step.titleBn : step.titleEn}
                  </h4>
                  <button
                    onClick={() => copyToClipboard(step.code, idx)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? step.descBn : step.descEn}
                </p>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto leading-relaxed">
                    <code>{step.code}</code>
                  </pre>
                </div>
              </div>
            ))}
          </div>

          {/* Direct Vercel link */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-400" />
              {lang === 'bn' ? 'ডিপ্লয় করতে প্রস্তুত?' : 'Ready to deploy?'}
            </span>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <span>Open Vercel Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
