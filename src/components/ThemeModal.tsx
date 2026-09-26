import React from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { ThemeColor, ThemeConfig } from '../types/wms';
import { THEMES } from '../services/theme';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeColor;
  onSelectTheme: (theme: ThemeColor) => void;
  lang: 'en' | 'bn';
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <Palette className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {lang === 'bn' ? 'সফটওয়্যার কালার থিম পরিবর্তন' : 'Customize Software Theme Color'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'আপনার পছন্দের কালার প্যালেট সিলেক্ট করুন'
                  : 'Select an accent color theme for buttons, glows & highlights'}
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

        {/* Theme Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {THEMES.map((th) => {
              const isSelected = currentTheme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => onSelectTheme(th.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-white/40 shadow-lg ring-2 ring-white/20'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Swatch circle */}
                    <div
                      className={`w-8 h-8 rounded-xl ${th.primaryBg} shadow-md flex items-center justify-center text-white`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {lang === 'bn' ? th.nameBn : th.nameEn}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono capitalize">{th.id}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === 'bn'
                ? 'আপনার নির্বাচিত কালারটি ব্রাউজারে স্বয়ংক্রিয়ভাবে সংরক্ষিত থাকবে। আপনি যখনই সাইট রিলোড বা Vercel এ ভিজিট করবেন একই রঙ দেখতে পাবেন।'
                : 'Theme preference is automatically saved locally and persists seamlessly across browser reloads.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors shadow-md"
          >
            {lang === 'bn' ? 'সম্পন্ন' : 'Done & Apply'}
          </button>
        </div>
      </div>
    </div>
  );
};
