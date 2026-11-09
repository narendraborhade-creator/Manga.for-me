import React, { useState, useEffect } from 'react';
import { X, Star, Film, Sparkles, Tv, ExternalLink, Play, MonitorPlay, Layers } from 'lucide-react';

export default function AnimeDetailModal({ anime, onClose }) {
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [selectedServer, setSelectedServer] = useState(anime?.trailerUrl ? 'vidsrc' : 'vidsrc');

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

  const cleanSearchTitle = (anime.title || '')
    .replace(/[:;!?\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const totalEps = Math.max(1, parseInt(anime.episodes, 10) || 12);
  const epArray = Array.from({ length: Math.min(totalEps, 150) }, (_, i) => i + 1);

  // Dynamic player embed resolver (from awesome-anime-sources)
  const getPlayerEmbedUrl = () => {
    if (selectedServer === 'trailer' && anime.trailerUrl) {
      return anime.trailerUrl;
    }
    if (selectedServer === 'twoembed') {
      return `https://www.2embed.cc/embedtv/${anime.id}&s=1&e=${activeEpisode}`;
    }
    if (selectedServer === 'embedsu') {
      return `https://embed.su/embed/anime/${anime.id}/${activeEpisode}`;
    }
    // Default: vidsrc
    return `https://vidsrc.to/embed/anime/${anime.id}/${activeEpisode}`;
  };

  // Curated verified streaming and database sources from awesome-anime-sources
  const streamingSources = [
    {
      id: 'aniwatch',
      name: 'AniWatch (Zoro)',
      badge: 'Free HD Sub/Dub',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-300',
      url: `https://aniwatchtv.to/search?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Stream all sub & dub episodes directly with high-speed playback',
    },
    {
      id: 'animepahe',
      name: 'AnimePahe',
      badge: 'Fast & Compact',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-300',
      url: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Ultra-compressed fast video encodes and multi-quality releases',
    },
    {
      id: 'crunchyroll',
      name: 'Crunchyroll',
      badge: 'Official Simulcast',
      borderColor: 'border-orange-500/40',
      textColor: 'text-orange-300',
      url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Official licensed simulcast streaming with high-fidelity audio',
    },
    {
      id: 'animeplanet',
      name: 'Anime-Planet',
      badge: 'Legal Aggregator',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      url: `https://www.anime-planet.com/anime/all?name=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Catalog of legal online video streams & anime reviews',
    },
    {
      id: 'anilist',
      name: 'AniList',
      badge: 'Database & Tracker',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-300',
      url: `https://anilist.co/anime/${anime.id}`,
      description: 'Track your episodes, progress score, voice actors & studio staff',
    },
    {
      id: 'myanimelist',
      name: 'MyAnimeList',
      badge: 'Global Community',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      url: `https://myanimelist.net/anime.php?q=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Global anime database ratings, discussions & character rankings',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl h-[94vh] max-h-[94vh] sm:h-[90vh] sm:max-h-[90vh] bg-[#0c1017] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col glass-panel-elevated hud-corner holo-sheen overflow-hidden"
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
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-cyan-300 font-bold hidden sm:inline">EPISODE {activeEpisode}</span>
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
          {/* In-App Interactive Video Streaming Player */}
          <div className="space-y-3">
            {/* Player Container */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
              <iframe
                key={`${selectedServer}-${activeEpisode}`}
                src={getPlayerEmbedUrl()}
                title={`${anime.title} - Episode ${activeEpisode}`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Server Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-300">STREAM SERVER:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedServer('vidsrc')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedServer === 'vidsrc'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Server 1 (VidSrc)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedServer('twoembed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedServer === 'twoembed'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Server 2 (2Embed)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedServer('embedsu')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedServer === 'embedsu'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Server 3 (EmbedSU)
                </button>
                {anime.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedServer('trailer')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedServer === 'trailer'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    Official Trailer
                  </button>
                )}
              </div>
            </div>

            {/* Episode Grid / Selector */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Select Episode ({totalEps} Available):
                </span>
                <span className="text-[11px] text-cyan-400">
                  Playing: Ep {activeEpisode}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
                {epArray.map((epNum) => (
                  <button
                    key={epNum}
                    type="button"
                    onClick={() => {
                      setActiveEpisode(epNum);
                      if (selectedServer === 'trailer') {
                        setSelectedServer('vidsrc');
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      activeEpisode === epNum
                        ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/40'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                    }`}
                  >
                    Ep {epNum}
                  </button>
                ))}
              </div>
            </div>
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

          {/* Verified Stream Sources Hub (awesome-anime-sources) */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 hud-corner">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>Streaming & Tracking Hub // Awesome Anime Sources</span>
              </h4>
              <span className="text-[10px] font-mono text-cyan-400/80">
                Verified Feeds
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Launch directly into popular streaming players or track community ratings for this series:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {streamingSources.map((source) => (
                <a
                  key={source.id}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-white/10 hover:border-cyan-400/50 transition-all shadow-md hover:shadow-cyan-950/40 cursor-pointer"
                  title={`Open ${source.name}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                        {source.name}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${source.borderColor} ${source.textColor} bg-black/40`}>
                        {source.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {source.description}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-cyan-500/20 text-slate-400 group-hover:text-cyan-300 transition-all flex-shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              ))}
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
