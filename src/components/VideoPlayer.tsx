import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, ShieldCheck } from 'lucide-react';
import Hls from 'hls.js';
import { VideoItem } from '../types';
import { ThumbSniperOverlay } from './ThumbSniperOverlay';
import { ResumePlaybackOverlay } from './ResumePlaybackOverlay';

interface VideoPlayerProps {
  video: VideoItem;
  onPitchReached?: () => void;
  isSimulatedSalesPage?: boolean;
  className?: string;
  forceShowResumePrompt?: boolean; // Permite pré-visualizar o card no editor
  previewMode?: 'normal' | 'autoplay' | 'resume' | 'thumbsniper';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onPitchReached,
  isSimulatedSalesPage = false,
  className = '',
  forceShowResumePrompt = false,
  previewMode = 'normal',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(video.settings.smartAutoplay);
  const [showAutoplayBanner, setShowAutoplayBanner] = useState(video.settings.smartAutoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 537);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [pitchTriggered, setPitchTriggered] = useState(false);
  const [useBunnyEmbedFallback, setUseBunnyEmbedFallback] = useState(false);

  // Resume Playback (Continuar assistindo) State
  const [showResumePrompt, setShowResumePrompt] = useState(forceShowResumePrompt);
  const [savedSeconds, setSavedSeconds] = useState(145); // default preview 2m25s
  const showResumePromptRef = useRef(forceShowResumePrompt);
  showResumePromptRef.current = showResumePrompt;

  const primaryColor = video.settings.primaryColor || '#E11D48';

  const libraryId = video.bunnyLibraryId || '802485';
  const videoId =
    video.bunnyVideoId ||
    (video.videoUrl.match(/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/) || [])[1] ||
    'e0f24211-791e-4a84-99e9-1ac03bc1b5b7';

  const isBunny =
    video.videoUrl.includes('b-cdn.net') ||
    video.videoUrl.includes('mediadelivery.net') ||
    video.bunnyVideoId !== undefined;

  const isHlsUrl =
    video.videoType === 'hls' ||
    (video.videoUrl && (video.videoUrl.includes('.m3u8') || video.videoUrl.includes('mediadelivery.net')));

  // Check saved playback progress in localStorage on mount
  useEffect(() => {
    if (forceShowResumePrompt) {
      setShowResumePrompt(true);
      return;
    }

    if (video.settings.resumePlayback) {
      try {
        const saved = localStorage.getItem(`veloturb_time_${video.id}`);
        if (saved) {
          const parsed = parseFloat(saved);
          if (parsed > 5) {
            setSavedSeconds(parsed);
            setShowResumePrompt(true);
            return;
          }
        }
      } catch (e) {}
    }
  }, [video.id, video.settings.resumePlayback, forceShowResumePrompt]);

  // Initialize playback and HLS / MP4 loader
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || useBunnyEmbedFallback) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const startAutoplayIfNeeded = () => {
    // Don't autoplay if resume prompt is active
    if (showResumePromptRef.current) return;

    if (video.settings.smartAutoplay) {
      const vid = videoRef.current;
      if (vid) {
        vid.muted = true;
        setIsMuted(true);
        setShowAutoplayBanner(true);
        vid.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
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
        console.warn('[VeloTurb HLS Status]', data);
        if (data.fatal) {
          if (isBunny) {
            setUseBunnyEmbedFallback(true);
            setIsPlaying(true);
          } else {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        }
      });
    } else if (vid.canPlayType('application/vnd.apple.mpegurl')) {
      vid.src = video.videoUrl;
      vid.addEventListener('loadedmetadata', () => {
        startAutoplayIfNeeded();
      }, { once: true });
      vid.addEventListener('error', () => {
        if (isBunny) {
          setUseBunnyEmbedFallback(true);
          setIsPlaying(true);
        }
      });
    }
  } else if (video.videoUrl) {
    vid.src = video.videoUrl;
    startAutoplayIfNeeded();
  }

  return () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  };
}, [video.id, video.videoUrl, isHlsUrl, useBunnyEmbedFallback, isBunny, video.settings.smartAutoplay]);

