import React from 'react';
import { Pause, X } from 'lucide-react';

export default function AutoScrollHud({
  isAutoScrolling,
  setIsAutoScrolling,
  autoScrollSpeed,
  updateSetting
}) {
  if (!isAutoScrolling) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fadeIn select-none pointer-events-auto w-[calc(100vw-16px)] sm:w-auto max-w-sm flex justify-center">
      <div className="glass-panel px-2.5 sm:px-4 py-2 rounded-2xl border border-rose-500/40 shadow-2xl shadow-rose-950/60 backdrop-blur-xl flex items-center justify-between sm:justify-start gap-1.5 sm:gap-3 bg-slate-900/95 text-white max-w-full">
        {/* Pulsing indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[11px] font-bold">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="hidden xs:inline">Auto-Scroll</span>
          <span>{autoScrollSpeed || 2}x</span>
        </div>

        {/* Quick Speed Switcher */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-xl border border-white/5">
          {[1, 2, 3, 4].map((spd) => (
            <button
              key={spd}
              onClick={(e) => {
                e.stopPropagation();
                updateSetting('autoScrollSpeed', spd);
              }}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                (autoScrollSpeed || 2) === spd
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={`${spd}x Speed`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Pause / Stop Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoScrolling(false);
          }}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold px-2"
          title="Pause Auto-Scroll"
        >
          <Pause className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Pause</span>
        </button>

        {/* Close HUD */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsAutoScrolling(false);
          }}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title="Close Auto-Scroll"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
