import React, { useState } from 'react';
import { Copy, Check, X, Info, AlertTriangle, Server, CheckCircle2, Volume2, VolumeX, Sparkles, Code, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { detectAndNormalizeVideoUrl, DEFAULT_BUNNY_CDN_HOSTNAME } from '../utils/urlDetector';

interface EmbedCodeModalProps {
  video: VideoItem;
  isOpen: boolean;
  onClose: () => void;
  onOpenSimulator?: () => void;
}

export const EmbedCodeModal: React.FC<EmbedCodeModalProps> = ({
  video,
  isOpen,
  onClose,
  onOpenSimulator,
}) => {
  const [embedMode, setEmbedMode] = useState<'short' | 'inline' | 'iframe'>('short');
  const [isResponsive, setIsResponsive] = useState(false);
  const [optimizeSpeed, setOptimizeSpeed] = useState(true);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedHead, setCopiedHead] = useState(false);

  // Dynamic origin calculation with fallback to current window location
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.veloturb.com';
  const primaryColor = video.settings.primaryColor || '#E11D48';

  // Normalize source URL to avoid any blob: or localhost issues
  const [videoSourceUrl, setVideoSourceUrl] = useState<string>(() => {
    if (video.videoUrl?.startsWith('blob:')) {
      return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    }
    if (video.videoUrl?.startsWith('/')) {
      return `${origin}${video.videoUrl}`;
    }
    return video.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  });

  // State to edit Smart Autoplay Banner Text & Theme (matching image_80c31181.png)
  const [autoplayText, setAutoplayText] = useState<string>(
    video.settings.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'
  );
  const [autoplayTheme, setAutoplayTheme] = useState<'yellow' | 'black' | 'red' | 'purple' | 'green'>(
    video.settings.smartAutoplayTheme || 'yellow'
  );

  const bannerColors = {
    yellow: { bg: '#FACC15', text: '#000000', border: '#EAB308', name: 'Amarelo Atenção' },
    black: { bg: '#09090B', text: '#FFFFFF', border: '#27272A', name: 'Preto Elegante' },
    red: { bg: '#E11D48', text: '#FFFFFF', border: '#BE123C', name: 'Vermelho Urgência' },
    purple: { bg: '#8B5CF6', text: '#FFFFFF', border: '#7C3AED', name: 'Roxo VIP' },
    green: { bg: '#65A30D', text: '#FFFFFF', border: '#4D7C0F', name: 'Verde Oliva' },
  }[autoplayTheme] || { bg: '#FACC15', text: '#000000', border: '#EAB308', name: 'Amarelo Atenção' };

  if (!isOpen) return null;

  const isBlob = video.videoUrl?.startsWith('blob:');
  const isHls = videoSourceUrl.includes('.m3u8') || video.videoType === 'hls';

  // Autoplay settings from video
  const autoplayShape = video.settings.smartAutoplayShape || 'pill';
  const autoplayPosition = video.settings.smartAutoplayPosition || 'top';
  const autoplayOpacity = video.settings.smartAutoplayOpacity ?? 100;
  const autoplaySubtext = video.settings.smartAutoplaySubtext || '';

  // ThumbSniper settings
  const tsConfig = video.settings.thumbSniper;
  const isSpanishTs = tsConfig?.language === 'es' || ['ts_05', 'ts_06', 'ts_07', 'ts_08'].includes(tsConfig?.templateId || '') || video.settings.resumePlaybackLanguage === 'es';
  const tsHeadline = tsConfig?.headline || (isSpanishTs ? '¡Este video saldrá del aire pronto!' : 'Este vídeo ficará fora do ar em breve!');
  const tsSubheadline = tsConfig?.subheadline || (isSpanishTs ? 'Esta es tu última oportunidade de verlo hasta el final.' : 'Essa é sua última chance de assistir até o final.');
  const tsButtonText = tsConfig?.buttonText || (isSpanishTs ? 'CONTINUAR VIENDO' : 'CONTINUAR ASSISTINDO');
  const tsButtonColor = tsConfig?.buttonColor || '#EF4444';

  const autoplayPosStyle = (() => {
    switch (autoplayPosition) {
      case 'center': return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
      case 'bottom': return 'bottom: 24px; left: 50%; transform: translateX(-50%);';
      case 'top_left': return 'top: 14px; left: 16px; transform: none;';
      case 'top_right': return 'top: 14px; right: 16px; transform: none;';
      case 'bottom_left': return 'bottom: 24px; left: 16px; transform: none;';
      case 'bottom_right': return 'bottom: 24px; right: 16px; transform: none;';
      case 'top':
      default: return 'top: 14px; left: 50%; transform: translateX(-50%);';
    }
  })();

  const autoplayBorderRadius = (() => {
    switch (autoplayShape) {
      case 'square': return '0px';
      case 'rounded': return '12px';
      case 'two_lines': return '14px';
      case 'full_width': return '0px';
      case 'minimal': return '8px';
      case 'pill':
      default: return '9999px';
    }
  })();

  const isFullWidthAutoplay = autoplayShape === 'full_width';

  // Format 1: Ultra-clean short embed code com isolamento total para nunca quebrar botões ou layout flex da PV
  const shortEmbedCode = `<div style="display: block; width: 100%; max-width: 100%; margin: 0 auto 20px auto; clear: both; flex: 0 0 100%;">
  <div id="veloturb-${video.id}" data-video-id="${video.id}" data-src="${videoSourceUrl}" data-type="${isHls ? 'hls' : 'mp4'}" data-bunny-library-id="${video.bunnyLibraryId || '802485'}" data-bunny-video-id="${video.bunnyVideoId || 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7'}" data-poster="${video.thumbnailUrl || ''}" data-pitch-delay="${video.settings.pitchDelaySeconds || 500}" data-primary-color="${primaryColor}" data-autoplay-text="${autoplayText}" data-autoplay-theme="${autoplayTheme}" data-autoplay-shape="${autoplayShape}" data-autoplay-pos="${autoplayPosition}" data-autoplay-opacity="${autoplayOpacity}" data-autoplay-subtext="${encodeURIComponent(autoplaySubtext)}" data-resume="${video.settings.resumePlayback !== false ? 'true' : 'false'}" data-resume-lang="${video.settings.resumePlaybackLanguage || 'pt'}" data-thumbsniper-enabled="${tsConfig?.enabled !== false ? 'true' : 'false'}" data-thumbsniper-template="${tsConfig?.templateId || 'ts_01'}" data-thumbsniper-headline="${encodeURIComponent(tsHeadline)}" data-thumbsniper-subheadline="${encodeURIComponent(tsSubheadline)}" data-thumbsniper-button="${encodeURIComponent(tsButtonText)}" data-thumbsniper-color="${tsButtonColor}" data-thumbsniper-custom="${tsConfig?.customMediaUrl || ''}" data-thumbsniper-lang="${isSpanishTs ? 'es' : 'pt'}" style="display: block; width: 100%; max-width: 100%; margin: 0 auto; clear: both; position: relative;"></div>
</div>
<script src="${origin}/player.js?v=2.5.0" async></script>`;

  // Format 2: Self-contained Inline JavaScript with Hls.js loader, Smart Autoplay & ThumbSniper
  const inlineJsEmbedCode = `<veloturb-smartplayer id="vid-${video.id}" style="display: block; margin: 0 auto; width: 100%; max-width: 100%;">
  <div class="veloturb-player-placeholder" style="position: relative; width: 100%; padding-bottom: 56.25%; background-color: #000; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    
    <!-- Smart Autoplay Unmute Hook -->
    <div id="veloturb-unmute-${video.id}" style="position: absolute; ${autoplayPosStyle} ${isFullWidthAutoplay ? 'width: 100%; max-width: 100%; left: 0; transform: none;' : 'max-width: 92%;'} z-index: 40; background: ${bannerColors.bg}; color: ${bannerColors.text}; opacity: ${autoplayOpacity / 100}; padding: ${autoplayShape === 'two_lines' ? '12px 24px' : '10px 22px'}; border-radius: ${autoplayBorderRadius}; font-weight: 800; font-size: 14px; font-family: system-ui, -apple-system, sans-serif; display: flex; ${autoplayShape === 'two_lines' ? 'flex-direction: column;' : ''} align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.4); text-align: center; white-space: nowrap;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <!-- Ícone Som Mudo (Esquerda) -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <span style="font-weight: 800; letter-spacing: -0.2px;">${autoplayText}</span>
        <!-- Ícone Som Ativo com Ondas (Direita) -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </div>
      ${autoplayShape === 'two_lines' ? `<div style="font-size: 11px; opacity: 0.92; font-weight: 600;">${autoplaySubtext || (isSpanishTs ? 'Haz clic para escuchar el audio 🔊' : 'Clique aqui para ativar o áudio 🔊')}</div>` : ''}
    </div>

    <!-- Video Element -->
    <video
      id="veloturb-vid-${video.id}"
      poster="${video.thumbnailUrl || ''}"
      autoplay
      muted
      playsinline
      webkit-playsinline
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
      oncontextmenu="return false;"
    ></video>

    <!-- ThumbSniper Pause Hook Overlay (com suporte real a Espanhol e Português) -->
    <div id="veloturb-thumbsniper-${video.id}" style="display: none; position: absolute; inset: 0; background: rgba(0,0,0,0.85); z-index: 45; align-items: center; justify-content: center; padding: 15px; cursor: pointer; text-align: center; font-family: system-ui, sans-serif;">
      <div style="background: #09090b; border: 1px solid #27272a; border-radius: 14px; padding: 22px 18px; max-width: 360px; width: 100%; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
        <div style="font-size: 28px; margin-bottom: 8px;">✋</div>
        <h4 style="color: #fff; font-size: 15px; font-weight: 800; text-transform: uppercase; margin: 0 0 6px 0; line-height: 1.2;">${tsHeadline}</h4>
        <p style="color: #a1a1aa; font-size: 12px; margin: 0 0 16px 0;">${tsSubheadline}</p>
        <div style="position: relative; display: inline-block; width: 100%;">
          <button style="width: 100%; background: ${tsButtonColor}; color: #fff; font-weight: 800; font-size: 13px; text-transform: uppercase; padding: 12px; border-radius: 10px; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(239,68,68,0.5);">${tsButtonText}</button>
          <div style="position: absolute; bottom: -8px; right: 20px; font-size: 28px; animation: veloturbTap 1.2s infinite ease-in-out; pointer-events: none;">👆</div>
        </div>
      </div>
    </div>

    <!-- Barra de Progresso VSL Profissional -->
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: rgba(255,255,255,0.25); z-index: 30;">
      <div id="veloturb-bar-${video.id}" style="height: 100%; width: 0%; background: ${primaryColor}; transition: width 0.15s linear;"></div>
    </div>
  </div>
</veloturb-smartplayer>

<style>
@keyframes veloturbTap {
  0% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-8px) scale(1.1); }
  50% { transform: translateY(2px) scale(0.92); }
  70% { transform: translateY(-4px) scale(1.05); }
  100% { transform: translateY(0) scale(1); }
}
</style>

<script type="text/javascript">
(function() {
  var v = document.getElementById('veloturb-vid-${video.id}');
  var b = document.getElementById('veloturb-unmute-${video.id}');
  var bar = document.getElementById('veloturb-bar-${video.id}');
  var ts = document.getElementById('veloturb-thumbsniper-${video.id}');
  var url = '${videoSourceUrl}';
  var isHls = url.indexOf('.m3u8') !== -1;

  function loadHlsScript(cb) {
    if (window.Hls) { cb(window.Hls); return; }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    s.onload = function() { cb(window.Hls); };
    document.head.appendChild(s);
  }

  function initPlayer() {
    if (isHls) {
      if (v.canPlayType('application/vnd.apple.mpegurl')) {
        v.src = url;
      } else {
        loadHlsScript(function(HlsClass) {
          if (HlsClass && HlsClass.isSupported()) {
            var hls = new HlsClass({ startLevel: -1, capLevelToPlayerSize: true });
            hls.loadSource(url);
            hls.attachMedia(v);
          }
        });
      }
    } else {
      v.src = url;
    }
  }

  initPlayer();

  function unmuteAndRestartFromZero() {
    try {
      v.currentTime = 0;
      v.muted = false;
      v.volume = 1;
      v.play();
      if (b) b.style.display = 'none';
    } catch(e) {}
  }

  if (b) b.onclick = function(e) { e.stopPropagation(); unmuteAndRestartFromZero(); };
  v.onclick = function() {
    if (v.muted || (b && b.style.display !== 'none')) {
      unmuteAndRestartFromZero();
    } else if (v.paused) {
      v.play();
    } else {
      v.pause();
    }
  };

  if (ts) {
    v.addEventListener('pause', function() {
      if (!v.ended && v.currentTime > 1) { ts.style.display = 'flex'; }
    });
    v.addEventListener('play', function() { ts.style.display = 'none'; });
    ts.onclick = function(e) { e.stopPropagation(); v.play(); ts.style.display = 'none'; };
  }

  v.addEventListener('timeupdate', function() {
    if (bar && v.duration) {
      var pct = (v.currentTime / v.duration) * 100;
      bar.style.width = Math.min(100, Math.pow(pct / 100, 0.55) * 100) + '%';
    }
  });

  v.play().catch(function() { v.muted = true; v.play(); });
})();
</script>`;

  // Format 3: Clean iFrame Embed
  const iframeEmbedCode = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
  <iframe
    src="${origin}/embed/${video.id}?url=${encodeURIComponent(videoSourceUrl)}&text=${encodeURIComponent(autoplayText)}&theme=${autoplayTheme}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; fullscreen; encrypted-media"
    allowfullscreen
  ></iframe>
</div>`;

  // Format 4: Head Preload optimization tag (VTurb standard)
  const headPreloadCode = `<script>!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);</script>
