import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Zap, 
  Settings, 
  Tv, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { formatSecondsToTime } from '../services/animeStreamApi';

/**
 * High-Performance Native Anime HLS Video Player
 * - Native HTML5 video with Hls.js engine
 * - Zero iframes, zero ads, zero redirects, zero popups
 * - Smart AniSkip intro & outro skipping overlays
 * - Multi-quality stream selection & custom playback speed
 * - Keyboard shortcuts: Space (Play/Pause), Left/Right (10s seek), F (Fullscreen), M (Mute)
 */
export default function AnimeNativePlayer({
  streamUrl,
  title,
  episode,
  isDub,
  skipTimes,
  onNextEpisode,
  hasNextEpisode,
  posterUrl,
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or re-initialize Hls.js when streamUrl changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMsg(null);

    // Destroy existing Hls instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!streamUrl) {
      setIsLoading(false);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        // Autoplay attempt
        video.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, recovering...', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, recovering...', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error:', data);
              hls.destroy();
              setErrorMsg('Stream failed to load. Try switching servers.');
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS support
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
    } else {
      // Standard video format fallback
      video.src = streamUrl;
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl]);

  // Video time and buffer updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered(bufferedEnd);
      }
    };

    const handleDurationChange = () => {
      setDuration(video.duration || 0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      if (hasNextEpisode && onNextEpisode) {
        onNextEpisode();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [hasNextEpisode, onNextEpisode]);

  // Handle Fullscreen state change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid intercepting if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Auto-hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const seekRelative = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), duration);
  };

  const handleSeekChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume || 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleSpeedSelect = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
    setShowSpeedMenu(false);
  };

  // AniSkip checks:
  const isInsideOp = skipTimes?.op && currentTime >= skipTimes.op.startTime && currentTime <= skipTimes.op.endTime;
  const isInsideEd = skipTimes?.ed && currentTime >= skipTimes.ed.startTime && currentTime <= skipTimes.ed.endTime;

  const handleSkipIntro = () => {
    const video = videoRef.current;
    if (video && skipTimes?.op?.endTime) {
      video.currentTime = skipTimes.op.endTime + 0.5;
    }
  };

  const handleSkipOutro = () => {
    const video = videoRef.current;
    if (video && skipTimes?.ed?.endTime) {
      video.currentTime = skipTimes.ed.endTime + 0.5;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full h-full bg-black select-none overflow-hidden group flex flex-col justify-center"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin shadow-lg shadow-cyan-500/50" />
          <span className="mt-3 text-xs font-mono text-cyan-300 font-bold tracking-widest animate-pulse">
            BUFFERING SECURE HLS STREAM...
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
          <h4 className="text-sm font-bold text-white mb-1">Playback Error</h4>
          <p className="text-xs text-slate-300 max-w-sm mb-4">{errorMsg}</p>
        </div>
      )}

      {/* Smart AniSkip Skip Buttons Overlay */}
      {isInsideOp && (
        <div className="absolute top-4 right-4 z-30 animate-bounce">
          <button
            type="button"
            onClick={handleSkipIntro}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/50 border border-cyan-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Skip Intro ({formatSecondsToTime(skipTimes.op.startTime)} - {formatSecondsToTime(skipTimes.op.endTime)})</span>
          </button>
        </div>
      )}

      {isInsideEd && (
        <div className="absolute top-4 right-4 z-30 animate-bounce">
          <button
            type="button"
            onClick={handleSkipOutro}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/50 border border-amber-300 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-black text-black" />
            <span>Skip Outro ({formatSecondsToTime(skipTimes.ed.startTime)} - {formatSecondsToTime(skipTimes.ed.endTime)})</span>
          </button>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 pt-12 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Bar / Scrubber */}
        <div className="relative flex items-center mb-2.5 group/scrub">
          {/* Buffer Bar */}
          <div
            className="absolute left-0 h-1 sm:h-1.5 bg-cyan-900/60 rounded-full pointer-events-none transition-all"
            style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
          />
          {/* Played Progress Bar */}
          <div
            className="absolute left-0 h-1 sm:h-1.5 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full pointer-events-none transition-all shadow-sm shadow-cyan-400"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            className="w-full h-1 sm:h-1.5 appearance-none bg-white/20 rounded-full cursor-pointer accent-cyan-400 hover:h-2 transition-all"
          />
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center justify-between gap-2 text-white font-mono text-xs">
          {/* Left Controls: Play/Pause, Seek, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-xl bg-cyan-500 text-black hover:bg-cyan-400 active:scale-90 transition-all cursor-pointer shadow-md shadow-cyan-500/40"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={() => seekRelative(-10)}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Rewind 10s (Left Arrow)"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={() => seekRelative(10)}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Forward 10s (Right Arrow)"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-12 sm:w-16 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-cyan-400 hidden sm:inline"
              />
            </div>

            {/* Time Stamp */}
            <div className="text-[10px] sm:text-xs text-slate-300 pl-1">
              <span className="text-cyan-300 font-bold">{formatSecondsToTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span>{formatSecondsToTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Audio Badge, Speed, Next Episode, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sub / Dub Indicator Badge */}
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider hidden xs:inline ${
                isDub ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {isDub ? 'ENG DUB' : 'JP SUB'}
            </span>

            {/* Speed Selector Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[10px] font-bold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl backdrop-blur-md flex flex-col min-w-[70px] z-50">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedSelect(spd)}
                      className={`px-3 py-1 text-[11px] text-left hover:bg-cyan-500/20 cursor-pointer font-bold ${
                        playbackSpeed === spd ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-300'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 sm:p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
