import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function KeyboardHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base font-['Outfit']">Keyboard Shortcuts</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Next Page / Chapter</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">Space / → / D</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Previous Page / Chapter</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">← / A</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Toggle Fullscreen</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">F</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-white/5">
            <span className="text-slate-400">Toggle Reader Settings</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">S</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-400">Close Reader</span>
            <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-white font-bold">Esc</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/30"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
