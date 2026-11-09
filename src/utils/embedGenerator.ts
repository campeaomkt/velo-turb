import { VideoItem } from '../types';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function generateSmartPlayerEmbed(video: VideoItem): string {
  const { settings } = video;
  const primaryColor = settings.primaryColor || '#E11D48';
  const autoplayBannerTheme = settings.smartAutoplayTheme === 'yellow'
    ? 'background: #FACC15; color: #000000;'
    : settings.smartAutoplayTheme === 'red'
    ? 'background: #E11D48; color: #FFFFFF;'
    : settings.smartAutoplayTheme === 'purple'
    ? 'background: #8B5CF6; color: #FFFFFF;'
    : 'background: #0F172A; color: #FFFFFF;';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.veloturb.com';
  let safeVideoUrl = video.videoUrl;
  if (safeVideoUrl.startsWith('blob:')) {
    safeVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  } else if (safeVideoUrl.startsWith('/')) {
    safeVideoUrl = `${origin}${safeVideoUrl}`;
  }

  return `<!-- ================================================= -->
<!-- VeloTurb Player - Hospedagem & Player Inteligente -->
<!-- Vídeo: ${video.title} -->
<!-- ================================================= -->
<div id="veloturb-container-${video.id}" style="position: relative; width: 100%; max-width: 960px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3); background: #000; font-family: system-ui, -apple-system, sans-serif;">
  <div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0;">
    
    <!-- Smart Autoplay Banner (Clique para Ativar Áudio) -->
    ${settings.smartAutoplay ? `
    <div id="veloturb-unmute-${video.id}" style="position: absolute; ${
      settings.smartAutoplayPosition === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' :
      settings.smartAutoplayPosition === 'bottom' ? 'bottom: 24px; left: 50%; transform: translateX(-50%);' :
      settings.smartAutoplayPosition === 'top_left' ? 'top: 14px; left: 16px;' :
      settings.smartAutoplayPosition === 'top_right' ? 'top: 14px; right: 16px;' :
      settings.smartAutoplayPosition === 'bottom_left' ? 'bottom: 24px; left: 16px;' :
      settings.smartAutoplayPosition === 'bottom_right' ? 'bottom: 24px; right: 16px;' :
      'top: 14px; left: 50%; transform: translateX(-50%);'
    } ${settings.smartAutoplayShape === 'full_width' ? 'width: 100%; max-width: 100%; left: 0; transform: none;' : 'max-width: 92%;'} z-index: 40; opacity: ${(settings.smartAutoplayOpacity ?? 100) / 100}; ${autoplayBannerTheme} padding: ${settings.smartAutoplayShape === 'two_lines' ? '12px 24px' : '10px 22px'}; border-radius: ${
      settings.smartAutoplayShape === 'square' ? '0px' :
      settings.smartAutoplayShape === 'rounded' ? '12px' :
      settings.smartAutoplayShape === 'two_lines' ? '14px' :
      settings.smartAutoplayShape === 'full_width' ? '0px' :
      settings.smartAutoplayShape === 'minimal' ? '8px' : '9999px'
    }; font-weight: 800; font-size: 14px; display: flex; ${settings.smartAutoplayShape === 'two_lines' ? 'flex-direction: column;' : ''} align-items: center; justify-content: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.4); text-align: center; white-space: nowrap;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
        <span style="font-weight: 800;">${settings.smartAutoplayText || 'Seu vídeo já começou! Clique para ouvir áudio'}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      </div>
      ${settings.smartAutoplayShape === 'two_lines' ? `<div style="font-size: 11px; opacity: 0.92; font-weight: 600;">${settings.smartAutoplaySubtext || 'Clique aqui para ativar o áudio 🔊'}</div>` : ''}
    </div>
    ` : ''}

    <!-- Video Element -->
    <video
      id="veloturb-video-${video.id}"
      src="${safeVideoUrl}"
      playsinline
      webkit-playsinline
      ${settings.smartAutoplay ? 'autoplay muted' : ''}
      poster="${video.thumbnailUrl || ''}"
      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; background: #000;"
      oncontextmenu="return false;"
    ></video>

    <!-- Custom Progress Bar (Fake or Real) -->
    <div id="veloturb-progress-bg-${video.id}" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(255,255,255,0.2); z-index: 30; cursor: ${settings.hideControls ? 'default' : 'pointer'};">
      <div id="veloturb-progress-bar-${video.id}" style="height: 100%; width: 0%; background: ${primaryColor}; transition: width 0.15s linear;"></div>
    </div>
  </div>
</div>

<style>
  @keyframes veloturbPulse {
    0% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.45); }
    100% { transform: translateX(-50%) scale(1); }
  }
</style>

<script>
(function() {
  const vid = document.getElementById('veloturb-video-${video.id}');
  const unmuteBtn = document.getElementById('veloturb-unmute-${video.id}');
  const progressBar = document.getElementById('veloturb-progress-bar-${video.id}');
  const resumeKey = 'veloturb_time_${video.id}';
  const pitchDelaySec = ${settings.pitchDelaySeconds || 0};

  ${settings.antiDownload ? `
  // Proteção Anti-Download e Bloqueio de Botão Direito
  vid.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'u' || e.key === 'i')) {
      e.preventDefault();
    }
  });
  ` : ''}

  ${settings.resumePlayback ? `
  // Retomada inteligente de onde o lead parou
  try {
    const savedTime = localStorage.getItem(resumeKey);
    if (savedTime && parseFloat(savedTime) > 5) {
      vid.currentTime = parseFloat(savedTime);
    }
  } catch(e) {}
  ` : ''}

  // Ativação do áudio (Smart Autoplay Unmute Hook):
  // Quando o lead clica na faixa de áudio ou no vídeo, o vídeo reinicia do COMEÇO (00:00) com SOM ATIVADO!
  function activateSoundAndRestart() {
    try {
      vid.currentTime = 0;
      vid.muted = false;
      vid.volume = 1;
      vid.play();
      if (unmuteBtn) unmuteBtn.style.display = 'none';
    } catch(e) {}
  }

  if (unmuteBtn) {
    unmuteBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      activateSoundAndRestart();
    });
  }

  // Se clicar no vídeo durante o autoplay mudo, também reinicia do 0 com som
  vid.addEventListener('click', function(e) {
    if (vid.muted || (unmuteBtn && unmuteBtn.style.display !== 'none')) {
      activateSoundAndRestart();
    }
  });

  // Atualização da barra de progresso
  vid.addEventListener('timeupdate', function() {
    ${settings.resumePlayback ? `
    try { localStorage.setItem(resumeKey, vid.currentTime); } catch(e) {}
    ` : ''}

    if (progressBar && vid.duration) {
      ${settings.fakeProgressBar ? `
      // Fake progress: acelera no começo para reter o lead
      const actualPct = (vid.currentTime / vid.duration) * 100;
      const fakePct = Math.min(100, Math.pow(actualPct / 100, 0.6) * 100);
      progressBar.style.width = fakePct + '%';
      ` : `
      const pct = (vid.currentTime / vid.duration) * 100;
      progressBar.style.width = pct + '%';
      `}
    }

    // Disparo de evento customizado quando atinge o pitch
    if (pitchDelaySec > 0 && vid.currentTime >= pitchDelaySec) {
      window.dispatchEvent(new CustomEvent('veloturb:pitch', { detail: { videoId: '${video.id}' } }));
    }
  });

  // Tentar iniciar com som se navegador permitir, senão com som mudo
  const playPromise = vid.play();
  if (playPromise !== undefined) {
    playPromise.catch(function() {
      vid.muted = true;
      vid.play();
    });
  }
})();
</script>`;
}