// Handle time update and save progress to localStorage
const handleTimeUpdate = () => {
  const vid = videoRef.current;
  if (!vid) return;

  setCurrentTime(vid.currentTime);
  if (vid.duration && !isNaN(vid.duration)) {
    setDuration(vid.duration);
  }

  // Persist position for resume playback
  if (video.settings.resumePlayback && vid.currentTime > 3) {
    try {
      localStorage.setItem(`veloturb_time_${video.id}`, vid.currentTime.toString());
    } catch (e) {}
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

// Actions for Resume Playback Overlay
const handleResumeContinue = () => {
  setShowResumePrompt(false);
  showResumePromptRef.current = false;
  setShowAutoplayBanner(false);

  if (useBunnyEmbedFallback && iframeRef.current?.contentWindow) {
    try {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: savedSeconds }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
    } catch (e) {}
    setIsMuted(false);
    setIsPlaying(true);
    return;
  }

  const vid = videoRef.current;
  if (!vid) return;

  vid.currentTime = savedSeconds;
  vid.muted = false;
  setIsMuted(false);
  vid.play().then(() => setIsPlaying(true)).catch(() => {});

  // Check pitch trigger if saved time is past pitch
  const pitchSeconds = video.settings.pitchDelaySeconds || 0;
  if (pitchSeconds > 0 && savedSeconds >= pitchSeconds && !pitchTriggered) {
    setPitchTriggered(true);
    if (onPitchReached) onPitchReached();
  }
};

const handleResumeRestart = () => {
  setShowResumePrompt(false);
  showResumePromptRef.current = false;
  setShowAutoplayBanner(false);

  try {
    localStorage.removeItem(`veloturb_time_${video.id}`);
  } catch (e) {}

  if (useBunnyEmbedFallback && iframeRef.current?.contentWindow) {
    try {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: 0 }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
    } catch (e) {}
    setIsMuted(false);
    setIsPlaying(true);
    return;
  }

  const vid = videoRef.current;
  if (!vid) return;

  vid.currentTime = 0;
  vid.muted = false;
  setIsMuted(false);
  vid.play().then(() => setIsPlaying(true)).catch(() => {});
};

  const handleUnmuteClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (useBunnyEmbedFallback && iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: 0 }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
      } catch (err) {}
      setIsMuted(false);
      setShowAutoplayBanner(false);
      setIsPlaying(true);
      return;
    }

    const vid = videoRef.current;
    if (!vid) return;

    // Smart Autoplay hook: Reinicia do começo (00:00) com áudio!
    vid.currentTime = 0;
    vid.muted = false;
    setIsMuted(false);
    setShowAutoplayBanner(false);
    vid.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const handleVideoClick = () => {
    if (showResumePrompt) return;
    if (showAutoplayBanner) {
      handleUnmuteClick();
      return;
    }
    togglePlay();
  };

  const togglePlay = () => {
    if (useBunnyEmbedFallback && iframeRef.current?.contentWindow) {
      if (isPlaying) {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
        } catch (e) {}
        setIsPlaying(false);
      } else {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } catch (e) {}
        setIsPlaying(true);
      }
      return;
    }

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

  // Progress percentage calculation
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
    green: 'bg-[#65a30d] text-white shadow-lime-600/40 border border-[#84cc16]',
  }[video.settings.smartAutoplayTheme || 'yellow'] || 'bg-amber-400 text-slate-950 shadow-amber-500/30';

  const autoplayPositionClass = (() => {
    switch (video.settings.smartAutoplayPosition) {
      case 'center':
        return 'inset-0 items-center justify-center';
      case 'bottom':
        return 'bottom-8 inset-x-0 justify-center';
      case 'top_left':
        return 'top-4 left-4 justify-start';
      case 'top_right':
        return 'top-4 right-4 justify-end';
      case 'bottom_left':
        return 'bottom-8 left-4 justify-start';
      case 'bottom_right':
        return 'bottom-8 right-4 justify-end';
      case 'top':
      default:
        return 'top-4 inset-x-0 justify-center';
    }
  })();

  const autoplayShapeClass = (() => {
    switch (video.settings.smartAutoplayShape) {
      case 'square':
        return 'rounded-none px-6 py-3';
      case 'rounded':
        return 'rounded-xl px-5 py-2.5';
      case 'two_lines':
        return 'rounded-2xl px-6 py-3 flex-col text-center';
      case 'full_width':
        return 'rounded-none w-full max-w-full px-6 py-3 justify-center';
      case 'minimal':
        return 'rounded-lg px-3.5 py-1.5 text-xs';
      case 'pill':
      default:
        return 'rounded-full px-5 py-2.5';
    }
  })();

  const autoplayOpacityStyle = {
    opacity: (video.settings.smartAutoplayOpacity ?? 100) / 100,
  };

  const effectiveShowResume = previewMode === 'resume' || (previewMode === 'normal' && (forceShowResumePrompt || showResumePrompt));
  const effectiveShowAutoplay = previewMode === 'autoplay' || (previewMode === 'normal' && showAutoplayBanner && !effectiveShowResume);
  const effectiveShowThumbSniper = previewMode === 'thumbsniper' || (previewMode === 'normal' && !isPlaying && !effectiveShowAutoplay && !effectiveShowResume && (video.settings.thumbSniper?.enabled ?? true));

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
      {/* Resume Playback Prompt Overlay (matching image_8f1ffac5.png and image_fbf8f9ed.png) */}
      {effectiveShowResume && (
        <ResumePlaybackOverlay
          language={video.settings.resumePlaybackLanguage || 'pt'}
          customTitle={video.settings.resumePlaybackTitle}
          customContinueText={video.settings.resumePlaybackContinueText}
          customRestartText={video.settings.resumePlaybackRestartText}
          savedSeconds={savedSeconds}
          onContinue={handleResumeContinue}
          onRestart={handleResumeRestart}
        />
      )}

      {/* Smart Autoplay Banner Overlay (only when resume prompt is NOT active) */}
      {effectiveShowAutoplay && (
        <div className={`absolute z-30 flex px-4 pointer-events-auto ${autoplayPositionClass}`}>
          <button
            type="button"
            onClick={handleUnmuteClick}
            style={autoplayOpacityStyle}
            className={`font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-2xl transition-transform active:scale-95 animate-bounce cursor-pointer tracking-tight ${bannerThemeClasses} ${autoplayShapeClass}`}
          >
            <div className="flex items-center gap-2">
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
              <span className="whitespace-nowrap font-extrabold">
                {video.settings.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'}
              </span>
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 stroke-[2.5]" />
            </div>
            {video.settings.smartAutoplayShape === 'two_lines' && (
              <div className="text-[11px] opacity-90 font-medium">
                {video.settings.smartAutoplaySubtext || 'Clique aqui para ativar o áudio 🔊'}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Video Element OR Bunny Embed Fallback */}
      {useBunnyEmbedFallback ? (
        <div className="relative w-full h-full">
          <iframe
            ref={iframeRef}
            src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&loop=false&muted=true&preload=true&responsive=true`}
            title={video.title}
            className="w-full h-full border-0 absolute inset-0 bg-black pointer-events-none"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
          {/* Overlay de clique para pausar/retomar no modo Iframe Bunny */}
          <div
            onClick={handleVideoClick}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        </div>
      ) : (
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
      )}

      {/* Watermark Protection if enabled */}
      {video.settings.showWatermark && (
        <div className="absolute bottom-10 right-4 z-20 text-[10px] text-white/40 tracking-wider pointer-events-none flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>VeloTurb DRM • ID: {video.id}</span>
        </div>
      )}

      {/* Center Play Overlay OR ThumbSniper Overlay */}
      {effectiveShowThumbSniper ? (
        <ThumbSniperOverlay
          settings={video.settings.thumbSniper || { enabled: true, type: 'template', templateId: 'ts_01' }}
          onResume={handleVideoClick}
        />
      ) : !isPlaying && !effectiveShowAutoplay && !effectiveShowResume ? (
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
      ) : null}

      {/* Standard Bottom Controls Bar */}
      {!isProfessionalVSL && !useBunnyEmbedFallback && !showResumePrompt && (
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
