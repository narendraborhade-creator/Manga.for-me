import React from 'react';
import {
  Settings,
  Compass,
  Infinity as InfinityIcon,
  Gauge,
  Play,
  Pause,
  Sun,
  Palette,
  Minimize,
  Maximize,
  HelpCircle
} from 'lucide-react';

export default function ReaderSettingsModal({
  isOpen,
  onClose,
  settings,
  updateSetting,
  isAutoScrolling,
  setIsAutoScrolling,
  toggleFullscreen,
  isFullscreen,
  onOpenHelpModal
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 max-h-[80vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-4 sm:p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-rose-400" />
            <span>Reader Settings</span>
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Reading Layout Mode */}
        <div>
          <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-rose-400" />
            <span>Reading Mode</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => updateSetting('readingMode', 'webtoon')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                settings.readingMode === 'webtoon'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Webtoon (Strip)
            </button>
            <button
              onClick={() => updateSetting('readingMode', 'single')}
              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                settings.readingMode === 'single'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Single Page
            </button>
          </div>
        </div>

        {/* Continuous Infinite Chapter Scrolling Toggle */}
        {settings.readingMode === 'webtoon' && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 border border-white/5">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <InfinityIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Continuous Scrolling</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Auto-loads next chapter seamlessly (Mihon style)
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateSetting('continuousScroll', !settings.continuousScroll)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                settings.continuousScroll !== false ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.continuousScroll !== false ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Auto-Scroll Toggle & Speed */}
        {settings.readingMode === 'webtoon' && (
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-rose-400" />
                <span>Auto-Scroll</span>
              </div>
              <button
                onClick={() => setIsAutoScrolling((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  isAutoScrolling
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isAutoScrolling ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                <span>{isAutoScrolling ? 'Pause' : 'Start'}</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 1, label: '1x Slow' },
                { val: 2, label: '2x Normal' },
                { val: 3, label: '3x Fast' },
                { val: 4, label: '4x Turbo' },
              ].map((sp) => (
                <button
                  key={sp.val}
                  type="button"
                  onClick={() => updateSetting('autoScrollSpeed', sp.val)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    (settings.autoScrollSpeed || 2) === sp.val
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Screen Dimmer / Night Mode Brightness */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Brightness (Night Mode)</span>
            </span>
            <span className="text-rose-400 font-bold">{settings.brightness ?? 100}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            value={settings.brightness ?? 100}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Page Container Width / Phone Fit Mode */}
        <div>
          <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center justify-between">
            <span>Page Fit Mode</span>
            <span className="text-[10px] text-rose-400 font-bold uppercase">
              {settings.fitMode === 'full' ? 'Phone Fit (Full)' : settings.fitMode === 'wide' ? 'Wide' : '800px'}
            </span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'full', label: 'Phone Fit' },
              { id: 'width', label: '800px' },
              { id: 'wide', label: '1020px' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateSetting('fitMode', item.id)}
                className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                  (settings.fitMode || 'full') === item.id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reading Theme */}
        <div>
          <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-rose-400" />
            <span>Theme Mood</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'oled', label: 'OLED Black', color: '#000000' },
              { id: 'obsidian', label: 'Obsidian', color: '#080a0f' },
              { id: 'sepia', label: 'Sepia Paper', color: '#181512' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => updateSetting('theme', th.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 ${
                  settings.theme === th.id
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: th.color }} />
                <span>{th.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Webtoon Page Spacing */}
        {settings.readingMode === 'webtoon' && (
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-medium flex items-center justify-between">
              <span>Page Spacing</span>
              <span className="text-rose-400 font-bold">
                {(settings.pageGap ?? 0) === 0 ? 'Seamless (0px)' : `${settings.pageGap}px`}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { val: 0, label: 'Seamless' },
                { val: 6, label: 'Compact' },
                { val: 14, label: 'Spaced' },
              ].map((sp) => (
                <button
                  key={sp.val}
                  type="button"
                  onClick={() => updateSetting('pageGap', sp.val)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    (settings.pageGap ?? 0) === sp.val
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Direction for Single Page */}
        {settings.readingMode === 'single' && (
          <div>
            <label className="text-xs text-slate-300 block mb-1.5 font-medium">
              Reading Direction
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => updateSetting('readingDirection', 'ltr')}
                className={`py-1 rounded-lg text-xs font-semibold border ${
                  settings.readingDirection === 'ltr'
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-800 border-white/5 text-slate-400'
                }`}
              >
                Left to Right
              </button>
              <button
                onClick={() => updateSetting('readingDirection', 'rtl')}
                className={`py-1 rounded-lg text-xs font-semibold border ${
                  settings.readingDirection === 'rtl'
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-slate-800 border-white/5 text-slate-400'
                }`}
              >
                Right to Left (JP)
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions: Fullscreen & Shortcuts Help */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={toggleFullscreen}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
          <button
            onClick={onOpenHelpModal}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </div>
  );
}
