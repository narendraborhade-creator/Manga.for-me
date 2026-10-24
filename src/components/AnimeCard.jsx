import React, { memo } from 'react';
import { Star, Play } from 'lucide-react';
import { getFallbackCover } from '../services/mangaApi';

function AnimeCard({ anime, onSelect }) {
  if (!anime) return null;

  return (
    <div
      onClick={() => onSelect(anime)}
      className="group relative flex flex-col bg-[#0a0f1d]/75 hover:bg-[#10172e] rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-950/40 hover:-translate-y-1 cursor-pointer select-none glass-card hud-corner holo-sheen"
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
        <img
          src={anime.coverUrl}
          alt={anime.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.src = getFallbackCover(anime.title);
          }}
        />

        {/* Gradient Overlay & Scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#060810] via-[#060810]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 holo-scanlines pointer-events-none opacity-25 group-hover:opacity-40 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {anime.score && anime.score !== 'N/A' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/90 text-slate-950 shadow-md">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>{anime.score}</span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {anime.episodes ? `${anime.episodes} EPS` : 'AIRING'}
          </span>
        </div>

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full btn-holo text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${
              anime.status === 'RELEASING' ? 'bg-cyan-400 animate-ping' : 'bg-slate-400'
            }`} />
            <span className="uppercase text-[9px] tracking-wider text-cyan-200">{anime.status?.toLowerCase().replace('_', ' ') || 'Finished'}</span>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between bg-gradient-to-b from-transparent to-[#060810]/60">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 line-clamp-1 transition-colors">
            {anime.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {anime.studio}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[130px] font-mono text-[10px]">
            {anime.genres && anime.genres[0] ? anime.genres[0] : 'Anime'}
          </span>
          {anime.season && (
            <span className="text-cyan-400/80 font-mono text-[9px] truncate max-w-[80px]">
              {anime.season}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AnimeCard);