export function generatePitchDelayScript(video: VideoItem, selector: string = '.esconder-pitch'): string {
  const pitchSeconds = video.settings.pitchDelaySeconds || 0;
  const mins = Math.floor(pitchSeconds / 60);
  const secs = pitchSeconds % 60;

  return `<!-- ================================================================ -->
<!-- SCRIPT DE PITCH DELAY (MOSTRAR BOTÃO / OFERTA NO TEMPO CERTO)   -->
<!-- Esconde a seção da sua PV e revela aos ${mins}m ${secs}s (${pitchSeconds} segundos) -->
<!-- ================================================================ -->
<style>
  /* Esconde os elementos do pitch inicialmente com transição suave */
  ${selector} {
    display: none !important;
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
  }
  ${selector}.mostrar-oferta {
    display: block !important;
    opacity: 1 !important;
    animation: veloturbFadeIn 0.8s ease-in-out forwards;
  }
  @keyframes veloturbFadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
</style>

<script>
(function() {
  const PITCH_DELAY_SECONDS = ${pitchSeconds};
  const STORAGE_KEY = 'veloturb_pitch_revealed_${video.id}';
  const targetSelector = '${selector}';

  function revealPitch() {
    const elements = document.querySelectorAll(targetSelector);
    elements.forEach(function(el) {
      el.classList.add('mostrar-oferta');
    });
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch(e) {}
  }

  // Se o lead já assistiu ao pitch antes, exibe imediatamente para não perder a venda!
  try {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      revealPitch();
      return;
    }
  } catch(e) {}

  // Escuta o evento do player do VeloTurb
  window.addEventListener('veloturb:pitch', function(e) {
    revealPitch();
  });

  // Fallback por timer global caso o evento não seja capturado
  setTimeout(function() {
    revealPitch();
  }, PITCH_DELAY_SECONDS * 1000);
})();
</script>`;
}

