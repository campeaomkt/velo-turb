import React, { useState } from 'react';
import { Copy, Check, X, Info } from 'lucide-react';
import { VideoItem } from '../types';

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
}) => {
  const [embedType, setEmbedType] = useState<'js' | 'iframe'>('js');
  const [isResponsive, setIsResponsive] = useState(false);
  const [optimizeSpeed, setOptimizeSpeed] = useState(true);
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedHead, setCopiedHead] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.veloturb.com';
  const primaryColor = video.settings.primaryColor || '#E11D48';

  // 1. Clean video-only JavaScript Embed
  const jsEmbedCode = `<veloturb-smartplayer id="vid-${video.id}" style="display: block; margin: 0 auto; width: 100%; max-width: 100%;">
  <div class="veloturb-player-placeholder" style="position: relative; width: 100%; padding-bottom: 56.25%; background-color: #000; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
    
    <!-- Smart Autoplay Unmute Hook -->
    <div id="veloturb-unmute-${video.id}" style="position: absolute; top: 14px; left: 50%; transform: translateX(-50%); z-index: 40; background: #FACC15; color: #000; padding: 10px 22px; border-radius: 9999px; font-weight: 700; font-size: 14px; font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.35); text-align: center; white-space: nowrap;">
      <span>Seu vídeo já começou! Clique para ouvir áudio 🔊</span>
    </div>

    <!-- Video Element -->
    <video
      id="veloturb-vid-${video.id}"
      src="${video.videoUrl}"
      autoplay
      muted
      playsinline
      webkit-playsinline
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
      oncontextmenu="return false;"
    ></video>

    <!-- Barra de Progresso VSL Profissional -->
    <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: rgba(255,255,255,0.25); z-index: 30;">
      <div id="veloturb-bar-${video.id}" style="height: 100%; width: 0%; background: ${primaryColor}; transition: width 0.15s linear;"></div>
    </div>
  </div>
</veloturb-smartplayer>

<script type="text/javascript">
(function() {
  var v = document.getElementById('veloturb-vid-${video.id}');
  var b = document.getElementById('veloturb-unmute-${video.id}');
  var bar = document.getElementById('veloturb-bar-${video.id}');

  // Ao clicar na isca ou no vídeo, reinicia DO COMEÇO (00:00) com SOM ATIVADO!
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
  v.onclick = function() { if (v.muted || (b && b.style.display !== 'none')) unmuteAndRestartFromZero(); };

  v.addEventListener('timeupdate', function() {
    if (bar && v.duration) {
      var pct = (v.currentTime / v.duration) * 100;
      bar.style.width = Math.min(100, Math.pow(pct / 100, 0.55) * 100) + '%';
    }
  });

  v.play().catch(function() { v.muted = true; v.play(); });
})();
</script>`;

  // 2. Clean iFrame Embed
  const iframeEmbedCode = `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
  <iframe
    src="${origin}/embed/${video.id}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; fullscreen; encrypted-media"
    allowfullscreen
  ></iframe>
</div>`;

  // 3. Preload speed optimization code
  const headPreloadCode = `<script>!function(i,n){i._plt=i._plt||(n&&n.timeOrigin?n.timeOrigin+n.now():Date.now())}(window,performance);</script>
<link rel="preload" href="${origin}/uploads/player.js" as="script">
<link rel="preconnect" href="${origin}">
<link rel="dns-prefetch" href="${origin}">`;

  const currentMainCode = embedType === 'js' ? jsEmbedCode : iframeEmbedCode;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[95vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-800 font-sans">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Embed</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Subtitle */}
          <p className="text-xs text-slate-600">
            Incorpore o vídeo onde quiser!{' '}
            <span className="text-blue-600 hover:underline cursor-pointer font-medium">
              Aprenda a incorporar seu vídeo
            </span>.
          </p>

          {/* Toggle: Vídeo Responsivo */}
          <div className="flex items-center justify-between pt-1">
            <div>
              <h4 className="text-xs font-semibold text-slate-800">Vídeo Responsivo</h4>
              <p className="text-[11px] text-slate-400">Use versões diferentes para dispositivos mobile e desktop</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isResponsive}
                onChange={(e) => setIsResponsive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Main Embed Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800">Copie o Código de Embed</h4>
                <p className="text-[11px] text-slate-400">Use o código abaixo para inserir o vídeo diretamente no seu site</p>
              </div>

              {/* Segmented JavaScript / iFrame switch with "Recomendado" badge */}
              <div className="flex flex-col items-center">
                <div className="mb-1 text-[10px] text-blue-600 font-semibold px-2 py-0.2 rounded-md border border-blue-400 bg-blue-50/70">
                  Recomendado
                </div>
                <div className="inline-flex rounded-lg border border-blue-400 p-0.5 bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setEmbedType('js')}
                    className={`px-4 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      embedType === 'js'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    JavaScript
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedType('iframe')}
                    className={`px-4 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      embedType === 'iframe'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    iFrame
                  </button>
                </div>
              </div>
            </div>

            {/* Code Textarea Box with Copy Icon on Top Right */}
            <div className="relative border border-slate-300 rounded-lg bg-slate-50/50 p-3 hover:border-slate-400 transition-colors">
              <button
                type="button"
                onClick={() => copyToClipboard(currentMainCode, false)}
                title="Copiar código"
                className="absolute top-2.5 right-2.5 p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors"
              >
                {copiedMain ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>

              <textarea
                readOnly
                value={currentMainCode}
                rows={4}
                className="w-full pr-8 text-xs font-mono text-slate-700 bg-transparent resize-none focus:outline-none select-all leading-relaxed"
              />
            </div>
          </div>

          {/* Otimizar Velocidade de Carregamento Toggle */}
          <div className="space-y-3 pt-3">
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
                {/* Blue Info Box matching screenshot */}
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-sky-950">
                  <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Instruções de uso:</strong> Cole o código abaixo na tag{' '}
                    <code className="bg-sky-100 text-sky-800 px-1 py-0.5 rounded font-mono font-bold">&lt;head&gt;</code>{' '}
                    do seu site. Ao fazer isso, o VeloTurb vai carregar mais rápido na sua página 😊! Está com dúvidas?{' '}
                    <span className="text-blue-600 font-bold hover:underline cursor-pointer">Clique aqui</span>{' '}
                    para pedir ajuda ao nosso suporte.
                  </p>
                </div>

                {/* Preload Code Textarea */}
                <div className="relative border border-slate-300 rounded-lg bg-slate-50/50 p-3 hover:border-slate-400 transition-colors">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(headPreloadCode, true)}
                    title="Copiar código do head"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-200/60 transition-colors"
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
