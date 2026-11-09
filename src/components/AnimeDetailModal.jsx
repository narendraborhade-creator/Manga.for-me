import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Film, 
  Sparkles, 
  Tv, 
  ExternalLink, 
  Play, 
  MonitorPlay, 
  Layers, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldAlert,
  Radio,
  Flame
} from 'lucide-react';

export default function AnimeDetailModal({ anime, onClose }) {
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [playerMode, setPlayerMode] = useState('stream'); // 'stream' | 'trailer' | 'sources'

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

  // VidLink stream player URL using MAL ID or AniList ID with automatic sub/dub fallback
  const malOrAniId = anime.malId || anime.id;
  const vidlinkStreamUrl = `https://vidlink.pro/anime/${malOrAniId}/${activeEpisode}/sub?fallback=true`;

  // Official Verified Video Stream (from AniList trailer or YouTube HD search)
  const officialTrailerEmbed = anime.trailerUrl || `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(cleanSearchTitle + ' official trailer')}`;

  // Direct Episode Stream Launchers (awesome-anime-sources verified index)
  const episodeStreamServers = [
    {
      id: 'hianime',
      name: 'HiAnime (Zoro)',
      badge: 'Sub/Dub HD',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/40',
      bgColor: 'hover:bg-amber-500/15',
      url: `https://hianime.to/search?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Top-rated high-speed HD streaming with both Subtitled and Dubbed audio tracks',
    },
    {
      id: 'animepahe',
      name: 'AnimePahe',
      badge: 'Fast 1080p',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/40',
      bgColor: 'hover:bg-rose-500/15',
      url: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Ultra-compressed small-file encodes with rapid buffer-free 1080p/720p playback',
    },
    {
      id: 'gogoanime',
      name: 'GogoAnime',
      badge: 'Direct Stream',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-500/40',
      bgColor: 'hover:bg-cyan-500/15',
      url: `https://anitaku.pe/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Global anime archive with complete episode index and multiple backup mirrors',
    },
    {
      id: 'crunchyroll',
      name: 'Crunchyroll',
      badge: 'Official',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-500/40',
      bgColor: 'hover:bg-orange-500/15',
      url: `https://www.crunchyroll.com/search?q=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Licensed simulcast releases with official localization and pristine audio quality',
    },
  ];

  // Full Directory from awesome-anime-sources
  const streamingSources = [
    {
      id: 'aniwatch',
      name: 'HiAnime / AniWatch (Zoro)',
      badge: 'Free HD Sub/Dub',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-300',
      url: `https://hianime.to/search?keyword=${encodeURIComponent(cleanSearchTitle)}`,
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
          {/* Main Visual Player Frame */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl">
              {playerMode === 'stream' ? (
                /* 1. In-App VidLink Episode Player */
                <iframe
                  key={`vidlink-ep-${activeEpisode}`}
                  src={vidlinkStreamUrl}
                  title={`${anime.title} - Episode ${activeEpisode}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : playerMode === 'trailer' ? (
                /* 2. Official HD Embedded Video Player */
                <iframe
                  key="official-player"
                  src={officialTrailerEmbed}
                  title={`${anime.title} - Official Video Stream`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                /* 3. Interactive Episode Stream Deck */
                <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-slate-950">
                  {/* Background backdrop with cyberpunk styling */}
                  <img
                    src={anime.bannerUrl || anime.coverUrl}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-slate-950/80 to-[#0c1017]/90" />

                  {/* Header HUD inside player */}
                  <div className="relative z-10 flex items-center justify-between text-xs font-mono">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
                      EPISODE {activeEpisode} READY TO STREAM
                    </span>
                    <button
                      type="button"
                      onClick={() => setPlayerMode('stream')}
                      className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Return to In-App Player
                    </button>
                  </div>

                  {/* Center Action */}
                  <div className="relative z-10 text-center my-auto space-y-2">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">
                      Stream {anime.title} - Episode {activeEpisode}
                    </h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Select your preferred high-speed streaming server below to launch buffer-free playback with Sub & Dub options:
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <a
                        href={`https://hianime.to/search?keyword=${encodeURIComponent(cleanSearchTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/30 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Stream Ep {activeEpisode} on HiAnime</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Stream Ep {activeEpisode} on AnimePahe</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="relative z-10 flex items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 1080p / 720p HD
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Multi-Audio Sub/Dub
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" /> Fast CDN
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mode Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-400">
                <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-slate-300">STREAM SERVER:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPlayerMode('stream')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playerMode === 'stream'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${playerMode === 'stream' ? 'fill-black' : ''}`} />
                  <span>Episode {activeEpisode} Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode('trailer')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playerMode === 'trailer'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Official Trailer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode('sources')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    playerMode === 'sources'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>External Hub</span>
                </button>
              </div>
            </div>

            {/* Quick 1-Click Launchers for Selected Episode */}
            <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 text-[11px] font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span>Fast Direct Streamers for Ep {activeEpisode}:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href={`https://hianime.to/search?keyword=${encodeURIComponent(cleanSearchTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <span>HiAnime (Zoro)</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={`https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <span>AnimePahe</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={`https://anitaku.pe/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <span>GogoAnime</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
                <a
                  href={vidlinkStreamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 text-[11px] font-semibold transition-all flex items-center gap-1"
                >
                  <span>Open Stream in Tab</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Episode Grid / Selector */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Select Episode ({totalEps} Available):
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">
                  Selected: Episode {activeEpisode}
                </span>
              </div>

              {/* Fast 1-Click Streamers for Selected Episode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {episodeStreamServers.map((st) => (
                  <a
                    key={st.id}
                    href={st.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border ${st.borderColor} ${st.bgColor} transition-all text-xs cursor-pointer group shadow-sm`}
                    title={`Watch Episode ${activeEpisode} on ${st.name}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {st.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${st.borderColor} ${st.textColor} bg-black/40`}>
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {st.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 group-hover:bg-cyan-500 group-hover:text-black text-slate-300 transition-colors flex-shrink-0 font-bold text-[11px]">
                      <span>Play Ep {activeEpisode}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Episode Number Badges */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-mono text-slate-500">
                  CLICK EPISODE TO SWITCH PLAY TARGET:
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/30">
                  {epArray.map((epNum) => (
                    <button
                      key={epNum}
                      type="button"
                      onClick={() => {
                        setActiveEpisode(epNum);
                        if (playerMode === 'trailer') setPlayerMode('stream');
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

          {/* Verified Stream Sources Directory (awesome-anime-sources) */}
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