export function generateReadyToPasteSalesButton(video: VideoItem): string {
  const { settings } = video;
  return `<!-- ======================================================== -->
<!-- BOTÃO DE CHECKOUT DE ALTA CONVERSÃO (PULSANTE) PRONTO    -->
<!-- Cole abaixo do vídeo dentro da sua seção de Pitch Delay  -->
<!-- ======================================================== -->
<div class="esconder-pitch" style="text-align: center; margin: 35px auto; max-width: 650px; padding: 0 15px;">
  <a href="${settings.ctaUrl || 'https://suaplataforma.com/checkout'}"
     target="_blank"
     style="display: inline-block; width: 100%; max-width: 580px; background: linear-gradient(180deg, #22C55E 0%, #16A34A 100%); color: #ffffff; text-decoration: none; font-family: system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 20px; line-height: 1.3; padding: 18px 28px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.5), 0 8px 10px -6px rgba(34, 197, 94, 0.3); letter-spacing: 0.5px; border: 2px solid #86EFAC; text-transform: uppercase; cursor: pointer; transition: transform 0.2s; animation: pulseCTA 2s infinite;">
    ${settings.ctaText || 'QUERO GARANTIR MINHA VAGA COM 50% OFF'}
  </a>
  <p style="margin-top: 10px; font-size: 13px; color: #64748B; font-family: system-ui, sans-serif;">
    🔒 ${settings.ctaSubtext || 'Acesso Imediato • Compra 100% Segura • Garantia Incondicional de 7 Dias'}
  </p>
</div>

<style>
@keyframes pulseCTA {
  0% { transform: scale(1); }
  50% { transform: scale(1.03); }
  100% { transform: scale(1); }
}
</style>`;
}

export function generateIframeEmbed(video: VideoItem): string {
  // Generates standalone iframe embed code
  return `<div style="position: relative; width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 20px 30px rgba(0,0,0,0.25);">
  <iframe
    src="${window.location.origin}/embed/${video.id}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="autoplay; fullscreen; encrypted-media"
    allowfullscreen
  ></iframe>
</div>`;
}
