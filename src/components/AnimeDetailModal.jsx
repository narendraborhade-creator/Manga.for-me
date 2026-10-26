import React, { useEffect } from 'react';
import { X, Star, Film, Sparkles } from 'lucide-react';

export default function AnimeDetailModal({ anime, onClose }) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!anime) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl h-[94vh] max-h-[94vh] sm:h-[88vh] sm:max-h-[88vh] bg-[#0c1017] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col glass-panel-elevated hud-corner holo-sheen overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pinned Top HUD Navigation Bar */}
        <header className="relative z-30 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400/90 tracking-widest select-none">
            <span className="flex items-center gap-1.5 font-bold">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              ANIME_STREAM // ARCHIVE
            </span>
            <span className="text-slate-600 hidden xs:inline">•</span>
            <span className="text-slate-400 hidden xs:inline">STATUS: {anime.status || 'READY'}</span>
          </div>

          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-rose-600 text-slate-300 hover:text-white border border-white/10 hover:border-rose-500/40 backdrop-blur-md transition-all shadow-md cursor-pointer flex items-center gap-1.5 flex-shrink-0"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="text-[10px] sm:text-xs font-mono font-bold">CLOSE</span>
          </button>
        </header>

        {/* Unified Scrollable Body */}
        <div 
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent space-y-5 p-4 sm:p-6 md:p-8 pb-14 sm:pb-16"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {/* Video / Trailer or Banner Section */}
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            {anime.trailerUrl ? (
              <iframe
                src={anime.trailerUrl}
                title={anime.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={anime.bannerUrl || anime.coverUrl}
                  alt={anime.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-transparent to-black/40" />
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs bg-black/30 backdrop-blur-[2px]">
                  <span>No official trailer preview available for this title</span>
                </div>
              </div>
            )}
          </div>

          {/* Header Title & Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {anime.score && anime.score !== 'N/A' && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{anime.score} / 10</span>
                </span>
              )}

              <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                anime.status === 'RELEASING'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-300 border border-white/10'
              }`}>
                {anime.status?.toLowerCase().replace('_', ' ')}
              </span>

              {anime.season && (
                <span className="px-2 py-0.5 rounded-md text-xs text-slate-400 bg-white/5 border border-white/5">
                  {anime.season}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
              {anime.title}
            </h2>
            {anime.romajiTitle && anime.romajiTitle !== anime.title && (
              <p className="text-xs text-slate-400 mt-0.5">
                {anime.romajiTitle}
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Episodes</span>
              <span className="font-semibold text-slate-200">{anime.episodes || 'TBA'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Duration</span>
              <span className="font-semibold text-slate-200">{anime.duration || '24m/ep'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Studio</span>
              <span className="font-semibold text-slate-200 truncate block">{anime.studio || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Popularity</span>
              <span className="font-semibold text-slate-200">#{anime.popularity?.toLocaleString() || 'N/A'}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {(anime.genres || []).map((genre, idx) => (
              <span
                key={idx}
                className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full font-medium"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Synopsis</span>
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {anime.description || 'No detailed synopsis available.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
