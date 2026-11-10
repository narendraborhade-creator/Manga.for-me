import React, { useState, useEffect, useRef } from 'react';
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
  Flame,
  Info,
  Zap,
  Volume2,
  Headphones,
  Clock,
  RotateCcw
} from 'lucide-react';
import { fetchAnimeSkipTimes, fetchAnimeStreams, formatSecondsToTime } from '../services/animeStreamApi';

export default function AnimeDetailModal({ anime, onClose }) {
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [isDub, setIsDub] = useState(false);
  const [playerMode, setPlayerMode] = useState('stream'); // 'stream' (default in-app player) | 'hub' | 'trailer'
  const [inAppServer, setInAppServer] = useState('server1'); // 'server1' (AnimeEmbed) | 'server2' (VidLink) | 'server3' (Mirror)
  const [skipTimes, setSkipTimes] = useState(null);
  const [loadingSkip, setLoadingSkip] = useState(false);
  const [streamDeck, setStreamDeck] = useState(null);
  const [activeServerId, setActiveServerId] = useState('hianime');
  const playerContainerRef = useRef(null);

  // Anti-redirect protection: intercepts rogue external redirect attempts
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      return (e.returnValue = '');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handlePlayInApp = (serverId = null) => {
    if (serverId === 'hianime' || serverId === 'allanime' || serverId === 'consumet') {
      setInAppServer('server1');
    } else if (serverId === 'kuhi' || serverId === 'anify') {
      setInAppServer('server2');
    } else if (serverId === 'anicli') {
      setInAppServer('server1');
    }
    setPlayerMode('stream');
    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

  // Fetch AniSkip intervals when malId or activeEpisode changes
  useEffect(() => {
    let isMounted = true;
    async function loadSkip() {
      setLoadingSkip(true);
      try {
        const data = await fetchAnimeSkipTimes(anime?.malId || anime?.id, activeEpisode);
        if (isMounted) setSkipTimes(data);
      } catch (e) {
        if (isMounted) setSkipTimes({ found: false, op: null, ed: null });
      } finally {
        if (isMounted) setLoadingSkip(false);
      }
    }
    if (anime) {
      loadSkip();
    }
    return () => { isMounted = false; };
  }, [anime?.malId, anime?.id, activeEpisode]);

  // Fetch Stream Servers when title, activeEpisode, or isDub changes
  useEffect(() => {
    let isMounted = true;
    async function loadStreams() {
      try {
        const data = await fetchAnimeStreams(anime?.title, activeEpisode, anime?.malId || anime?.id, isDub);
        if (isMounted && data) {
          setStreamDeck(data);
        }
      } catch (e) {
        console.warn('Anime stream loading warning:', e);
      }
    }
    if (anime?.title) {
      loadStreams();
    }
    return () => { isMounted = false; };
  }, [anime?.title, anime?.malId, anime?.id, activeEpisode, isDub]);

  if (!anime) return null;

  const cleanSearchTitle = (anime.title || '')
    .replace(/[:;!?\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const totalEps = Math.max(1, parseInt(anime.episodes, 10) || 12);
  const epArray = Array.from({ length: Math.min(totalEps, 150) }, (_, i) => i + 1);

  const dubSuffix = isDub ? ' (Dub)' : ' (Sub)';
  const dubSearch = isDub ? `${cleanSearchTitle} dub` : cleanSearchTitle;
  const titleSlug = cleanSearchTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const aniListId = anime.id;
  const malId = anime.malId || anime.id;
  const subDubParam = isDub ? 'dub' : 'sub';

  // Dedicated In-App Anime Players (VidLink Ultra primary with clean HLS & multi-audio, plus mirrors)
  const inAppServers = [
    {
      id: 'server1',
      name: 'Server 1 (VidLink Ultra)',
      badge: 'Ad-Free 1080p',
      url: `https://vidlink.pro/anime/${malId}/${activeEpisode}/${subDubParam}?fallback=true&primaryColor=06b6d4&secondaryColor=3b82f6`,
      directUrl: `https://vidlink.pro/anime/${malId}/${activeEpisode}/${subDubParam}?fallback=true`,
      speed: 'Direct HLS Stream',
    },
    {
      id: 'server2',
      name: 'Server 2 (VidLink Mirror)',
      badge: 'Dual Audio',
      url: `https://vidlink.pro/anime/${anime.id || malId}/${activeEpisode}/${subDubParam}?fallback=true`,
      directUrl: `https://vidlink.pro/anime/${anime.id || malId}/${activeEpisode}/${subDubParam}?fallback=true`,
      speed: 'Buffer-Free CDN',
    },
    {
      id: 'server3',
      name: 'Server 3 (AnimeEmbed Alt)',
      badge: 'Backup Mirror',
      url: `https://animeembed.com/embed/ani/${aniListId || malId}/${activeEpisode}?track=${subDubParam}`,
      directUrl: `https://animeembed.com/embed/ani/${aniListId || malId}/${activeEpisode}?track=${subDubParam}`,
      speed: 'Secondary Host',
    },
  ];

  const activeEmbedServer = inAppServers.find((s) => s.id === inAppServer) || inAppServers[0];
  const inAppEpisodeEmbed = activeEmbedServer.url;

  // Official Verified Video Stream (from AniList trailer)
  const officialTrailerEmbed = anime.trailerUrl || null;

  // Multi-server list combining streamDeck or default curated providers from the 6 architectures
  const episodeStreamServers = streamDeck?.servers || [
    {
      id: 'consumet',
      name: `Consumet API${dubSuffix}`,
      provider: 'Consumet (GogoAnime / Zoro / Pahe)',
      badge: 'REST (.m3u8)',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/40',
      bgColor: 'hover:bg-emerald-500/15',
      url: isDub
        ? `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle + ' (Dub)')}`
        : `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      streamUrl: isDub
        ? `https://anitaku.so/category/${titleSlug}-dub`
        : `https://anitaku.so/category/${titleSlug}`,
      directWatchUrl: isDub
        ? `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle + ' (Dub)')}`
        : `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Wraps Gogoanime, Zoro/HiAnime & AnimePahe with multi-quality HLS streams (360p-1080p)',
      quality: '1080p / 720p HLS',
      speed: 'Gold Standard',
    },
    {
      id: 'hianime',
      name: `HiAnime / MegaPlay API${dubSuffix}`,
      provider: 'HiAnime (HD-1 / HD-2 / MegaPlay)',
      badge: 'Decrypted HLS',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/40',
      bgColor: 'hover:bg-amber-500/15',
      url: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      streamUrl: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      directWatchUrl: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      desc: 'High-speed multi-host streaming (HD-1, HD-2, StreamSB, MegaPlay) with dual audio switching',
      quality: '1080p Ultra HD',
      speed: 'Ultra-Fast CDN',
    },
    {
      id: 'anify',
      name: 'Anify API Engine',
      provider: 'Anify (AniList + Gogo/Zoro/Pahe)',
      badge: 'REST Mapped',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-500/40',
      bgColor: 'hover:bg-indigo-500/15',
      url: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      streamUrl: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      directWatchUrl: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Combines metadata from AniList/MAL with streaming providers in a single request',
      quality: '1080p / 720p',
      speed: 'Direct Mapping',
    },
    {
      id: 'kuhi',
      name: `Kuhi Anime API${dubSuffix}`,
      provider: 'Kuhi API (AniList Direct Resolvers)',
      badge: 'AniList REST',
      textColor: 'text-teal-300',
      borderColor: 'border-teal-500/40',
      bgColor: 'hover:bg-teal-500/15',
      url: `https://animeembed.com/embed/ani/${malId || ''}/${activeEpisode}?track=${isDub ? 'dub' : 'sub'}`,
      streamUrl: `https://animeembed.com/embed/ani/${malId || ''}/${activeEpisode}?track=${isDub ? 'dub' : 'sub'}`,
      directWatchUrl: `https://animeembed.com/embed/ani/${malId || ''}/${activeEpisode}?track=${isDub ? 'dub' : 'sub'}`,
      desc: 'Lightweight API that accepts AniList IDs and returns playable stream sources & embeds',
      quality: '1080p HD',
      speed: 'Lightweight Express',
    },
    {
      id: 'allanime',
      name: `AllAnime GraphQL API${dubSuffix}`,
      provider: 'AllAnime Global',
      badge: 'GraphQL HLS',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/40',
      bgColor: 'hover:bg-purple-500/15',
      url: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      streamUrl: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      directWatchUrl: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      desc: 'Large library of subbed and dubbed anime with multi-bitrate HLS streams',
      quality: '1080p Multi-bitrate',
      speed: 'Multi-Host Mesh',
    },
    {
      id: 'anicli',
      name: `ani-cli Scraper Core${dubSuffix}`,
      provider: 'ani-cli (Raw HLS & Subtitle VTTs)',
      badge: 'Edge HLS',
      textColor: 'text-cyan-300',
      borderColor: 'border-cyan-500/40',
      bgColor: 'hover:bg-cyan-500/15',
      url: isDub
        ? `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle + ' (Dub)')}`
        : `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      streamUrl: isDub
        ? `https://anitaku.so/category/${titleSlug}-dub`
        : `https://anitaku.so/category/${titleSlug}`,
      directWatchUrl: isDub
        ? `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle + ' (Dub)')}`
        : `https://anitaku.so/search.html?keyword=${encodeURIComponent(cleanSearchTitle)}`,
      desc: 'Scrapes fast CDN edge streams directly without bloated browser overhead',
      quality: '1080p Raw Stream',
      speed: 'Zero Overhead',
    },
  ];

  const selectedServer = episodeStreamServers.find((s) => s.id === activeServerId) || episodeStreamServers[0];

  // Full Directory from awesome-anime-sources (All 6 core streaming architectures + metadata engines)
  const streamingSources = [
    {
      id: 'consumet',
      name: 'Consumet API (REST / Node.js)',
      badge: '.m3u8 HLS Streams',
      borderColor: 'border-emerald-500/40',
      textColor: 'text-emerald-300',
      url: `https://anitaku.so/search.html?keyword=${encodeURIComponent(dubSearch)}`,
      description: 'Gold standard for streaming apps. Wraps Gogoanime, Zoro/HiAnime, AnimePahe & Crunchyroll with multi-quality HLS & VTTs.',
    },
    {
      id: 'hianime',
      name: 'HiAnime / MegaPlay API',
      badge: 'Decrypted HLS & Embeds',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-300',
      url: `https://hianime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      description: 'Powers high-speed multi-host streaming (HD-1, HD-2, StreamSB, MegaPlay) with dual audio switching.',
    },
    {
      id: 'anify',
      name: 'Anify API',
      badge: 'Mapped Streams + Metadata',
      borderColor: 'border-indigo-500/40',
      textColor: 'text-indigo-300',
      url: `https://animepahe.ru/?q=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Combines metadata from AniList/MAL with streaming providers (Gogo, Zoro, AnimePahe) in a single request.',
    },
    {
      id: 'kuhi',
      name: 'Kuhi Anime API',
      badge: 'Direct Video & Embeds',
      borderColor: 'border-teal-500/40',
      textColor: 'text-teal-300',
      url: `https://animeembed.com/embed/ani/${malId || ''}/${activeEpisode}?track=${isDub ? 'dub' : 'sub'}`,
      description: 'Lightweight Express API that accepts AniList IDs and returns playable stream sources & embeds.',
    },
    {
      id: 'allanime',
      name: 'AllAnime API (GraphQL)',
      badge: 'Multi-Server HLS Links',
      borderColor: 'border-purple-500/40',
      textColor: 'text-purple-300',
      url: `https://allanime.to/search?keyword=${encodeURIComponent(dubSearch)}`,
      description: 'Large library of subbed and dubbed anime with multi-bitrate HLS streams.',
    },
    {
      id: 'anicli',
      name: 'ani-cli Scraper Core',
      badge: 'Raw Edge CDN Streams',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-300',
      url: isDub
        ? `https://anitaku.so/category/${titleSlug}-dub`
        : `https://anitaku.so/category/${titleSlug}`,
      description: 'Scrapes fast CDN edge streams directly without bloated browser overhead.',
    },
    {
      id: 'anilist',
      name: 'AniList GraphQL API',
      badge: 'Metadata & Posters',
      borderColor: 'border-cyan-500/40',
      textColor: 'text-cyan-300',
      url: `https://anilist.co/anime/${anime.id}`,
      description: 'Primary metadata engine providing high-res artwork, trending feeds, and episode schedules.',
    },
    {
      id: 'myanimelist',
      name: 'MyAnimeList / Jikan v4',
      badge: 'Global Community',
      borderColor: 'border-blue-500/40',
      textColor: 'text-blue-300',
      url: `https://myanimelist.net/anime.php?q=${encodeURIComponent(cleanSearchTitle)}`,
      description: 'Resolves MAL IDs, episode listings, character databases, and rankings.',
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
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className={`hidden md:inline px-1.5 py-0.5 rounded text-[9px] font-bold ${isDub ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}`}>
              {isDub ? 'ENGLISH DUB' : 'JAPANESE SUB'}
            </span>
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
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-cyan-500/40 scrollbar-track-transparent space-y-4 p-4 sm:p-6 md:p-8 pb-14 sm:pb-16"
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {/* Main Visual Player Frame */}
          <div ref={playerContainerRef} className="space-y-3">
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl flex flex-col">
              {playerMode === 'trailer' ? (
                /* 1. Official HD Embedded Video Player */
                officialTrailerEmbed ? (
                  <iframe
                    key="official-player"
                    src={officialTrailerEmbed}
                    title={`${anime.title} - Official Video Stream`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
                    <Film className="w-10 h-10 text-rose-400" />
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white">No Official Trailer Stream Provided</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        You can watch the full episode in the In-App Player or launch directly on streaming servers.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPlayerMode('stream')}
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs cursor-pointer hover:bg-cyan-400"
                      >
                        Watch In-App Player
                      </button>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(cleanSearchTitle + ' official trailer')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-white/20"
                      >
                        <span>Search on YouTube</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )
              ) : playerMode === 'stream' ? (
                /* 2. Direct In-App Episode Video Stream (Native Anime Stream Embeds, No YouTube Error 153) */
                <div className="relative w-full h-full flex flex-col bg-black">
                  {/* Top In-Player Server Switcher Header */}
                  <div className="relative z-20 flex flex-wrap items-center justify-between gap-1.5 px-3 py-2 bg-slate-950/95 border-b border-cyan-500/25 text-xs font-mono flex-shrink-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                        <MonitorPlay className="w-3.5 h-3.5" />
                        PLAYER:
                      </span>
                      {inAppServers.map((srv) => (
                        <button
                          key={srv.id}
                          type="button"
                          onClick={() => setInAppServer(srv.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                            inAppServer === srv.id
                              ? 'bg-cyan-500 text-black shadow-sm shadow-cyan-500/40'
                              : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {srv.name}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-white/10">
                        <button
                          type="button"
                          onClick={() => setIsDub(false)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            !isDub ? 'bg-cyan-500 text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sub
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDub(true)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                            isDub ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Dub
                        </button>
                      </div>

                      <a
                        href={activeEmbedServer.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 text-[10px] sm:text-[11px] font-bold transition-all"
                        title="Open video player directly in a new browser tab"
                      >
                        <span>Open Tab</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Main Iframe Player */}
                  <div className="relative flex-1 w-full h-full min-h-0 bg-black">
                    <iframe
                      key={`episode-stream-${inAppServer}-${activeEpisode}-${isDub ? 'dub' : 'sub'}`}
                      src={inAppEpisodeEmbed}
                      title={`${anime.title} - Episode ${activeEpisode} Stream`}
                      className="w-full h-full border-0"
                      {...(inAppServer !== 'server3' ? { sandbox: 'allow-scripts allow-same-origin allow-forms allow-presentation' } : {})}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : (
                /* 3. Cyberpunk High-Speed Streaming Deck & Smart Player */
                <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-slate-950">
                  {/* Background backdrop with poster styling */}
                  <img
                    src={anime.bannerUrl || anime.coverUrl}
                    alt={anime.title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1017] via-slate-950/90 to-[#0c1017]/90" />

                  {/* Header HUD inside player */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                        <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
                        EPISODE {activeEpisode} STREAM DECK
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDub ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'}`}>
                        {isDub ? 'ENGLISH DUB' : 'JAPANESE SUB'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPlayerMode('stream')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <Film className="w-3 h-3" />
                      <span>Switch to In-App Player</span>
                    </button>
                  </div>

                  {/* Center Action */}
                  <div className="relative z-10 text-center my-auto space-y-3 max-w-xl mx-auto">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
                        awesome-anime-sources // multi-server pipeline
                      </span>
                      <h3 className="text-lg sm:text-2xl font-extrabold text-white font-['Outfit'] mt-0.5">
                        {anime.title} — Episode {activeEpisode}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
                        Select your preferred audio feed and high-speed streaming server below for instant 1080p playback:
                      </p>
                    </div>

                    {/* Dual Audio Switcher in Player Deck */}
                    <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 shadow-inner">
                      <button
                        type="button"
                        onClick={() => setIsDub(false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !isDub
                            ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Sub (Japanese)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsDub(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isDub
                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5" />
                        <span>English Dub</span>
                      </button>
                    </div>

                    {/* AniSkip Smart Player HUD */}
                    {skipTimes && (skipTimes.op || skipTimes.ed) ? (
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                        {skipTimes.op && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                            <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                            <span>OP INTRO: {formatSecondsToTime(skipTimes.op.startTime)} - {formatSecondsToTime(skipTimes.op.endTime)} ({skipTimes.op.duration}s)</span>
                          </div>
                        )}
                        {skipTimes.ed && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[11px] font-mono">
                            <Clock className="w-3 h-3 text-purple-400" />
                            <span>ED OUTRO: {formatSecondsToTime(skipTimes.ed.startTime)} - {formatSecondsToTime(skipTimes.ed.endTime)} ({skipTimes.ed.duration}s)</span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Primary Direct Streamers */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handlePlayInApp()}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Play In-App (Episode {activeEpisode})</span>
                      </button>
                      <a
                        href={selectedServer.directWatchUrl || selectedServer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Open on {selectedServer.name}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Footer status */}
                  <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 1080p Ultra HD
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Dual Audio Sub & Dub
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" /> AniSkip OP/ED Ready
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mode & Audio Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                  <MonitorPlay className="w-3.5 h-3.5 text-cyan-400" />
                  VIEW MODE:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPlayerMode('stream')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerMode === 'stream'
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>In-App Player</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerMode('hub')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerMode === 'hub'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>Stream Deck</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerMode('trailer')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      playerMode === 'trailer'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>Trailer</span>
                  </button>
                </div>
              </div>

              {/* Audio Track Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">AUDIO:</span>
                <button
                  type="button"
                  onClick={() => setIsDub(false)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    !isDub
                      ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Sub (JP)
                </button>
                <button
                  type="button"
                  onClick={() => setIsDub(true)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    isDub
                      ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Dub (EN)
                </button>
              </div>
            </div>

            {/* Smart AniSkip Notification Badge */}
            {skipTimes?.found && (
              <div className="p-2 px-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-cyan-300 text-[11px] font-mono">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span className="font-bold">ANISKIP INTRO / OUTRO DETECTION:</span>
                  {skipTimes.op && (
                    <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                      Intro: {formatSecondsToTime(skipTimes.op.startTime)} - {formatSecondsToTime(skipTimes.op.endTime)}
                    </span>
                  )}
                  {skipTimes.ed && (
                    <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                      Outro: {formatSecondsToTime(skipTimes.ed.startTime)} - {formatSecondsToTime(skipTimes.ed.endTime)}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Millisecond Precision
                </span>
              </div>
            )}

            {/* Episode Grid / Selector */}
            <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  Select Episode ({totalEps} Available):
                </span>
                <span className="text-[11px] text-cyan-400 font-semibold">
                  Playing: Ep {activeEpisode} • {isDub ? 'English Dub' : 'Japanese Sub'}
                </span>
              </div>

              {/* Fast In-App Streamers & Multi-Source Deck for Selected Episode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {episodeStreamServers.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => handlePlayInApp(st.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border ${
                      activeServerId === st.id ? 'border-cyan-400/80 shadow-md shadow-cyan-950/40' : (st.borderColor || 'border-white/10')
                    } ${st.bgColor || 'hover:bg-slate-800'} transition-all text-xs cursor-pointer group`}
                    title={`Play Episode ${activeEpisode} on ${st.name}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                          {st.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${st.borderColor || 'border-cyan-500/40'} ${st.textColor || 'text-cyan-300'} bg-black/40`}>
                          {st.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {st.desc}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayInApp(st.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-black" />
                        <span>Play Ep {activeEpisode}</span>
                      </button>
                      <a
                        href={st.directWatchUrl || st.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
                        title={`Open ${st.name} external mirror`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
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
                        handlePlayInApp();
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
