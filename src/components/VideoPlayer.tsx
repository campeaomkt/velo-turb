import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ShieldCheck } from 'lucide-react';
import Hls from 'hls.js';
import { VideoItem } from '../types';
import { ThumbSniperOverlay } from './ThumbSniperOverlay';

interface VideoPlayerProps {
  video: VideoItem;
  onPitchReached?: () => void;
  isSimulatedSalesPage?: boolean;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onPitchReached,
  isSimulatedSalesPage = false,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(video.settings.smartAutoplay);
  const [showAutoplayBanner, setShowAutoplayBanner] = useState(video.settings.smartAutoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 100);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [pitchTriggered, setPitchTriggered] = useState(false);

  const primaryColor = video.settings.primaryColor || '#E11D48';

  // Determine if stream is HLS
  const isHlsUrl =
    video.videoType === 'hls' ||
    (video.videoUrl && (video.videoUrl.includes('.m3u8') || video.videoUrl.includes('mediadelivery.net')));

  // Initialize playback and HLS / MP4 loader
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    // Cleanup previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const startAutoplayIfNeeded = () => {
      if (video.settings.smartAutoplay) {
        vid.muted = true;
        setIsMuted(true);
        setShowAutoplayBanner(true);
        vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    };

    if (isHlsUrl && video.videoUrl) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          capLevelToPlayerSize: true,
          maxBufferLength: 30,
          enableWorker: true,
        });
        hlsRef.current = hls;

        hls.loadSource(video.videoUrl);
        hls.attachMedia(vid);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          startAutoplayIfNeeded();
        });

        hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
          if (data?.details?.totalduration && !isNaN(data.details.totalduration)) {
            setDuration(data.details.totalduration);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.warn('[VeloTurb HLS Error]', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('[VeloTurb] Tentando recuperar de erro de rede HLS...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('[VeloTurb] Tentando recuperar de erro de mídia HLS...');
                hls.recoverMediaError();
                break;
              default:
                console.error('[VeloTurb] Erro fatal irrecuperável HLS:', data);
                hls.destroy();
                break;
            }
          }
        });
      } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari / iOS support
        vid.src = video.videoUrl;
        vid.addEventListener('loadedmetadata', () => {
          startAutoplayIfNeeded();
        }, { once: true });
      }
    } else if (video.videoUrl) {
      // Standard MP4
      vid.src = video.videoUrl;
      startAutoplayIfNeeded();
    }

    // Resume playback if enabled
    if (video.settings.resumePlayback) {
      const saved = localStorage.getItem(`veloturb_time_${video.id}`);
      if (saved && parseFloat(saved) > 5) {
        vid.currentTime = parseFloat(saved);
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [video.id, video.videoUrl, isHlsUrl, video.settings.smartAutoplay, video.settings.resumePlayback]);

  // Handle time update
  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid) return;

    setCurrentTime(vid.currentTime);
    if (vid.duration && !isNaN(vid.duration)) {
      setDuration(vid.duration);
    }

    if (video.settings.resumePlayback) {
      try {
        localStorage.setItem(`veloturb_time_${video.id}`, vid.currentTime.toString());
      } catch (e) {
        // ignore storage errors
      }
    }

    // Check pitch delay trigger
    const pitchSeconds = video.settings.pitchDelaySeconds || 0;
    if (pitchSeconds > 0 && vid.currentTime >= pitchSeconds && !pitchTriggered) {
      setPitchTriggered(true);
      if (onPitchReached) {
        onPitchReached();
      }
    }
  };

  const handleUnmuteClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    // Smart Autoplay hook: Restart from beginning (00:00) with audio enabled!
    vid.currentTime = 0;
    vid.muted = false;
    setIsMuted(false);
    setShowAutoplayBanner(false);
    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise.then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleVideoClick = () => {
    // If the video is running muted in Smart Autoplay teaser mode, clicking anywhere unmutes & restarts from 0
    if (isMuted || showAutoplayBanner) {
      handleUnmuteClick();
      return;
    }
    togglePlay();
  };

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid) return;

    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      if (video.settings.allowPause) {
        vid.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
    if (!vid.muted) setShowAutoplayBanner(false);
  };

  const handleSpeedChange = () => {
    const vid = videoRef.current;
    if (!vid) return;

    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    vid.playbackRate = newSpeed;
    setSpeed(newSpeed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Progress percentage calculation (supports fake progress bar!)
  const actualPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const progressPercent = video.settings.fakeProgressBar
    ? Math.min(100, Math.pow(actualPercent / 100, 0.55) * 100)
    : actualPercent;

  const isProfessionalVSL = video.settings.onlyProgressBar || video.settings.hideControls;

  const bannerThemeClasses = {
    yellow: 'bg-amber-400 text-slate-950 shadow-amber-500/30',
    black: 'bg-slate-950 text-white shadow-black/50 border border-slate-700',
    red: 'bg-rose-600 text-white shadow-rose-600/40',
    purple: 'bg-violet-600 text-white shadow-violet-600/40',
  }[video.settings.smartAutoplayTheme || 'yellow'];

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        if (video.settings.antiDownload) e.preventDefault();
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl select-none group ${className}`}
    >
      {/* Smart Autoplay Banner Overlay */}
      {showAutoplayBanner && (
        <div className="absolute top-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-auto">
          <button
            type="button"
            onClick={handleUnmuteClick}
            className={`px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl transition-transform active:scale-95 animate-bounce cursor-pointer tracking-tight ${bannerThemeClasses}`}
          >
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
            <span className="whitespace-nowrap font-extrabold">
              {video.settings.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'}
            </span>
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        poster={video.thumbnailUrl}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => {
          const d = (e.target as HTMLVideoElement).duration;
          if (d && !isNaN(d)) setDuration(d);
        }}
        onDurationChange={(e) => {
          const d = (e.target as HTMLVideoElement).duration;
          if (d && !isNaN(d)) setDuration(d);
        }}
        onEnded={() => setIsPlaying(false)}
        onClick={handleVideoClick}
        className="w-full h-full object-contain cursor-pointer bg-black"
      />

      {/* Watermark Protection if enabled */}
      {video.settings.showWatermark && (
        <div className="absolute bottom-10 right-4 z-20 text-[10px] text-white/40 tracking-wider pointer-events-none flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>VeloTurb DRM • ID: {video.id}</span>
        </div>
      )}

      {/* Center Play Overlay OR ThumbSniper Overlay when paused */}
      {!isPlaying && !showAutoplayBanner && (
        (video.settings.thumbSniper?.enabled ?? true) ? (
          <ThumbSniperOverlay
            settings={video.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' }}
            onResume={handleVideoClick}
          />
        ) : (
          <div
            onClick={handleVideoClick}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 cursor-pointer backdrop-blur-[2px] transition-opacity"
          >
            <div
              style={{ backgroundColor: primaryColor }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
            </div>
          </div>
        )
      )}

      {/* Standard Bottom Controls Bar - HIDDEN in Professional VSL Mode! */}
      {!isProfessionalVSL && (
        <div
          className={`absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-8 pb-2 px-4 transition-opacity duration-200 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between text-white text-xs mb-2">
            <div className="flex items-center gap-3">
              {video.settings.allowPause && (
                <button
                  type="button"
                  onClick={togglePlay}
                  className="hover:text-rose-400 transition-colors p-1 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                </button>
              )}

              <button
                type="button"
                onClick={toggleMute}
                className="hover:text-rose-400 transition-colors p-1 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="font-mono text-[11px] text-white/80 tabular-nums">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {video.settings.speedControl && (
                <button
                  type="button"
                  onClick={handleSpeedChange}
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 font-mono text-[11px] transition-colors cursor-pointer"
                >
                  {speed}x
                </button>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className="hover:text-rose-400 transition-colors p-1 cursor-pointer"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High-Converting Custom Progress Bar */}
      <div
        className="absolute bottom-0 inset-x-0 h-1.5 bg-white/20 z-20 cursor-pointer overflow-hidden"
        onClick={(e) => {
          if (video.settings.hideControls) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickPos = (e.clientX - rect.left) / rect.width;
          if (videoRef.current && duration) {
            videoRef.current.currentTime = clickPos * duration;
          }
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            backgroundColor: primaryColor,
          }}
          className="h-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(225,29,72,0.8)]"
        />
      </div>
    </div>
  );
};
