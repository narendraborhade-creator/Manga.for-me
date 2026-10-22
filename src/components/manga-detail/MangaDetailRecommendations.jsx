import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function MangaDetailRecommendations({
  recommendations,
  loadingRecs,
  onSelectManga,
}) {
  return (
    <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" />
          <h3 className="font-extrabold text-base text-white font-['Outfit']">
            You Might Also Like
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Smart Suggestions</span>
      </div>

      {loadingRecs ? (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
          <span>Loading recommendations...</span>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              onClick={() => {
                if (onSelectManga) {
                  onSelectManga(rec.id, rec.coverUrl);
                }
              }}
              className="group cursor-pointer flex flex-col space-y-2 p-2 rounded-2xl bg-slate-900/40 hover:bg-white/5 border border-white/5 hover:border-rose-500/30 transition-all"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 border border-white/5 shadow-md">
                <img
                  src={rec.coverUrl}
                  alt={rec.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1.5 left-1.5 text-[9px] px-1.5 py-0.2 rounded-md bg-black/80 backdrop-blur-md text-rose-400 font-semibold border border-white/10">
                  {rec.sourceName || 'Manga'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200 group-hover:text-rose-400 transition-colors line-clamp-2">
                {rec.englishTitle || rec.title}
              </h4>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
