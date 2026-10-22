import React from 'react';
import { Sparkles, Play } from 'lucide-react';

export default function UpdateToast({ activeToast, onOpenReader, onDismiss }) {
  if (!activeToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-sm sm:w-auto bg-[#0c1017]/95 border border-amber-500/40 rounded-2xl shadow-2xl p-4 flex items-center gap-3 backdrop-blur-xl animate-fadeIn text-white">
      <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-white/10 shadow-md">
        <img
          src={activeToast.coverUrl}
          alt={activeToast.mangaTitle}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 fill-amber-400 text-amber-400 animate-pulse" />
          New Chapter Released
        </span>
        <h4 className="font-bold text-xs text-white truncate mt-0.5" title={activeToast.mangaEnglishTitle || activeToast.mangaTitle}>
          {activeToast.mangaEnglishTitle || activeToast.mangaTitle}
        </h4>
        <p className="text-[11px] text-slate-300 font-medium">
          Chapter {activeToast.chapterNumber} is ready to read!
        </p>
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        <button
          onClick={() => {
            onOpenReader(
              activeToast.mangaId,
              activeToast.chapterId,
              activeToast.chapterNumber,
              activeToast.mangaTitle,
              activeToast.coverUrl,
              activeToast.mangaEnglishTitle
            );
            onDismiss();
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1 transition-all"
        >
          <Play className="w-3 h-3 fill-white" />
          <span>Read</span>
        </button>
        <button
          onClick={onDismiss}
          className="text-[10px] text-slate-400 hover:text-slate-200 text-center py-0.5"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
