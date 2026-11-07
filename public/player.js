/**
 * VeloTurb SmartPlayer - High Conversion VSL Player Runtime
 * Suporte a Bunny Stream HLS (.m3u8) + MP4 Nativo
 * Versão: 2.1.0
 */
(function(window, document) {
  'use strict';

  var HLS_CDN_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
  var hlsScriptLoading = false;
  var hlsScriptLoaded = false;
  var hlsLoadCallbacks = [];

  // Carregamento dinâmico e seguro do Hls.js sob demanda
  function loadHlsScript(callback) {
    if (window.Hls && window.Hls.isSupported()) {
      callback();
      return;
    }
    hlsLoadCallbacks.push(callback);
    if (hlsScriptLoading) return;
    hlsScriptLoading = true;

    var script = document.createElement('script');
    script.src = HLS_CDN_URL;
    script.async = true;
    script.onload = function() {
      hlsScriptLoaded = true;
      hlsScriptLoading = false;
      console.log('[VeloTurb] hls.js v1.5.17 carregado com sucesso via CDN.');
      while (hlsLoadCallbacks.length) {
        var cb = hlsLoadCallbacks.shift();
        try { cb(); } catch (err) { console.error('[VeloTurb] Erro callback hls:', err); }
      }
    };
    script.onerror = function() {
      hlsScriptLoading = false;
      console.error('[VeloTurb] Falha ao carregar biblioteca hls.js.');
    };
    document.head.appendChild(script);
  }

  // Detecta se a URL é HLS (.m3u8) ou MP4
  function detectVideoType(url) {
    if (!url) return 'mp4';
    var clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.m3u8') || url.indexOf('playlist.m3u8') !== -1) {
      return 'hls';
    }
    return 'mp4';
  }

  // Inicializa uma instância de player num container específico
  function initPlayerInstance(container) {
    if (container.dataset.veloturbInitialized === 'true') return;
    container.dataset.veloturbInitialized = 'true';

    var videoId = container.getAttribute('data-video-id') || container.id.replace(/^veloturb-/, '');
    if (!videoId) {
      console.warn('[VeloTurb] Elemento de player sem data-video-id.', container);
      return;
    }

    // Determina o host da API baseando-se no script que carregou o player.js ou na página atual
    var currentScript = document.currentScript;
    var scriptOrigin = '';
    if (currentScript && currentScript.src) {
      try {
        var urlObj = new URL(currentScript.src);
        scriptOrigin = urlObj.origin;
      } catch (e) {}
    }
    if (!scriptOrigin) {
      var scripts = document.querySelectorAll('script[src*="player.js"]');
      if (scripts.length > 0) {
        try {
          var lastScript = scripts[scripts.length - 1];
          scriptOrigin = new URL(lastScript.src).origin;
        } catch (e) {}
      }
    }
    var apiBase = scriptOrigin || window.location.origin;

    // Busca a configuração completa do vídeo no backend
    var apiUrl = apiBase + '/api/videos/' + encodeURIComponent(videoId);

    fetch(apiUrl, { mode: 'cors' })
      .then(function(res) {
        if (!res.ok) throw new Error('Vídeo não encontrado na API (HTTP ' + res.status + ')');
        return res.json();
      })
      .then(function(videoConfig) {
        renderPlayer(container, videoConfig);
      })
      .catch(function(err) {
        console.warn('[VeloTurb] Não foi possível obter config remota via API, usando fallback:', err);
        // Fallback para atributos inline no elemento container se houver
        var inlineSrc = container.getAttribute('data-src') || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        renderPlayer(container, {
          id: videoId,
          src: inlineSrc,
          type: detectVideoType(inlineSrc),
          poster: container.getAttribute('data-poster') || '',
          pitchDelay: parseInt(container.getAttribute('data-pitch-delay') || '15', 10),
          primaryColor: container.getAttribute('data-primary-color') || '#E11D48',
          smartAutoplay: true,
          smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio',
          smartAutoplayTheme: 'yellow',
          onlyProgressBar: true,
          thumbSniper: { enabled: true, templateId: 'ts_01' }
        });
      });
  }

  // Renderiza a estrutura do player dentro do container
  function renderPlayer(container, config) {
    var instanceId = 'vt_' + (config.id || Math.random().toString(36).substring(2, 9));
    var primaryColor = config.primaryColor || (config.settings && config.settings.primaryColor) || '#E11D48';
    var smartAutoplayText = config.smartAutoplayText || (config.settings && config.settings.smartAutoplayText) || 'Seu vídeo já começou! Clique para ouvir áudio';
    var smartAutoplayTheme = config.smartAutoplayTheme || (config.settings && config.settings.smartAutoplayTheme) || 'yellow';
    var pitchDelay = config.pitchDelaySeconds || config.pitchDelay || (config.settings && config.settings.pitchDelaySeconds) || 0;

    var themeStyles = {
      yellow: { bg: '#FACC15', color: '#000000' },
      black: { bg: '#09090B', color: '#FFFFFF' },
      red: { bg: '#E11D48', color: '#FFFFFF' },
      purple: { bg: '#8B5CF6', color: '#FFFFFF' }
    }[smartAutoplayTheme] || { bg: '#FACC15', color: '#000000' };

    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.backgroundColor = '#000000';
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.userSelect = 'none';

    var videoSrc = config.src || config.videoUrl || '';
    var videoType = config.type || detectVideoType(videoSrc);
    var posterUrl = config.poster || config.thumbnailUrl || '';

    // Monta o HTML do player
    container.innerHTML =
      '<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;background:#000;">' +
        // Smart Autoplay Banner
        '<div id="' + instanceId + '-unmute" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:40;background:' + themeStyles.bg + ';color:' + themeStyles.color + ';padding:10px 22px;border-radius:9999px;font-weight:800;font-size:13.5px;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,0.45);text-align:center;white-space:nowrap;max-width:92%;transition:transform 0.15s ease-out;animation:vtPulse 2s infinite;">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>' +
          '<span style="font-weight:800;letter-spacing:-0.2px;">' + smartAutoplayText + '</span>' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' +
        '</div>' +

        // Tag <video> com muted e playsinline obrigatórios para autoplay mobile
        '<video id="' + instanceId + '-video" ' +
          'playsinline webkit-playsinline muted autoplay preload="metadata" ' +
          (posterUrl ? 'poster="' + posterUrl + '" ' : '') +
          'style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;" ' +
          'oncontextmenu="return false;">' +
        '</video>' +

        // Overlay do ThumbSniper (Aparece ao Pausar)
        '<div id="' + instanceId + '-thumbsniper" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:45;align-items:center;justify-content:center;padding:15px;cursor:pointer;text-align:center;">' +
          '<div style="background:#09090b;border:1px solid #27272a;border-radius:14px;padding:22px 18px;max-width:360px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.8);">' +
            '<div style="font-size:28px;margin-bottom:8px;">✋</div>' +
            '<h4 style="color:#ffffff;font-size:15px;font-weight:800;text-transform:uppercase;margin:0 0 6px 0;line-height:1.2;">Este vídeo ficará fora do ar em breve!</h4>' +
            '<p style="color:#a1a1aa;font-size:12px;margin:0 0 16px 0;">Essa é sua última chance de assistir até o final.</p>' +
            '<div style="position:relative;display:inline-block;width:100%;">' +
              '<button style="width:100%;background:#ef4444;color:#ffffff;font-weight:800;font-size:13px;text-transform:uppercase;padding:12px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(239,68,68,0.5);">CONTINUAR ASSISTINDO</button>' +
              '<div style="position:absolute;bottom:-8px;right:20px;font-size:28px;animation:vtTap 1.2s infinite ease-in-out;pointer-events:none;">👆</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Barra de progresso VSL Profissional
        '<div id="' + instanceId + '-progress-bg" style="position:absolute;bottom:0;left:0;width:100%;height:5px;background:rgba(255,255,255,0.25);z-index:30;cursor:pointer;">' +
          '<div id="' + instanceId + '-progress-bar" style="height:100%;width:0%;background:' + primaryColor + ';transition:width 0.15s linear;"></div>' +
        '</div>' +
      '</div>';

    // Injeta CSS de animações caso ainda não existam no documento
    if (!document.getElementById('veloturb-keyframes')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'veloturb-keyframes';
      styleEl.innerHTML =
        '@keyframes vtTap { 0%{transform:translateY(0) scale(1);} 30%{transform:translateY(-8px) scale(1.1);} 50%{transform:translateY(2px) scale(0.92);} 70%{transform:translateY(-4px) scale(1.05);} 100%{transform:translateY(0) scale(1);} }' +
        '@keyframes vtPulse { 0%,100%{transform:translateX(-50%) scale(1);} 50%{transform:translateX(-50%) scale(1.03);box-shadow:0 6px 22px rgba(0,0,0,0.5);} }';
      document.head.appendChild(styleEl);
    }

    var video = document.getElementById(instanceId + '-video');
    var unmuteBtn = document.getElementById(instanceId + '-unmute');
    var progressBar = document.getElementById(instanceId + '-progress-bar');
    var progressBg = document.getElementById(instanceId + '-progress-bg');
    var thumbsniper = document.getElementById(instanceId + '-thumbsniper');

    var hlsInstance = null;
    var pitchTriggered = false;

    // Configuração de reprodução: HLS (.m3u8) vs MP4
    if (videoType === 'hls') {
      console.log('[VeloTurb] Configurando stream HLS:', videoSrc);

      // 1. Suporte Nativo a HLS (Safari no macOS e iOS)
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('[VeloTurb] Usando suporte nativo a HLS do navegador (Safari/iOS).');
        video.src = videoSrc;
        video.addEventListener('loadedmetadata', function() {
          video.play().catch(function(e) { console.warn('[VeloTurb] Autoplay bloqueado pelo navegador:', e); });
        });
      } else {
        // 2. Carrega hls.js dinamicamente para Chrome, Firefox, Edge, Android
        loadHlsScript(function() {
          if (!window.Hls || !window.Hls.isSupported()) {
            console.error('[VeloTurb] Navegador não suporta HLS nem hls.js.');
            alert('Seu navegador não suporta streaming HLS. Atualize seu navegador para continuar assistindo.');
            return;
          }

          var hls = new window.Hls({
            startLevel: -1, // Nível automático com base na largura de banda inicial
            capLevelToPlayerSize: true, // Não baixa 1080p se o player estiver num celular 360p
            maxBufferLength: 30, // 30 segundos de buffer seguro para início ultra-rápido
            enableWorker: true
          });

          hlsInstance = hls;

          hls.loadSource(videoSrc);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function(event, data) {
            console.log('[VeloTurb] Manifesto HLS carregado com sucesso. Níveis de qualidade:', data.levels.length);
            video.play().catch(function() {
              console.log('[VeloTurb] Início automático forçado em mudo.');
              video.muted = true;
              video.play();
            });
          });

          // Tratamento de erros do Hls.js especificado
          hls.on(window.Hls.Events.ERROR, function(event, data) {
            console.warn('[VeloTurb] Evento de erro HLS:', data.type, data.details);
            if (data.fatal) {
              switch (data.type) {
                case window.Hls.ErrorTypes.NETWORK_ERROR:
                  console.error('[VeloTurb] Erro de rede fatal no HLS. Tentando startLoad()...');
                  hls.startLoad();
                  break;
                case window.Hls.ErrorTypes.MEDIA_ERROR:
                  console.error('[VeloTurb] Erro de mídia fatal no HLS. Chamando recoverMediaError()...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('[VeloTurb] Erro irrecuperável no HLS. Destruindo player:', data);
                  hls.destroy();
                  break;
              }
            }
          });
        });
      }
    } else {
      // Vídeo MP4 direto
      console.log('[VeloTurb] Carregando vídeo MP4 direto:', videoSrc);
      video.src = videoSrc;
      video.play().catch(function() {
        video.muted = true;
        video.play();
      });
    }

    // Unmute Hook (Quando clica na faixa, REINICIA do 00:00 com ÁUDIO ATIVO)
    function activateAudioAndRestart() {
      try {
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1;
        video.play();
        if (unmuteBtn) unmuteBtn.style.display = 'none';
        console.log('[VeloTurb] Áudio ativado! Vídeo reiniciado do começo (00:00).');
      } catch (err) {
        console.warn('[VeloTurb] Falha ao ativar áudio:', err);
      }
    }

    if (unmuteBtn) {
      unmuteBtn.onclick = function(e) {
        e.stopPropagation();
        activateAudioAndRestart();
      };
    }

    // Clique no vídeo
    video.onclick = function() {
      if (video.muted || (unmuteBtn && unmuteBtn.style.display !== 'none')) {
        activateAudioAndRestart();
      } else if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    };

    // ThumbSniper ao Pausar
    if (thumbsniper) {
      video.addEventListener('pause', function() {
        if (!video.ended && video.currentTime > 0.5) {
          thumbsniper.style.display = 'flex';
          console.log('[VeloTurb] ThumbSniper ativado na pausa.');
        }
      });
      video.addEventListener('play', function() {
        thumbsniper.style.display = 'none';
      });
      thumbsniper.onclick = function(e) {
        e.stopPropagation();
        video.play();
        thumbsniper.style.display = 'none';
      };
    }

    // Barra de progresso com HLS (Loadedmetadata / Durationchange / Timeupdate)
    function updateProgress() {
      if (progressBar && video.duration) {
        var pct = (video.currentTime / video.duration) * 100;
        var fakePct = Math.min(100, Math.pow(pct / 100, 0.55) * 100);
        progressBar.style.width = fakePct + '%';
      }

      // Pitch Delay Trigger
      if (pitchDelay > 0 && video.currentTime >= pitchDelay && !pitchTriggered) {
        pitchTriggered = true;
        console.log('[VeloTurb] Pitch Delay atingido (' + pitchDelay + 's)! Revelando oferta.');
        // Dispara evento na janela
        window.dispatchEvent(new CustomEvent('veloturb:pitch', { detail: { videoId: config.id } }));

        // Revela elementos com classe .esconder-pitch ou .veloturb-pitch
        var pitchElements = document.querySelectorAll('.esconder-pitch, .veloturb-pitch, [data-veloturb-pitch]');
        for (var i = 0; i < pitchElements.length; i++) {
          pitchElements[i].style.display = 'block';
          pitchElements[i].style.opacity = '1';
        }
      }
    }

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('durationchange', updateProgress);

    // Permite clicar na barra de progresso para avançar/voltar
    if (progressBg) {
      progressBg.onclick = function(e) {
        var rect = progressBg.getBoundingClientRect();
        var clickX = (e.clientX - rect.left) / rect.width;
        if (video.duration) {
          video.currentTime = clickX * video.duration;
        }
      };
    }

    // Proteção Anti-download e botão direito
    container.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      return false;
    });

    // Função de limpeza (cleanup) para evitar vazamento de memória se o player for removido
    container._veloturbDestroy = function() {
      if (hlsInstance) {
        console.log('[VeloTurb] Destruindo instância HLS para liberar memória.');
        hlsInstance.destroy();
        hlsInstance = null;
      }
      video.pause();
      video.src = '';
    };
  }

  // Auto-scan e inicialização de todos os players na página
  function scanAndInitPlayers() {
    var containers = document.querySelectorAll('[data-video-id], .veloturb-smartplayer, veloturb-smartplayer');
    for (var i = 0; i < containers.length; i++) {
      initPlayerInstance(containers[i]);
    }
  }

  // API Global do VeloTurb
  window.VeloTurb = {
    version: '2.1.0',
    init: initPlayerInstance,
    scan: scanAndInitPlayers,
    detectVideoType: detectVideoType
  };

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInitPlayers);
  } else {
    scanAndInitPlayers();
  }

  // Observa novos elementos adicionados dinamicamente (Elementor / SPAs)
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function() {
      scanAndInitPlayers();
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

})(window, document);
