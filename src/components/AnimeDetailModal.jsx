import React from 'react';
import { X, Star } from 'lucide-react';

export default function AnimeDetailModal({ anime, onClose }) {
  if (!anime) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-[#0c1017] border-0 sm:border border-white/10 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-full sm:max-h-[92vh] h-full sm:h-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 p-2 rounded-full bg-black/70 hover:bg-black/90 text-slate-300 hover:text-white border border-white/10 backdrop-blur-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video / Trailer or Banner Section */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
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

        {/* Anime Information Content */}
        <div className="p-5 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom))] overflow-y-auto space-y-5 bg-[#0c1017]">
          
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

            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {anime.title}
            </h2>
            {anime.romajiTitle && anime.romajiTitle !== anime.title && (
              <p className="text-xs text-slate-400 mt-0.5">
                {anime.romajiTitle}
              </p>
            )}
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 text-xs">
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
              <span className="font-semibold text-slate-200 truncate block">{anime.studio}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Popularity</span>
              <span className="font-semibold text-slate-200">#{anime.popularity?.toLocaleString()}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-1.5">
            {(anime.genres || []).map((genre, idx) => (
              <span
                key={idx}
                className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Synopsis
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {anime.description}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