<link rel="preload" href="${origin}/player.js" as="script">
<link rel="preconnect" href="${origin}">
<link rel="dns-prefetch" href="${origin}">`;

  const getActiveCode = () => {
    switch (embedMode) {
      case 'short':
        return shortEmbedCode;
      case 'inline':
        return inlineJsEmbedCode;
      case 'iframe':
        return iframeEmbedCode;
      default:
        return shortEmbedCode;
    }
  };

  const copyToClipboard = (text: string, isHead: boolean = false) => {
    navigator.clipboard.writeText(text);
    if (isHead) {
      setCopiedHead(true);
      setTimeout(() => setCopiedHead(false), 2000);
    } else {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-800 font-sans">
        
        {/* Header matching VTurb modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Embed</h2>
            <p className="text-xs text-slate-500">Pronto para colar no Elementor, WordPress ou HTML da sua PV</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Subtitle instructions */}
          <div className="flex items-center justify-between text-xs text-slate-600">
            <p>
              Incorpore o vídeo onde quiser!{' '}
              <span className="text-blue-600 hover:underline cursor-pointer font-medium">
                Aprenda a incorporar seu vídeo
              </span>.
            </p>
            {onOpenSimulator && (
              <button
                type="button"
                onClick={onOpenSimulator}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Testar na PV Simulada
              </button>
            )}
          </div>

          {/* Video Origin & Source URL box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">
                  Origem do Vídeo ({isHls ? 'Bunny Stream HLS .m3u8' : 'MP4 Direto'})
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold">
                {isHls ? '✓ HLS Habilitado' : 'MP4 Direto'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              URL direta pública que será carregada pelo player na sua página de vendas:
            </p>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={videoSourceUrl}
                onChange={(e) => setVideoSourceUrl(e.target.value)}
                placeholder="https://vz-802485-cdn.b-cdn.net/.../playlist.m3u8"
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setVideoSourceUrl('https://vz-802485-cdn.b-cdn.net/a818fa3d-82ba-4162-81d0-9a8ad66f0d1f/playlist.m3u8')}
                className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 whitespace-nowrap cursor-pointer"
              >
                Bunny Demo 802485
              </button>
            </div>
          </div>

          {/* Banner Text & Style Editor (Exatamente a faixa amarela mostrada na imagem) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
                <h4 className="text-xs font-bold text-slate-900">
                  Editar Texto da Faixa de Som (Smart Autoplay)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded">
                Reinicia 00:00 com Áudio
              </span>
            </div>

            {/* Live Visual Preview of Banner exactly like screenshot */}
            <div className="py-2.5 px-3 bg-slate-900/10 rounded-lg flex justify-center items-center">
              <div 
                style={{ backgroundColor: bannerColors.bg, color: bannerColors.text }}
                className="px-5 py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg border border-black/10 select-none max-w-full text-center"
              >
                <VolumeX className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="font-extrabold tracking-tight truncate">{autoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'}</span>
                <Volume2 className="w-4 h-4 shrink-0 stroke-[2.5]" />
              </div>
            </div>

            {/* Editable text input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Texto exibido na faixa do vídeo:
              </label>
              <input
                type="text"
                value={autoplayText}
                onChange={(e) => setAutoplayText(e.target.value)}
                placeholder="Ex: Seu vídeo já começou! Clique para ouvir áudio"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-bold text-slate-900"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                'Seu vídeo já começou! Clique para ouvir áudio',
                'ATENÇÃO: Clique para ouvir com som 🔊',
                'O áudio está mutado. Clique aqui para ativar o som',
                'Assista com som antes que saia do ar! 🔊',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAutoplayText(preset)}
                  className={`px-2 py-1 text-[10px] rounded-lg border transition-colors cursor-pointer ${
                    autoplayText === preset
                      ? 'bg-blue-50 text-blue-700 border-blue-400 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Theme Colors */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] font-semibold text-slate-600">Cor da faixa:</span>
              {(['yellow', 'black', 'red', 'purple'] as const).map((theme) => {
                const isSelected = autoplayTheme === theme;
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => setAutoplayTheme(theme)}
                    className={`px-2.5 py-1 text-[11px] rounded font-bold transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : 'opacity-80 hover:opacity-100'
                    } ${
                      theme === 'yellow' ? 'bg-amber-400 text-black font-extrabold' :
                      theme === 'black' ? 'bg-slate-900 text-white' :
                      theme === 'red' ? 'bg-rose-600 text-white' : 'bg-purple-600 text-white'
                    }`}
                  >
                    {theme === 'yellow' ? 'Amarelo (Padrão)' : theme === 'black' ? 'Preto' : theme === 'red' ? 'Vermelho' : 'Roxo'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Embed Mode Selection matching user screenshot */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Copie o Código de Embed</h4>
                <p className="text-[11px] text-slate-400">Cole no Elementor, WordPress ou HTML da sua PV</p>
              </div>

              {/* Segmented Mode Switch */}
              <div className="inline-flex rounded-lg border border-blue-400 p-0.5 bg-white shadow-xs">
                <button
                  type="button"
                  onClick={() => setEmbedMode('short')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    embedMode === 'short'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Tag Rápida (Curto)
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedMode('inline')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    embedMode === 'inline'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  JavaScript Direto
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedMode('iframe')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    embedMode === 'iframe'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  iFrame
                </button>
              </div>
            </div>

            {/* Code Textarea Box with Top-Right Copy Button */}
            <div className="relative border border-slate-300 rounded-lg bg-slate-50/50 p-3 hover:border-slate-400 transition-colors">
              <button
                type="button"
                onClick={() => copyToClipboard(getActiveCode(), false)}
                title="Copiar código"
                className="absolute top-2.5 right-2.5 p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                {copiedMain ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <textarea
                readOnly
                value={getActiveCode()}
                rows={embedMode === 'short' ? 2 : 4}
                className="w-full pr-8 text-xs font-mono text-slate-700 bg-transparent resize-none focus:outline-none select-all leading-relaxed"
              />
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <p className="text-[11px] leading-snug">
                <strong>Sincronização em Tempo Real Ativa:</strong> Você só precisa colar esse código <strong>uma única vez</strong> na sua página. Sempre que alterar cores, textos, autoplay, pitch ou ThumbSniper aqui no painel, sua página atualiza automaticamente sem você precisar recolar nada!
              </p>
            </div>
            {embedMode === 'short' && (
              <p className="text-[11px] text-slate-500">
                ⭐ <strong>Formato recomendado:</strong> Carrega <code>player.js</code> assincronamente com suporte nativo a Bunny HLS e ThumbSniper.
              </p>
            )}
          </div>

          {/* Otimizar Velocidade de Carregamento Toggle matching screenshot */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Otimizar Velocidade de Carregamento</h4>
                <p className="text-[11px] text-slate-400">Use o código de velocidade do VeloTurb para carregar o player mais rápido</p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={optimizeSpeed}
                  onChange={(e) => setOptimizeSpeed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {optimizeSpeed && (
              <>
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sky-950">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Instruções de uso:</strong> Cole o código abaixo na tag{' '}
                    <code className="bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-mono font-bold">&lt;head&gt;</code>{' '}
                    do seu site. Ao fazer isso, o VeloTurb vai carregar mais rápido na sua página 😊!
                  </p>
                </div>

                <div className="relative border border-slate-300 rounded-lg bg-slate-50/50 p-3 hover:border-slate-400 transition-colors">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(headPreloadCode, true)}
                    title="Copiar código do head"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    {copiedHead ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <textarea
                    readOnly
                    value={headPreloadCode}
                    rows={3}
                    className="w-full pr-8 text-xs font-mono text-slate-700 bg-transparent resize-none focus:outline-none select-all leading-relaxed"
                  />
                </div>
              </>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
