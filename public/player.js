/**
 * VeloTurb SmartPlayer - High Conversion VSL Player Runtime
 * Suporte a Bunny Stream HLS (.m3u8), Embed Iframe Fallback e MP4 Nativo
 * Versão: 2.2.0
 */
(function(window, document) {
  'use strict';

  var HLS_CDN_URL = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
  var hlsScriptLoading = false;
  var hlsLoadCallbacks = [];

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
      hlsScriptLoading = false;
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

  function detectVideoType(url) {
    if (!url) return 'mp4';
    var clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.m3u8') || url.indexOf('playlist.m3u8') !== -1) {
      return 'hls';
    }
    return 'mp4';
  }

  function initPlayerInstance(container) {
    if (container.dataset.veloturbInitialized === 'true') return;
    container.dataset.veloturbInitialized = 'true';

    var videoId = container.getAttribute('data-video-id') || container.id.replace(/^veloturb-/, '');
    var inlineSrc = container.getAttribute('data-src') || '';
    var inlineType = container.getAttribute('data-type') || (inlineSrc.indexOf('.m3u8') !== -1 ? 'hls' : 'mp4');
    var inlineLibraryId = container.getAttribute('data-bunny-library-id') || '802485';
    var inlineBunnyVideoId = container.getAttribute('data-bunny-video-id') || 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7';
    var inlinePoster = container.getAttribute('data-poster') || 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/thumbnail.jpg';

    // Se o elemento já possui os atributos de mídia, renderiza IMEDIATAMENTE sem esperar API
    if (inlineSrc || inlineBunnyVideoId) {
      renderPlayer(container, {
        id: videoId || 'vt_vsl_aevo_pro',
        src: inlineSrc || 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/playlist.m3u8',
        type: inlineType,
        bunnyLibraryId: inlineLibraryId,
        bunnyVideoId: inlineBunnyVideoId,
        poster: inlinePoster,
        pitchDelay: parseInt(container.getAttribute('data-pitch-delay') || '500', 10),
        primaryColor: container.getAttribute('data-primary-color') || '#E11D48',
        smartAutoplay: true,
        smartAutoplayText: container.getAttribute('data-autoplay-text') || 'Seu vídeo já começou! Clique para ouvir áudio',
        smartAutoplayTheme: container.getAttribute('data-autoplay-theme') || 'yellow',
        onlyProgressBar: true,
        thumbSniper: { enabled: true, templateId: 'ts_01' }
      });
      return;
    }

    // Caso contrário, busca na API do backend
    var scriptOrigin = '';
    var currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      try { scriptOrigin = new URL(currentScript.src).origin; } catch (e) {}
    }
    if (!scriptOrigin) {
      var scripts = document.querySelectorAll('script[src*="player.js"]');
      if (scripts.length > 0) {
        try { scriptOrigin = new URL(scripts[scripts.length - 1].src).origin; } catch (e) {}
      }
    }
    var apiBase = scriptOrigin || window.location.origin;

    fetch(apiBase + '/api/videos/' + encodeURIComponent(videoId), { mode: 'cors' })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(videoConfig) {
        renderPlayer(container, videoConfig);
      })
      .catch(function() {
        // Fallback robusto para o vídeo oficial do usuário (AEVO PRO BR)
        renderPlayer(container, {
          id: videoId || 'vt_vsl_aevo_pro',
          src: 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/playlist.m3u8',
          type: 'hls',
          bunnyLibraryId: '802485',
          bunnyVideoId: 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7',
          poster: 'https://vz-de50afce-82d.b-cdn.net/e0f24211-791e-4a84-99e9-1ac03bc1b5b7/thumbnail.jpg',
          pitchDelay: 500,
          primaryColor: '#E11D48',
          smartAutoplay: true,
          smartAutoplayText: 'Seu vídeo já começou! Clique para ouvir áudio',
          smartAutoplayTheme: 'yellow',
          onlyProgressBar: true,
          thumbSniper: { enabled: true, templateId: 'ts_01' }
        });
      });
  }

  function renderPlayer(container, config) {
    var instanceId = 'vt_' + (config.id || Math.random().toString(36).substring(2, 9));
    var primaryColor = config.primaryColor || (config.settings && config.settings.primaryColor) || '#E11D48';
    var smartAutoplayText = config.smartAutoplayText || (config.settings && config.settings.smartAutoplayText) || 'Seu vídeo já começou! Clique para ouvir áudio';
    var smartAutoplayTheme = config.smartAutoplayTheme || (config.settings && config.settings.smartAutoplayTheme) || 'yellow';
    var pitchDelay = config.pitchDelaySeconds || config.pitchDelay || (config.settings && config.settings.pitchDelaySeconds) || 500;

    var libraryId = config.bunnyLibraryId || '802485';
    var videoId = config.bunnyVideoId || 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7';

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

    // Renderiza Player com suporte dual (Tag de Vídeo HLS + Fallback Iframe Bunny com postMessage)
    container.innerHTML =
      '<div id="' + instanceId + '-box" style="position:relative;width:100%;padding-bottom:56.25%;height:0;background:#000;">' +
        // Smart Autoplay Banner
        '<div id="' + instanceId + '-unmute" style="position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:40;background:' + themeStyles.bg + ';color:' + themeStyles.color + ';padding:10px 22px;border-radius:9999px;font-weight:800;font-size:13.5px;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,0.45);text-align:center;white-space:nowrap;max-width:92%;transition:transform 0.15s ease-out;animation:vtPulse 2s infinite;">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>' +
          '<span style="font-weight:800;letter-spacing:-0.2px;">' + smartAutoplayText + '</span>' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' +
        '</div>' +

        // Tag <video> padrão HLS
        '<video id="' + instanceId + '-video" ' +
          'playsinline webkit-playsinline muted autoplay preload="metadata" ' +
          (posterUrl ? 'poster="' + posterUrl + '" ' : '') +
          'style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;" ' +
          'oncontextmenu="return false;">' +
        '</video>' +

        // Iframe Fallback (Invisível até ser acionado se houver 403 / CORS no Bunny)
        '<iframe id="' + instanceId + '-iframe" ' +
          'src="https://iframe.mediadelivery.net/embed/' + libraryId + '/' + videoId + '?autoplay=true&loop=false&muted=true&preload=true&responsive=true" ' +
          'style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;border:0;background:#000;" ' +
          'allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowfullscreen>' +
        '</iframe>' +

        // ThumbSniper Overlay
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

        // Barra de progresso VSL
        '<div id="' + instanceId + '-progress-bg" style="position:absolute;bottom:0;left:0;width:100%;height:5px;background:rgba(255,255,255,0.25);z-index:30;cursor:pointer;">' +
          '<div id="' + instanceId + '-progress-bar" style="height:100%;width:0%;background:' + primaryColor + ';transition:width 0.15s linear;"></div>' +
        '</div>' +
      '</div>';

    if (!document.getElementById('veloturb-keyframes')) {
      var styleEl = document.createElement('style');
      styleEl.id = 'veloturb-keyframes';
      styleEl.innerHTML =
        '@keyframes vtTap { 0%{transform:translateY(0) scale(1);} 30%{transform:translateY(-8px) scale(1.1);} 50%{transform:translateY(2px) scale(0.92);} 70%{transform:translateY(-4px) scale(1.05);} 100%{transform:translateY(0) scale(1);} }' +
        '@keyframes vtPulse { 0%,100%{transform:translateX(-50%) scale(1);} 50%{transform:translateX(-50%) scale(1.03);box-shadow:0 6px 22px rgba(0,0,0,0.5);} }';
      document.head.appendChild(styleEl);
    }

    var video = document.getElementById(instanceId + '-video');
    var iframe = document.getElementById(instanceId + '-iframe');
    var unmuteBtn = document.getElementById(instanceId + '-unmute');
    var progressBar = document.getElementById(instanceId + '-progress-bar');
    var progressBg = document.getElementById(instanceId + '-progress-bg');
    var thumbsniper = document.getElementById(instanceId + '-thumbsniper');

    var isIframeMode = false;
    var hlsInstance = null;
    var pitchTriggered = false;

    // Ativa o modo Iframe Bunny quando CORS / 403 bloqueia a URL direta
    function activateIframeFallback() {
      if (isIframeMode) return;
      isIframeMode = true;
      console.log('[VeloTurb] Ativando Bunny Embed Engine com proteção VeloTurb...');
      if (video) {
        video.style.display = 'none';
        video.pause();
      }
      if (iframe) {
        iframe.style.display = 'block';
      }
      if (hlsInstance) {
        try { hlsInstance.destroy(); } catch (e) {}
        hlsInstance = null;
      }
    }

    if (videoType === 'hls') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSrc;
        video.addEventListener('error', function() {
          activateIframeFallback();
        });
      } else {
        loadHlsScript(function() {
          if (!window.Hls || !window.Hls.isSupported()) {
            activateIframeFallback();
            return;
          }

          var hls = new window.Hls({
            startLevel: -1,
            capLevelToPlayerSize: true,
            maxBufferLength: 30,
            enableWorker: true
          });
          hlsInstance = hls;

          hls.loadSource(videoSrc);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(function() {
              video.muted = true;
              video.play();
            });
          });

          hls.on(window.Hls.Events.ERROR, function(event, data) {
            console.warn('[VeloTurb] Erro HLS:', data.type, data.details);
            if (data.fatal) {
              // Se falhar a leitura direta da URL HLS por 403 ou CORS, cai no Bunny Iframe automaticamente!
              activateIframeFallback();
            }
          });
        });
      }
    } else {
      video.src = videoSrc;
      video.play().catch(function() {
        video.muted = true;
        video.play();
      });
    }

    // Unmute Action: Reinicia do 00:00 com áudio ativado
    function activateAudioAndRestart() {
      if (isIframeMode && iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: 0 }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } catch (e) {}
        if (unmuteBtn) unmuteBtn.style.display = 'none';
        return;
      }

      try {
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1;
        video.play();
        if (unmuteBtn) unmuteBtn.style.display = 'none';
      } catch (err) {}
    }

    if (unmuteBtn) {
      unmuteBtn.onclick = function(e) {
        e.stopPropagation();
        activateAudioAndRestart();
      };
    }

    video.onclick = function() {
      if (video.muted || (unmuteBtn && unmuteBtn.style.display !== 'none')) {
        activateAudioAndRestart();
      } else if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    };

    if (thumbsniper) {
      video.addEventListener('pause', function() {
        if (!video.ended && video.currentTime > 0.5) {
          thumbsniper.style.display = 'flex';
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

    function updateProgress() {
      if (progressBar && video.duration) {
        var pct = (video.currentTime / video.duration) * 100;
        var fakePct = Math.min(100, Math.pow(pct / 100, 0.55) * 100);
        progressBar.style.width = fakePct + '%';
      }

      if (pitchDelay > 0 && video.currentTime >= pitchDelay && !pitchTriggered) {
        pitchTriggered = true;
        window.dispatchEvent(new CustomEvent('veloturb:pitch', { detail: { videoId: config.id } }));
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

    if (progressBg) {
      progressBg.onclick = function(e) {
        var rect = progressBg.getBoundingClientRect();
        var clickX = (e.clientX - rect.left) / rect.width;
        if (video.duration) {
          video.currentTime = clickX * video.duration;
        }
      };
    }
  }

  function scanAndInitPlayers() {
    var containers = document.querySelectorAll('[data-video-id], .veloturb-smartplayer, veloturb-smartplayer');
    for (var i = 0; i < containers.length; i++) {
      initPlayerInstance(containers[i]);
    }
  }

  window.VeloTurb = {
    version: '2.2.0',
    init: initPlayerInstance,
    scan: scanAndInitPlayers,
    detectVideoType: detectVideoType
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInitPlayers);
  } else {
    scanAndInitPlayers();
  }

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
