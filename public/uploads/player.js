/**
 * VeloTurb SmartPlayer - High Conversion VSL Player Runtime
 * Suporte a Bunny Stream HLS (.m3u8), Embed Iframe Fallback, MP4 Nativo,
 * Retomada Inteligente (Resume Playback) em Português e Espanhol LATAM,
 * e Isolamento de Linha (Full-Width Row Protection).
 * Versão: 2.4.0
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
    var inlineResume = container.getAttribute('data-resume') !== 'false';
    var inlineResumeLang = container.getAttribute('data-resume-lang') || 'pt';

    var autoplayShape = container.getAttribute('data-autoplay-shape') || 'pill';
    var autoplayPos = container.getAttribute('data-autoplay-pos') || 'top';
    var autoplayOpacity = parseInt(container.getAttribute('data-autoplay-opacity') || '100', 10);
    var autoplaySubtext = '';
    try { autoplaySubtext = decodeURIComponent(container.getAttribute('data-autoplay-subtext') || ''); } catch (e) {}

    var tsEnabled = container.getAttribute('data-thumbsniper-enabled') !== 'false';
    var tsTemplate = container.getAttribute('data-thumbsniper-template') || 'ts_01';
    var tsHeadline = '';
    var tsSubheadline = '';
    var tsButton = '';
    try { tsHeadline = decodeURIComponent(container.getAttribute('data-thumbsniper-headline') || ''); } catch (e) {}
    try { tsSubheadline = decodeURIComponent(container.getAttribute('data-thumbsniper-subheadline') || ''); } catch (e) {}
    try { tsButton = decodeURIComponent(container.getAttribute('data-thumbsniper-button') || ''); } catch (e) {}
    var tsColor = container.getAttribute('data-thumbsniper-color') || '#EF4444';
    var tsCustom = container.getAttribute('data-thumbsniper-custom') || '';
    var tsLang = container.getAttribute('data-thumbsniper-lang') || (inlineResumeLang === 'es' ? 'es' : 'pt');

    // Configuração base obtida dos atributos inline (fallback imediato)
    var fallbackConfig = {
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
      smartAutoplayShape: autoplayShape,
      smartAutoplayPosition: autoplayPos,
      smartAutoplayOpacity: autoplayOpacity,
      smartAutoplaySubtext: autoplaySubtext,
      resumePlayback: inlineResume,
      resumePlaybackLanguage: inlineResumeLang,
      onlyProgressBar: true,
      thumbSniper: {
        enabled: tsEnabled,
        templateId: tsTemplate,
        headline: tsHeadline,
        subheadline: tsSubheadline,
        buttonText: tsButton,
        buttonColor: tsColor,
        customMediaUrl: tsCustom,
        language: tsLang
      }
    };

    // Detecta a URL do servidor VeloTurb pelo script tag
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

    // Busca configurações mais recentes ao vivo da API (NÃO precisa colar novo código ao alterar!)
    if (videoId && apiBase) {
      var controller = window.AbortController ? new AbortController() : null;
      var timeoutId = controller ? setTimeout(function() { controller.abort(); }, 1800) : null;

      fetch(apiBase + '/api/videos/' + encodeURIComponent(videoId) + '?_t=' + Date.now(), {
        mode: 'cors',
        headers: { 'Cache-Control': 'no-cache, no-store' },
        signal: controller ? controller.signal : undefined
      })
      .then(function(res) {
        if (timeoutId) clearTimeout(timeoutId);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(serverConfig) {
        // As alterações salvas no app VeloTurb sobrescrevem os atributos estáticos antigos da página!
        var merged = Object.assign({}, fallbackConfig, serverConfig);
        if (serverConfig.settings) {
          if (serverConfig.settings.primaryColor) merged.primaryColor = serverConfig.settings.primaryColor;
          if (serverConfig.settings.smartAutoplayText) merged.smartAutoplayText = serverConfig.settings.smartAutoplayText;
          if (serverConfig.settings.smartAutoplayTheme) merged.smartAutoplayTheme = serverConfig.settings.smartAutoplayTheme;
          if (serverConfig.settings.smartAutoplayShape) merged.smartAutoplayShape = serverConfig.settings.smartAutoplayShape;
          if (serverConfig.settings.smartAutoplayPosition) merged.smartAutoplayPosition = serverConfig.settings.smartAutoplayPosition;
          if (serverConfig.settings.smartAutoplayOpacity !== undefined) merged.smartAutoplayOpacity = serverConfig.settings.smartAutoplayOpacity;
          if (serverConfig.settings.smartAutoplaySubtext !== undefined) merged.smartAutoplaySubtext = serverConfig.settings.smartAutoplaySubtext;
          if (serverConfig.settings.pitchDelaySeconds !== undefined) merged.pitchDelay = serverConfig.settings.pitchDelaySeconds;
          if (serverConfig.settings.resumePlayback !== undefined) merged.resumePlayback = serverConfig.settings.resumePlayback;
          if (serverConfig.settings.resumePlaybackLanguage) merged.resumePlaybackLanguage = serverConfig.settings.resumePlaybackLanguage;
          if (serverConfig.settings.resumePlaybackTitle) merged.resumePlaybackTitle = serverConfig.settings.resumePlaybackTitle;
          if (serverConfig.settings.resumePlaybackContinueText) merged.resumePlaybackContinueText = serverConfig.settings.resumePlaybackContinueText;
          if (serverConfig.settings.resumePlaybackRestartText) merged.resumePlaybackRestartText = serverConfig.settings.resumePlaybackRestartText;
          if (serverConfig.settings.thumbSniper) merged.thumbSniper = serverConfig.settings.thumbSniper;
        }
        renderPlayer(container, merged);
      })
      .catch(function(err) {
        // Fallback imediato se offline
        console.warn('[VeloTurb] Usando fallback local:', err);
        renderPlayer(container, fallbackConfig);
      });
    } else {
      renderPlayer(container, fallbackConfig);
    }
  }

  function renderPlayer(container, config) {
    var instanceId = 'vt_' + (config.id || Math.random().toString(36).substring(2, 9));
    var primaryColor = config.primaryColor || (config.settings && config.settings.primaryColor) || '#E11D48';
    var smartAutoplayText = config.smartAutoplayText || (config.settings && config.settings.smartAutoplayText) || 'Seu vídeo já começou! Clique para ouvir áudio';
    var smartAutoplayTheme = config.smartAutoplayTheme || (config.settings && config.settings.smartAutoplayTheme) || 'yellow';
    var smartAutoplayShape = config.smartAutoplayShape || (config.settings && config.settings.smartAutoplayShape) || 'pill';
    var smartAutoplayPos = config.smartAutoplayPosition || (config.settings && config.settings.smartAutoplayPosition) || 'top';
    var smartAutoplayOpacity = config.smartAutoplayOpacity !== undefined ? config.smartAutoplayOpacity : (config.settings && config.settings.smartAutoplayOpacity !== undefined ? config.settings.smartAutoplayOpacity : 100);
    var smartAutoplaySubtext = config.smartAutoplaySubtext || (config.settings && config.settings.smartAutoplaySubtext) || '';

    var pitchDelay = config.pitchDelaySeconds || config.pitchDelay || (config.settings && config.settings.pitchDelaySeconds) || 500;

    var resumeEnabled = config.resumePlayback !== false && (config.settings ? config.settings.resumePlayback !== false : true);
    var resumeLang = config.resumePlaybackLanguage || (config.settings && config.settings.resumePlaybackLanguage) || 'pt';
    var isSpanish = resumeLang === 'es';

    var resumeTexts = {
      title: config.resumePlaybackTitle || (config.settings && config.settings.resumePlaybackTitle) || (isSpanish ? 'Ya has comenzado a ver este video' : 'Você já começou a assistir esse vídeo'),
      continueBtn: config.resumePlaybackContinueText || (config.settings && config.settings.resumePlaybackContinueText) || (isSpanish ? '¿Continuar viendo?' : 'Continuar assistindo?'),
      restartBtn: config.resumePlaybackRestartText || (config.settings && config.settings.resumePlaybackRestartText) || (isSpanish ? '¿Ver desde el inicio?' : 'Assistir do início?')
    };

    // ThumbSniper Settings & copy (Spanish vs Portuguese)
    var tsObj = config.thumbSniper || (config.settings && config.settings.thumbSniper) || {};
    var tsEnabled = tsObj.enabled !== false;
    var tsLang = tsObj.language || (isSpanish ? 'es' : 'pt');
    var isSpanishTs = tsLang === 'es' || ['ts_05', 'ts_06', 'ts_07', 'ts_08'].indexOf(tsObj.templateId || '') !== -1;

    var tsHeadline = tsObj.headline || (isSpanishTs ? '¡Este video saldrá del aire pronto!' : 'Este vídeo ficará fora do ar em breve!');
    var tsSubheadline = tsObj.subheadline || (isSpanishTs ? 'Esta es tu última oportunidad de verlo hasta el final.' : 'Essa é sua última chance de assistir até o final.');
    var tsButtonText = tsObj.buttonText || (isSpanishTs ? 'CONTINUAR VIENDO' : 'CONTINUAR ASSISTINDO');
    var tsButtonColor = tsObj.buttonColor || (isSpanishTs ? '#DC2626' : '#EF4444');
    var tsCustomMedia = tsObj.customMediaUrl || '';

    var libraryId = config.bunnyLibraryId || '802485';
    var videoId = config.bunnyVideoId || 'e0f24211-791e-4a84-99e9-1ac03bc1b5b7';
    var estimatedDuration = config.duration || 537;

    var themeStyles = {
      yellow: { bg: '#FACC15', color: '#000000' },
      black: { bg: '#09090B', color: '#FFFFFF' },
      red: { bg: '#E11D48', color: '#FFFFFF' },
      purple: { bg: '#8B5CF6', color: '#FFFFFF' },
      green: { bg: '#65A30D', color: '#FFFFFF' }
    }[smartAutoplayTheme] || { bg: '#FACC15', color: '#000000' };

    // Autoplay Banner Layout & Position Styles
    var posCss = '';
    var isFullWidth = smartAutoplayShape === 'full_width';
    switch (smartAutoplayPos) {
      case 'center': posCss = 'top:50%;left:50%;transform:translate(-50%, -50%);'; break;
      case 'bottom': posCss = 'bottom:22px;left:50%;transform:translateX(-50%);'; break;
      case 'top_left': posCss = 'top:12px;left:14px;'; break;
      case 'top_right': posCss = 'top:12px;right:14px;'; break;
      case 'bottom_left': posCss = 'bottom:22px;left:14px;'; break;
      case 'bottom_right': posCss = 'bottom:22px;right:14px;'; break;
      case 'top':
      default: posCss = 'top:12px;left:50%;transform:translateX(-50%);'; break;
    }

    var borderRadiusCss = 'border-radius:9999px;';
    switch (smartAutoplayShape) {
      case 'square': borderRadiusCss = 'border-radius:0px;'; break;
      case 'rounded': borderRadiusCss = 'border-radius:12px;'; break;
      case 'two_lines': borderRadiusCss = 'border-radius:14px;'; break;
      case 'full_width': borderRadiusCss = 'border-radius:0px;'; break;
      case 'minimal': borderRadiusCss = 'border-radius:8px;'; break;
    }

    var paddingCss = smartAutoplayShape === 'two_lines' ? 'padding:12px 24px;' : (smartAutoplayShape === 'minimal' ? 'padding:7px 15px;' : 'padding:10px 22px;');
    var widthCss = isFullWidth ? 'width:100%;max-width:100%;left:0;transform:none;' : 'max-width:92%;';
    var opacityCss = 'opacity:' + (smartAutoplayOpacity / 100) + ';';
    var flexDirCss = smartAutoplayShape === 'two_lines' ? 'flex-direction:column;' : '';

    // Estilos de isolamento total do container: NUNCA quebra o layout da página
    container.style.display = 'block';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.maxWidth = '100%';
    container.style.margin = '0 auto';
    container.style.clear = 'both';
    container.style.flex = '0 0 100%'; // Evita que containers flex joguem o CTA para o lado
    container.style.boxSizing = 'border-box';
    container.style.backgroundColor = '#000000';
    container.style.borderRadius = '8px';
    container.style.overflow = 'hidden';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    container.style.userSelect = 'none';

    var videoSrc = config.src || config.videoUrl || '';
    var videoType = config.type || detectVideoType(videoSrc);
    var posterUrl = config.poster || config.thumbnailUrl || '';

    // Verifica progresso gravado no localStorage
    var savedTime = 0;
    var storageKey = 'veloturb_time_' + (config.id || videoId);
    if (resumeEnabled) {
      try {
        var s = localStorage.getItem(storageKey);
        if (s) savedTime = parseFloat(s);
      } catch (e) {}
    }
    var shouldShowResumePrompt = resumeEnabled && savedTime > 5;

    // Injeta CSS para esconder botões de CTA com as classes padrão do mercado
    if (pitchDelay > 0 && !document.getElementById('veloturb-pitch-hide-style')) {
      var pitchStyle = document.createElement('style');
      pitchStyle.id = 'veloturb-pitch-hide-style';
      pitchStyle.innerHTML =
        '.esconder, .esconder-pitch, .delay, .ocultar, .veloturb-pitch, [data-veloturb-pitch], [data-pitch] { display: none !important; }' +
        '@keyframes veloturbFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }';
      document.head.appendChild(pitchStyle);
    }

    // Renderiza Player com suporte dual + Card Laranja de Retomada Inteligente (image_8f1ffac5.png)
    container.innerHTML =
      '<div id="' + instanceId + '-box" style="position:relative;width:100%;padding-bottom:56.25%;height:0;background:#000;clear:both;">' +
        // Smart Autoplay Banner com Posicionamento, Formato e Opacidade customizáveis
        '<div id="' + instanceId + '-unmute" style="display:' + (shouldShowResumePrompt ? 'none' : 'flex') + ';position:absolute;' + posCss + widthCss + opacityCss + flexDirCss + 'z-index:40;background:' + themeStyles.bg + ';color:' + themeStyles.color + ';' + paddingCss + borderRadiusCss + 'font-weight:800;font-size:13.5px;align-items:center;justify-content:center;gap:8px;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,0.45);text-align:center;white-space:nowrap;transition:transform 0.15s ease-out;animation:vtPulse 2s infinite;">' +
          '<div style="display:flex;align-items:center;justify-content:center;gap:8px;">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>' +
            '<span style="font-weight:800;letter-spacing:-0.2px;">' + smartAutoplayText + '</span>' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' +
          '</div>' +
          (smartAutoplayShape === 'two_lines' ? '<div style="font-size:11px;opacity:0.92;font-weight:600;margin-top:2px;">' + (smartAutoplaySubtext || (isSpanishTs ? 'Haz clic para escuchar el audio 🔊' : 'Clique aqui para ativar o áudio 🔊')) + '</div>' : '') +
        '</div>' +

        // Card Laranja de Retomada Inteligente (Exatamente o modelo VTurb de image_8f1ffac5.png)
        '<div id="' + instanceId + '-resume" style="display:' + (shouldShowResumePrompt ? 'flex' : 'none') + ';position:absolute;inset:0;background:rgba(0,0,0,0.65);z-index:50;align-items:center;justify-content:center;padding:12px;cursor:default;">' +
          '<div style="width:100%;max-width:560px;background:#eb6b09;border-radius:18px;padding:30px 20px;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.6);border:1px solid rgba(255,255,255,0.25);position:relative;">' +
            '<h3 style="color:#ffffff;font-size:21px;font-weight:800;margin:0 0 26px 0;line-height:1.2;letter-spacing:-0.4px;">' +
              resumeTexts.title +
            '</h3>' +
            '<div style="display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;">' +
              // Botão Continuar Assistindo?
              '<div id="' + instanceId + '-btn-continue" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 10px;border-radius:10px;transition:transform 0.15s ease;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
                '<div style="width:42px;height:42px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="2" style="margin-left:2px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>' +
                '</div>' +
                '<span style="color:#ffffff;font-weight:800;font-size:15px;white-space:nowrap;">' +
                  resumeTexts.continueBtn +
                '</span>' +
              '</div>' +
              // Botão Assistir do Início?
              '<div id="' + instanceId + '-btn-restart" style="display:flex;align-items:center;gap:10px;cursor:pointer;padding:6px 10px;border-radius:10px;transition:transform 0.15s ease;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
                '<div style="width:42px;height:42px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>' +
                '</div>' +
                '<span style="color:#ffffff;font-weight:800;font-size:15px;white-space:nowrap;">' +
                  resumeTexts.restartBtn +
                '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Tag <video> padrão HLS
        '<video id="' + instanceId + '-video" ' +
          'playsinline webkit-playsinline muted ' + (shouldShowResumePrompt ? '' : 'autoplay') + ' preload="metadata" ' +
          (posterUrl ? 'poster="' + posterUrl + '" ' : '') +
          'style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;" ' +
          'oncontextmenu="return false;">' +
        '</video>' +

        // Iframe Fallback (pointer-events:none para permitir clique no player)
        '<iframe id="' + instanceId + '-iframe" ' +
          'src="https://iframe.mediadelivery.net/embed/' + libraryId + '/' + videoId + '?autoplay=' + (shouldShowResumePrompt ? 'false' : 'true') + '&loop=false&muted=true&preload=true&responsive=true" ' +
          'style="display:none;position:absolute;top:0;left:0;width:100%;height:100%;border:0;background:#000;pointer-events:none;" ' +
          'allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowfullscreen>' +
        '</iframe>' +

        // Camada transparente interceptadora de cliques no vídeo e iframe
        '<div id="' + instanceId + '-click-capture" style="position:absolute;inset:0;z-index:20;cursor:pointer;"></div>' +

        // ThumbSniper Overlay (Com textos em Espanhol ou Português reais salvos na configuração)
        '<div id="' + instanceId + '-thumbsniper" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.85);z-index:45;align-items:center;justify-content:center;padding:15px;cursor:pointer;text-align:center;">' +
          '<div style="background:#09090b;border:1px solid #27272a;border-radius:14px;padding:22px 18px;max-width:360px;width:100%;box-shadow:0 20px 40px rgba(0,0,0,0.8);">' +
            (tsCustomMedia ? '<img src="' + tsCustomMedia + '" style="max-width:100%;max-height:220px;border-radius:10px;margin-bottom:12px;object-fit:contain;" />' : '') +
            '<div style="font-size:28px;margin-bottom:8px;">✋</div>' +
            '<h4 style="color:#ffffff;font-size:15px;font-weight:800;text-transform:uppercase;margin:0 0 6px 0;line-height:1.2;">' + tsHeadline + '</h4>' +
            '<p style="color:#a1a1aa;font-size:12px;margin:0 0 16px 0;">' + tsSubheadline + '</p>' +
            '<div style="position:relative;display:inline-block;width:100%;">' +
              '<button style="width:100%;background:' + tsButtonColor + ';color:#ffffff;font-weight:800;font-size:13px;text-transform:uppercase;padding:12px;border-radius:10px;border:none;cursor:pointer;box-shadow:0 4px 15px rgba(239,68,68,0.5);">' + tsButtonText + '</button>' +
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
        '@keyframes vtPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.03);box-shadow:0 6px 22px rgba(0,0,0,0.5);} }';
      document.head.appendChild(styleEl);
    }

    var video = document.getElementById(instanceId + '-video');
    var iframe = document.getElementById(instanceId + '-iframe');
    var clickCapture = document.getElementById(instanceId + '-click-capture');
    var unmuteBtn = document.getElementById(instanceId + '-unmute');
    var resumeBox = document.getElementById(instanceId + '-resume');
    var btnContinue = document.getElementById(instanceId + '-btn-continue');
    var btnRestart = document.getElementById(instanceId + '-btn-restart');
    var progressBar = document.getElementById(instanceId + '-progress-bar');
    var progressBg = document.getElementById(instanceId + '-progress-bg');
    var thumbsniper = document.getElementById(instanceId + '-thumbsniper');

    var isIframeMode = false;
    var hlsInstance = null;
    var pitchTriggered = false;
    var currentPlaybackSeconds = 0;
    var isPlaying = !shouldShowResumePrompt;

    function activateIframeFallback() {
      if (isIframeMode) return;
      isIframeMode = true;
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
            if (!shouldShowResumePrompt) {
              video.play().catch(function() {
                video.muted = true;
                video.play();
              });
            }
          });

          hls.on(window.Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
              activateIframeFallback();
            }
          });
        });
      }
    } else {
      video.src = videoSrc;
      if (!shouldShowResumePrompt) {
        video.play().catch(function() {
          video.muted = true;
          video.play();
        });
      }
    }

    // Revela CTA quando o tempo de pitch for atingido
    function triggerPitchReveal() {
      if (pitchTriggered) return;
      pitchTriggered = true;
      console.log('[VeloTurb] Pitch Delay alcançado (' + pitchDelay + 's)! Revelando CTA.');
      window.dispatchEvent(new CustomEvent('veloturb:pitch', { detail: { videoId: config.id } }));

      var hideStyle = document.getElementById('veloturb-pitch-hide-style');
      if (hideStyle) {
        try { hideStyle.remove(); } catch (e) {}
      }

      var pitchElements = document.querySelectorAll('.esconder, .esconder-pitch, .delay, .ocultar, .veloturb-pitch, [data-veloturb-pitch], [data-pitch]');
      for (var i = 0; i < pitchElements.length; i++) {
        var el = pitchElements[i];
        el.style.removeProperty('display');
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.clear = 'both';
        el.style.animation = 'veloturbFadeIn 0.8s ease-in-out forwards';
      }
    }

    function updateProgress(curr, dur) {
      var current = curr !== undefined ? curr : (isIframeMode ? currentPlaybackSeconds : (video ? video.currentTime : 0));
      var total = dur || (video && video.duration ? video.duration : estimatedDuration);

      // Salva progresso no localStorage a cada segundo
      if (resumeEnabled && current > 3) {
        try { localStorage.setItem(storageKey, current.toString()); } catch (e) {}
      }

      if (progressBar && total) {
        var pct = (current / total) * 100;
        var fakePct = Math.min(100, Math.pow(pct / 100, 0.55) * 100);
        progressBar.style.width = fakePct + '%';
      }

      if (pitchDelay > 0 && current >= pitchDelay) {
        triggerPitchReveal();
      }
    }

    // Interações do Card de Retomada Inteligente
    if (btnContinue) {
      btnContinue.onclick = function(e) {
        e.stopPropagation();
        shouldShowResumePrompt = false; // CRÍTICO: Desbloqueia cliques e permite pausar
        if (resumeBox) resumeBox.style.display = 'none';
        if (unmuteBtn) unmuteBtn.style.display = 'none';
        if (thumbsniper) thumbsniper.style.display = 'none';
        isPlaying = true;

        if (isIframeMode && iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: savedTime }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
          } catch (err) {}
          currentPlaybackSeconds = savedTime;
        } else if (video) {
          video.currentTime = savedTime;
          video.muted = false;
          video.volume = 1;
          video.play();
        }

        if (pitchDelay > 0 && savedTime >= pitchDelay) {
          triggerPitchReveal();
        }
      };
    }

    if (btnRestart) {
      btnRestart.onclick = function(e) {
        e.stopPropagation();
        shouldShowResumePrompt = false; // CRÍTICO: Desbloqueia cliques e permite pausar
        if (resumeBox) resumeBox.style.display = 'none';
        if (unmuteBtn) unmuteBtn.style.display = 'none';
        if (thumbsniper) thumbsniper.style.display = 'none';
        try { localStorage.removeItem(storageKey); } catch (err) {}
        isPlaying = true;

        if (isIframeMode && iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: 0 }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
          } catch (err) {}
          currentPlaybackSeconds = 0;
        } else if (video) {
          video.currentTime = 0;
          video.muted = false;
          video.volume = 1;
          video.play();
        }
      };
    }

    // Listener para o iframe Bunny Stream via window.message
    window.addEventListener('message', function(e) {
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data && (data.event === 'timeupdate' || data.method === 'timeupdate')) {
          var sec = data.value && typeof data.value.seconds === 'number' ? data.value.seconds : data.value;
          if (typeof sec === 'number') {
            currentPlaybackSeconds = sec;
            updateProgress(sec, estimatedDuration);
          }
        }
      } catch (err) {}
    });

    setInterval(function() {
      if (isIframeMode && isPlaying && !shouldShowResumePrompt) {
        currentPlaybackSeconds += 1;
        updateProgress(currentPlaybackSeconds, estimatedDuration);
      }
    }, 1000);

    // Unmute Action: Reinicia do 00:00 com áudio ativado
    function activateAudioAndRestart() {
      if (shouldShowResumePrompt) return;
      isPlaying = true;
      if (unmuteBtn) unmuteBtn.style.display = 'none';
      if (thumbsniper) thumbsniper.style.display = 'none';

      if (isIframeMode && iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: 0 }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'unmute' }), '*');
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
        } catch (e) {}
        currentPlaybackSeconds = 0;
        return;
      }

      try {
        video.currentTime = 0;
        video.muted = false;
        video.volume = 1;
        video.play();
      } catch (err) {}
    }

    if (unmuteBtn) {
      unmuteBtn.onclick = function(e) {
        e.stopPropagation();
        activateAudioAndRestart();
      };
    }

    // Handler universal de clique no vídeo (funciona no nativo e no Bunny Iframe)
    function handleMediaClick(e) {
      if (e && e.stopPropagation) e.stopPropagation();
      if (shouldShowResumePrompt) return;

      // Se o banner de áudio ainda está aberto, o clique inicial ativa o áudio
      if (unmuteBtn && unmuteBtn.style.display !== 'none') {
        activateAudioAndRestart();
        return;
      }

      // Alternar Play / Pause
      if (isPlaying) {
        // Pausar
        if (isIframeMode && iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
          } catch (err) {}
        } else if (video) {
          video.pause();
        }
        isPlaying = false;
        if (thumbsniper) {
          thumbsniper.style.display = 'flex';
        }
      } else {
        // Retomar Play
        if (isIframeMode && iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
          } catch (err) {}
        } else if (video) {
          video.play();
        }
        isPlaying = true;
        if (thumbsniper) {
          thumbsniper.style.display = 'none';
        }
      }
    }

    if (clickCapture) {
      clickCapture.onclick = handleMediaClick;
    }
    if (video) {
      video.onclick = handleMediaClick;
    }

    if (thumbsniper) {
      video.addEventListener('pause', function() {
        isPlaying = false;
        if (!shouldShowResumePrompt && !video.ended && video.currentTime > 0.5) {
          thumbsniper.style.display = 'flex';
        }
      });
      video.addEventListener('play', function() {
        isPlaying = true;
        thumbsniper.style.display = 'none';
      });
      thumbsniper.onclick = function(e) {
        e.stopPropagation();
        if (isIframeMode && iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
          } catch (err) {}
        } else if (video) {
          video.play();
        }
        isPlaying = true;
        thumbsniper.style.display = 'none';
      };
    }

    video.addEventListener('timeupdate', function() {
      updateProgress(video.currentTime, video.duration);
    });
    video.addEventListener('loadedmetadata', function() {
      updateProgress(video.currentTime, video.duration);
    });

    if (progressBg) {
      progressBg.onclick = function(e) {
        var rect = progressBg.getBoundingClientRect();
        var clickX = (e.clientX - rect.left) / rect.width;
        if (isIframeMode && iframe && iframe.contentWindow) {
          var targetSec = clickX * estimatedDuration;
          currentPlaybackSeconds = targetSec;
          iframe.contentWindow.postMessage(JSON.stringify({ method: 'setCurrentTime', value: targetSec }), '*');
        } else if (video.duration) {
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
    version: '2.4.0',
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
