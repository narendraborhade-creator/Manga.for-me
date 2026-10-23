import React, { memo } from 'react';
import { Star, Play } from 'lucide-react';
import { getFallbackCover } from '../services/mangaApi';

function AnimeCard({ anime, onSelect }) {
  if (!anime) return null;

  return (
    <div
      onClick={() => onSelect(anime)}
      className="group relative flex flex-col bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-950/20 cursor-pointer"
    >
      {/* Poster Image */}
      <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-slate-950">
        <img
          src={anime.coverUrl}
          alt={anime.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.src = getFallbackCover(anime.title);
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
          {anime.score && anime.score !== 'N/A' && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-slate-950 shadow-md">
              <Star className="w-3 h-3 fill-slate-950" />
              <span>{anime.score}</span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-slate-300 border border-white/10">
            {anime.episodes ? `${anime.episodes} Ep` : 'Airing'}
          </span>
        </div>

        {/* Hover Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${
              anime.status === 'RELEASING' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
            }`} />
            <span className="capitalize">{anime.status?.toLowerCase().replace('_', ' ') || 'Finished'}</span>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 group-hover:text-rose-400 line-clamp-1 transition-colors">
            {anime.title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {anime.studio}
          </p>
        </div>

        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[130px]">
            {anime.genres && anime.genres[0] ? anime.genres[0] : 'Anime'}
          </span>
          {anime.season && (
            <span className="text-slate-500 text-[10px] truncate max-w-[80px]">
              {anime.season}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AnimeCard);
