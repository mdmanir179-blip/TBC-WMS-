import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface ProofLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export const ProofLightbox: React.FC<ProofLightboxProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-indigo-400" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download="wms-proof.png"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Download or open original"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content Container */}
        <div className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center bg-slate-950/40">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-slate-800/80 bg-slate-900"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Click anywhere outside or press Esc to close</span>
          <span className="font-mono text-emerald-400 font-semibold">100% High-Resolution Inspection</span>
        </div>
      </div>
    </div>
  );
};
